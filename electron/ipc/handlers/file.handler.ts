import { ipcMain, dialog } from "electron";
import fs from "fs";
import { BaseHandler } from "./base.handler";
import { IExportService } from "../../interfaces/export-service.interface";

export class FileHandler extends BaseHandler {
  private exportService: IExportService;
  private formatters: { http: any };

  constructor(exportService: IExportService, formatters: { http: any }) {
    super();
    this.exportService = exportService;
    this.formatters = formatters;
  }

  register(): void {
    ipcMain.handle("dialog:openDirectory", async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      return canceled ? null : filePaths[0];
    });

    ipcMain.handle("dialog:openFile", async (_event, filters: any[]) => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: filters || [],
      });
      return canceled ? null : filePaths[0];
    });

    ipcMain.handle("dialog:saveLocation", async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Onde salvar os arquivos convertidos?",
        properties: ["openDirectory", "createDirectory"],
      });
      return canceled ? null : filePaths[0];
    });

    ipcMain.handle("save-file", async (_event, { content, defaultPath }: { content: any; defaultPath: string }) => {
      return this._handleFileSave(content, defaultPath);
    });

    ipcMain.handle("read-json-file", async (_event, filePath: string) => {
      try {
        const content = await fs.promises.readFile(filePath, "utf8");
        return JSON.parse(content);
      } catch (error) {
        console.error("[FileHandler] Erro ao ler JSON:", error);
        throw error;
      }
    });

    ipcMain.handle(
      "export-http",
      async (_event, { content: collectionData, defaultPath }: { content: any; defaultPath: string }) => {
        const formatter = this.formatters.http;
        const content = formatter.format(collectionData);
        return this._handleFileSave(content, defaultPath, [
          { name: "HTTP Files", extensions: ["http"] },
          { name: "Text Files", extensions: ["txt"] },
        ]);
      }
    );
  }

  private async _handleFileSave(content: any, defaultPath: string, filters?: any[]): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const isString = typeof content === "string";
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Salvar Arquivo",
        defaultPath:
          defaultPath || (isString ? "request.http" : "colecao.json"),
        filters: filters || [{ name: "JSON Files", extensions: ["json"] }],
      });

      if (canceled || !filePath) return { success: false };

      if (isString) {
        await fs.promises.writeFile(filePath, content, "utf8");
      } else {
        await this.exportService.exportJson(filePath, content);
      }
      return { success: true, filePath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
