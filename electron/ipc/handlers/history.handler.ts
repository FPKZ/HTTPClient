import { ipcMain } from "electron";
import { BaseHandler } from "./base.handler";
import { IHistoryService } from "../../interfaces/history-service.interface";
import { IWindowManager } from "../../interfaces/window-manager.interface";
import { IAppMessenger } from "../../interfaces/app-messenger.interface";

export class HistoryHandler extends BaseHandler {
  private history: IHistoryService;
  private win: IWindowManager;
  private messenger: IAppMessenger;

  constructor(
    historyService: IHistoryService,
    windowManager: IWindowManager,
    messenger: IAppMessenger
  ) {
    super();
    this.history = historyService;
    this.win = windowManager;
    this.messenger = messenger;
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
        this.messenger.broadcast("database-change", { entity: "collection", id: collectionData.id });
      }
      this.win.forceCloseApp();
    });

    ipcMain.handle("save-history", async (_event, collectionData: any) => {
      if (collectionData && collectionData.name) {
        const res = await this.history.saveHistory(collectionData);
        this.messenger.broadcast("database-change", { entity: "collection", id: collectionData.id });
        return res;
      }
    });

    ipcMain.handle("delete-history-item", async (_event, id: string) => {
      const res = await this.history.deleteHistoryItem(id);
      this.messenger.broadcast("database-change", { entity: "collection", id });
      return res;
    });
    
    ipcMain.handle("delete-all-history", async () => {
      const res = await this.history.deleteAllHistory();
      this.messenger.broadcast("database-change", { entity: "collection", id: "all" });
      return res;
    });
    
    ipcMain.handle("get-request-details", (_event, id: string) =>
      this.history.getRequestDetails(id)
    );

    ipcMain.handle("save-request-details", async (_event, { id, data }: { id: string; data: any }) => {
      const res = await this.history.saveRequestDetails(id, data);
      this.messenger.broadcast("database-change", { 
        entity: "request", 
        action: "update",
        id, 
        data: { name: data.name, method: data.method }
      });
      return res;
    });
  }
}

