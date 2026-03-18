const path = require("path");

/**
 * HistoryService
 * Orquestra a persistência do histórico e coleções.
 * Atualizado para utilizar o DB Local (SQLite) via LocalDbProvider, mantendo StorageProvider como fallback de migração.
 */
class HistoryService {
  constructor(storageProvider, dbProvider, userService) {
    this.storage = storageProvider;
    this.dbProvider = dbProvider;
    this.userService = userService;
    this.historyFile = "history.json";
  }

  get db() {
    return this.dbProvider.getDb();
  }

  async getHistory() {
    try {
      // Pega o dono ativo
      const currentUser = this.userService?.getUser();
      const ownerId = currentUser ? currentUser.id : null;

      // Busca últimas coleções modificadas do banco de dados (SQLite)
      let queryStr = `
        SELECT id, name, data, updated_at as updatedAt
        FROM collections
      `;
      let params = [];
      
      if (ownerId) {
          queryStr += ` WHERE owner_id = ? `;
          params.push(ownerId);
      } else {
          queryStr += ` WHERE owner_id IS NULL `;
      }

      queryStr += ` ORDER BY updated_at DESC LIMIT 15`;

      const rows = this.db.prepare(queryStr).all(...params);

      let dbHistory = rows.map(row => {
        let description = '';
        try {
          if (row.data) {
            const parsed = JSON.parse(row.data);
            description = parsed.description || parsed.descricao || '';
          }
        } catch (e) {
          console.error("Erro ao fazer parse dos dados db:", e);
        }
        
        return {
          id: row.id,
          name: row.name,
          description: description,
          updatedAt: row.updatedAt,
          sourceType: "native",
          file: `${row.id}.json` // Mantido para UI compatibility
        };
      });

      // Busca do JSON legado como fallback
      const raw = (await this.storage.readJson(this.historyFile)) || [];
      const legacyHistory = raw.filter(item => !dbHistory.some(dbItem => dbItem.id === item.id)).map(item => {
        return {
          ...item,
          file: item.file === "native" ? `${item.id}.json` : item.file,
          sourceType: "native",
          descricao: item.descricao || "",
        };
      });

      return [...dbHistory, ...legacyHistory].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 15);
    } catch (error) {
      console.error("[HistoryService] Erro ao obter histórico:", error);
      return [];
    }
  }

  async getCollectionById(id, source = "local") {
    if (source === "online") {
      console.warn(`[HistoryService] Fonte online não implementada para id: ${id}`);
      return null;
    }

    try {
      // Tenta carregar do banco de dados primeiro
      const row = this.db.prepare(`
        SELECT data FROM collections WHERE id = ?
      `).get(id);

      if (row && row.data) {
        return JSON.parse(row.data);
      }
    } catch (error) {
      console.error("[HistoryService] Erro ao buscar id no banco de dados:", error);
    }

    // Fallback: carregar dos arquivos antigos JSON
    return await this.fallbackLoadFromStorage(id);
  }

  async fallbackLoadFromStorage(id) {
    const history = (await this.storage.readJson(this.historyFile)) || [];
    const item = history.find((h) => h.id === id);

    if (!item) {
      console.warn(`[HistoryService] Item não encontrado no histórico antigo para id: ${id}`);
      return null;
    }

    const collectionsPath = this.storage.getCollectionsPath();
    const filePath = path.join(collectionsPath, item.file);
    let result = await this.storage.readJson(filePath, true);

    if (!result) {
      const legacyPath = path.join(collectionsPath, "native");
      result = await this.storage.readJson(legacyPath, true);

      if (result) {
        const fs = require("fs");
        try {
          await fs.promises.rename(legacyPath, filePath);
        } catch (e) {}
      }
    }

    // Ao migrar a leitura, poderíamos salvar no SQLite aqui para cache progressivo.
    if (result) {
      await this.saveHistory(result); // Auto-migrate progressivo!
    }

    return result;
  }

  async saveHistory(collectionData) {
    try {
      const { id, name } = collectionData;
      const collectionId = id || Date.now().toString();
      const updatedName = name || "Unnamed Request";
      const dataString = JSON.stringify(collectionData);
      const updatedAt = new Date().toISOString();

      // Identifica o dono ativo 
      const currentUser = this.userService?.getUser();
      const ownerId = currentUser ? currentUser.id : null;

      const stmt = this.db.prepare(`
        INSERT INTO collections (id, name, data, updated_at, is_dirty, owner_id)
        VALUES (?, ?, ?, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name,
          data=excluded.data,
          updated_at=excluded.updated_at,
          is_dirty=1,
          owner_id=excluded.owner_id
      `);
      
      stmt.run(collectionId, updatedName, dataString, updatedAt, ownerId);
    } catch (error) {
      console.error("[HistoryService] Erro ao salvar histórico no SQLite:", error);
    }
  }

  async deleteHistoryItem(id) {
    try {
      // Deleta do DB
      const info = this.db.prepare(`DELETE FROM collections WHERE id = ?`).run(id);

      // Deleta do arquivo antigo para evitar vestígios
      const history = (await this.storage.readJson(this.historyFile)) || [];
      const index = history.findIndex((item) => item.id === id);
      if (index !== -1) {
        const item = history[index];
        const collectionPath = path.join(this.storage.getCollectionsPath(), item.file);
        await this.storage.deleteFile(collectionPath, true);
        history.splice(index, 1);
        await this.storage.writeJson(this.historyFile, history);
      }

      return info.changes > 0 || index !== -1;
    } catch (error) {
      console.error("[HistoryService] Erro ao deletar histórico:", error);
      return false;
    }
  }

  async deleteAllHistory() {
    try {
      // Limpa DB
      this.db.prepare(`DELETE FROM collections`).run();
      
      // Limpa arquivos
      await this.storage.deleteAll(this.storage.getCollectionsPath());
      await this.storage.writeJson(this.historyFile, []);
    } catch (error) {
      console.error("[HistoryService] Erro ao deletar todo o histórico:", error);
    }
  }

  _createNewHistoryItem(id, name, description, type, file) {
    return {
      id,
      name,
      description: description || "",
      updatedAt: new Date().toISOString(),
      sourceType: type,
      file,
    };
  }
}

module.exports = HistoryService;
