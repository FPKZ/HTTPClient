import { ipcMain } from "electron";
import { BaseHandler } from "./base.handler";
import { IHistoryService } from "../../interfaces/history-service.interface";
import { IWindowManager } from "../../interfaces/window-manager.interface";

export class HistoryHandler extends BaseHandler {
  private history: IHistoryService;
  private win: IWindowManager;

  constructor(historyService: IHistoryService, windowManager: IWindowManager) {
    super();
    this.history = historyService;
    this.win = windowManager;
  }

  register(): void {
    ipcMain.handle("get-history", () => this.history.getHistory());
    ipcMain.handle("get-collection-by-id", (_event, { id, source }: { id: string; source: 'local' | 'supabase' }) =>
      this.history.getCollectionById(id)
    );
    ipcMain.handle("get-collection-for-export", (_event, id: string) =>
      this.history.getCollectionForExport(id)
    );
    ipcMain.on("save-and-quit", async (_event, collectionData: any) => {
      if (collectionData && collectionData.name) {
        await this.history.saveHistory(collectionData);
      }
      this.win.forceCloseApp();
    });

    ipcMain.handle("save-history", (_event, collectionData: any) => {
      if (collectionData && collectionData.name) {
        return this.history.saveHistory(collectionData);
      }
    });

    ipcMain.handle("delete-history-item", (_event, id: string) =>
      this.history.deleteHistoryItem(id),
    );
    ipcMain.handle("delete-all-history", () => this.history.deleteAllHistory());
    
    ipcMain.handle("get-request-details", (_event, id: string) =>
      this.history.getRequestDetails(id)
    );

    ipcMain.handle("save-request-details", (_event, { id, data }: { id: string; data: any }) =>
      this.history.saveRequestDetails(id, data)
    );
  }
}
