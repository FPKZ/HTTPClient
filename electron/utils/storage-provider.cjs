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
    this.collectionsDir = path.join(this.userDataPath, "collections");
    // Inicialização síncrona no construtor é aceitável para diretórios base
    if (!fs.existsSync(this.collectionsDir)) {
      fs.mkdirSync(this.collectionsDir, { recursive: true });
    }
  }

  async ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  async readJson(fileName, isAbsolute = false) {
    const filePath = isAbsolute ? fileName : path.join(this.userDataPath, fileName);
    try {
      if (!fs.existsSync(filePath)) return null;
      const content = await fs.promises.readFile(filePath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      console.error(`Erro ao ler JSON em ${filePath}:`, error);
      return null;
    }
  }

  async writeJson(fileName, data, isAbsolute = false) {
    const filePath = isAbsolute ? fileName : path.join(this.userDataPath, fileName);
    try {
      await this.ensureDirectory(path.dirname(filePath));
      await fs.promises.writeFile(filePath, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Erro ao escrever JSON em ${filePath}:`, error);
      return false;
    }
  }

  async deleteFile(fileName, isAbsolute = false) {
    const filePath = isAbsolute ? fileName : path.join(this.userDataPath, fileName);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
    } catch (error) {
      console.error(`Erro ao deletar arquivo ${filePath}:`, error);
      return false;
    }
    return false;
  }

  async listJsonFiles(dir) {
    const absoluteDir = path.isAbsolute(dir) ? dir : path.join(this.userDataPath, dir);
    if (!fs.existsSync(absoluteDir)) return [];

    try {
      const files = await fs.promises.readdir(absoluteDir);
      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => path.join(absoluteDir, file));
    } catch (error) {
      console.error(`Erro ao listar arquivos em ${absoluteDir}:`, error);
      return [];
    }
  }

  async deleteAll(dirPath) {
    const arquivos = await fs.promises.readdir(dirPath);
    for (const arquivo of arquivos) {
      if (arquivo.endsWith(".json")) {
        await fs.promises.unlink(path.join(dirPath, arquivo));
      }
    }
  }

  getCollectionsPath() {
    return this.collectionsDir;
  }

  getDataDir() {
    return this.userDataPath;
  }
}

module.exports = StorageProvider;
