

/**
 * ExportService
 * Responsável exclusivamente por exportar dados para arquivos.
 * Segue o SRP ao isolar toda a complexidade de exportação.
 */
class ExportService {
    constructor(storageProvider) {
        this.storage = storageProvider;
    }

    exportJson(fileName, data, isAbsolute = true) {
        return this.storage.writeJson(fileName, data, isAbsolute);
    }
}

module.exports = ExportService;