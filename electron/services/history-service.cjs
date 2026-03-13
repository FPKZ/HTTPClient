const path = require("path");

/**
 * HistoryService
 * Orquestra a persistência do histórico e coleções.
 * Segue o OCP e DIP ao usar um StorageProvider para persistência.
 */
class HistoryService {
  constructor(storageProvider) {
    this.storage = storageProvider;
    this.historyFile = "history.json";
  }

  async getHistory() {
    const raw = (await this.storage.readJson(this.historyFile)) || [];
    let needsPersist = false;

    const history = raw.map((item) => {
      if (item.file === "native") {
        needsPersist = true;
        return {
          ...item,
          file: `${item.id}.json`,
          sourceType: "native",
          descricao: item.descricao || "",
        };
      }
      return item;
    });

    // Persiste a correção em disco para não depender do auto-repair sempre
    if (needsPersist) {
      await this.storage.writeJson(this.historyFile, history);
    }

    return history;
  }

  async getCollectionById(id, source = "local") {
    if (source === "online") {
      // Placeholder para futura integração online
      console.warn(`[HistoryService] Fonte online ainda não implementada para id: ${id}`);
      return null;
    }

    // Busca o item no index de histórico para obter o nome de arquivo real
    const history = await this.getHistory();
    const item = history.find((h) => h.id === id);

    if (!item) {
      console.warn(`[HistoryService] Item não encontrado no histórico para id: ${id}`);
      return null;
    }

    const collectionsPath = this.storage.getCollectionsPath();
    const filePath = path.join(collectionsPath, item.file);
    let result = await this.storage.readJson(filePath, true);

    // Fallback: tenta o arquivo legado (quando o bug salvava como "native")
    if (!result) {
      const legacyPath = path.join(collectionsPath, "native");
      result = await this.storage.readJson(legacyPath, true);

      if (result) {
        // Migra: renomeia o arquivo para o nome correto em disco
        const fs = require("fs");
        try {
          await fs.promises.rename(legacyPath, filePath);
          console.log(`[HistoryService] Arquivo migrado: native → ${item.file}`);
        } catch (e) {
          console.error(`[HistoryService] Falha ao migrar arquivo:`, e);
        }
      } else {
        console.warn(`[HistoryService] Arquivo não encontrado: ${filePath}`);
      }
    }

    return result;
  }

  async saveHistory(collectionData) {
    const history = await this.getHistory();
    const { id, name, items } = collectionData;
    let collectionId = id;
    let fileName;

    if (collectionId) {
      const index = history.findIndex((item) => item.id === collectionId);
      if (index !== -1) {
        fileName = history[index].file;
        const [existingItem] = history.splice(index, 1);
        existingItem.updatedAt = new Date().toISOString();
        existingItem.name = name;
        existingItem.description = collectionData.description || collectionData.descricao || "";
        history.unshift(existingItem);
      } else {
        fileName = `${collectionId}.json`;
        history.unshift(
          this._createNewHistoryItem(
            collectionId,
            name,
            collectionData.description || collectionData.descricao || "",
            "native",
            fileName,
          ),
        );
      }
    } else {
      collectionId = Date.now().toString();
      fileName = `${collectionId}.json`;
      history.unshift(
        this._createNewHistoryItem(
          collectionId,
          name,
          collectionData.description || collectionData.descricao || "",
          "native",
          fileName,
        ),
      );
    }

    // Salva o JSON da coleção
    const collectionPath = path.join(this.storage.getCollectionsPath(), fileName);
    await this.storage.writeJson(collectionPath, collectionData, true);

    // Limita o histórico
    if (history.length > 15) history.pop();

    // Salva o índice de histórico
    await this.storage.writeJson(this.historyFile, history);
  }

  async deleteHistoryItem(id) {
    const history = await this.getHistory();
    const index = history.findIndex((item) => item.id === id);

    if (index !== -1) {
      const item = history[index];
      const collectionPath = path.join(this.storage.getCollectionsPath(), item.file);

      await this.storage.deleteFile(collectionPath, true);
      history.splice(index, 1);
      await this.storage.writeJson(this.historyFile, history);
      return true;
    }
    return false;
  }

  async deleteAllHistory() {
    await this.storage.deleteAll(this.storage.getCollectionsPath());
    await this.storage.writeJson(this.historyFile, []);
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
