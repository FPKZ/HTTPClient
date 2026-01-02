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

  getHistory() {
    return this.storage.readJson(this.historyFile) || [];
  }

  loadCollection(fileName) {
    const filePath = path.join(this.storage.getCollectionsPath(), fileName);
    return this.storage.readJson(filePath, true);
  }

  saveHistory(collectionName, sourceType, content, existingId = null) {
    const history = this.getHistory();
    let collectionId = existingId;
    let fileName;

    if (collectionId) {
      const index = history.findIndex((item) => item.id === collectionId);
      if (index !== -1) {
        fileName = history[index].file;
        const [existingItem] = history.splice(index, 1);
        existingItem.updatedAt = new Date().toISOString();
        existingItem.collectionName = collectionName;
        history.unshift(existingItem);
      } else {
        collectionId = Date.now().toString();
        fileName = `${collectionId}.json`;
        history.unshift(this._createNewHistoryItem(collectionId, collectionName, sourceType, fileName));
      }
    } else {
      collectionId = Date.now().toString();
      fileName = `${collectionId}.json`;
      history.unshift(this._createNewHistoryItem(collectionId, collectionName, sourceType, fileName));
    }

    // Salva o JSON da coleção
    const collectionPath = path.join(this.storage.getCollectionsPath(), fileName);
    this.storage.writeJson(collectionPath, content, true);

    // Limita o histórico
    if (history.length > 15) history.pop();

    // Salva o índice de histórico
    this.storage.writeJson(this.historyFile, history);
  }

  deleteHistoryItem(id) {
    const history = this.getHistory();
    const index = history.findIndex((item) => item.id === id);

    if (index !== -1) {
      const item = history[index];
      const collectionPath = path.join(this.storage.getCollectionsPath(), item.file);
      
      this.storage.deleteFile(collectionPath, true);
      history.splice(index, 1);
      this.storage.writeJson(this.historyFile, history);
      return true;
    }
    return false;
  }

  _createNewHistoryItem(id, name, type, file) {
    return {
      id,
      collectionName: name,
      updatedAt: new Date().toISOString(),
      sourceType: type,
      file,
    };
  }
}

module.exports = HistoryService;
