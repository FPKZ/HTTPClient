const path = require('path');

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
    const history = (await this.storage.readJson(this.historyFile)) || [];
    // Auto-repair corrupted items (detect "native" as file)
    return history.map((item) => {
      if (item.file === "native") {
        return {
          ...item,
          file: `${item.id}.json`,
          sourceType: "native",
          // Tenta recuperar a descrição se ela foi salva errada no campo type
          descricao: item.descricao || (item.sourceType !== "native" ? item.sourceType : ""),
        };
      }
      return item;
    });
  }

  async loadCollection(fileName) {
    const isAbsolute = path.isAbsolute(fileName);
    const filePath = isAbsolute ? fileName : path.join(this.storage.getCollectionsPath(), fileName);
    console.log(`[HistoryService] Loading collection: ${fileName}`);
    console.log(`[HistoryService] Resolved path: ${filePath}`);
    const result = await this.storage.readJson(filePath, true);
    console.log(`[HistoryService] Result found: ${!!result}`);
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
        existingItem.descricao = collectionData.descricao || "";
        history.unshift(existingItem);
      } else {
        fileName = `${collectionId}.json`;
        history.unshift(this._createNewHistoryItem(collectionId, name, collectionData.descricao, "native", fileName));
      }
    } else {
      collectionId = Date.now().toString();
      fileName = `${collectionId}.json`;
      history.unshift(this._createNewHistoryItem(collectionId, name, collectionData.descricao, "native", fileName));
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

  _createNewHistoryItem(id, name, type, file) {
    return {
      id,
      name,
      updatedAt: new Date().toISOString(),
      sourceType: type,
      file,
    };
  }
}

module.exports = HistoryService;
