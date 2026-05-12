export interface IExportService {
  exportJson(fileName: string, data: any, isAbsolute?: boolean): Promise<boolean>;
}
