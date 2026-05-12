import { IExportService } from "../interfaces/export-service.interface";
import StorageProvider from "../utils/storage-provider";

/**
 * ExportService
 * Responsável exclusivamente por exportar dados para arquivos.
 * Segue o SRP ao isolar toda a complexidade de exportação.
 */
class ExportService implements IExportService {
  private storage: StorageProvider;

  constructor(storageProvider: StorageProvider) {
    this.storage = storageProvider;
  }

  exportJson(fileName: string, data: any, isAbsolute: boolean = true): Promise<boolean> {
    return this.storage.writeJson(fileName, data, isAbsolute);
  }
}

export default ExportService;