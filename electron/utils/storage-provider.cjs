const fs = require('fs');
const path = require('path');

/**
 * StorageProvider
 * Abstração para operações de sistema de arquivos.
 * Segue o SRP ao lidar apenas com persistência bruta.
 */
class StorageProvider {
  constructor(userDataPath) {
    this.userDataPath = userDataPath;
    this.collectionsDir = path.join(this.userDataPath, 'collections');
    this.ensureDirectory(this.collectionsDir);
  }

  ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  readJson(fileName, isAbsolute = false) {
    const filePath = isAbsolute ? fileName : path.join(this.userDataPath, fileName);
    if (!fs.existsSync(filePath)) return null;
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Erro ao ler JSON em ${filePath}:`, error);
      return null;
    }
  }

  writeJson(fileName, data, isAbsolute = false) {
    const filePath = isAbsolute ? fileName : path.join(this.userDataPath, fileName);
    try {
      this.ensureDirectory(path.dirname(filePath));
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Erro ao escrever JSON em ${filePath}:`, error);
      return false;
    }
  }

  deleteFile(fileName, isAbsolute = false) {
    const filePath = isAbsolute ? fileName : path.join(this.userDataPath, fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch (error) {
        console.error(`Erro ao deletar arquivo ${filePath}:`, error);
        return false;
      }
    }
    return false;
  }

  listJsonFiles(dir) {
    const absoluteDir = path.isAbsolute(dir) ? dir : path.join(this.userDataPath, dir);
    if (!fs.existsSync(absoluteDir)) return [];
    
    try {
      return fs.readdirSync(absoluteDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(absoluteDir, file));
    } catch (error) {
      console.error(`Erro ao listar arquivos em ${absoluteDir}:`, error);
      return [];
    }
  }

  getCollectionsPath() {
    return this.collectionsDir;
  }
}

module.exports = StorageProvider;
