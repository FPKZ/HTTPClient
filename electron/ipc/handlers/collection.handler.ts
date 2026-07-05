import { ipcMain } from "electron";
import { BaseHandler } from "./base.handler";
import { ICollectionService } from "../../interfaces/collection-service.interface";
import { IAppMessenger } from "../../interfaces/app-messenger.interface";

export class CollectionHandler extends BaseHandler {
  private collection: ICollectionService;
  private messenger: IAppMessenger;

  constructor(collectionService: ICollectionService, messenger: IAppMessenger) {
    super();
    this.collection = collectionService;
    this.messenger = messenger;
  }

  register(): void {
    ipcMain.handle("collections:create-folder", async (_event, { collectionId, parentId, name }) => {
      const res = await this.collection.createFolder(collectionId, parentId, name);
      if (res) {
        this.messenger.broadcast("database-change", {
          entity: "folder",
          action: "create",
          id: res.id,
          data: res,
        });
      }
      return res;
    });

    ipcMain.handle("collections:rename-item", async (_event, { id, type, name }) => {
      const success = await this.collection.renameItem(id, type, name);
      if (success) {
        this.messenger.broadcast("database-change", {
          entity: type,
          action: "update",
          id,
          data: { name },
        });
      }
      return success;
    });

    ipcMain.handle("collections:delete-folder", async (_event, { id }) => {
      const success = await this.collection.deleteFolder(id);
      if (success) {
        this.messenger.broadcast("database-change", {
          entity: "folder",
          action: "delete",
          id,
        });
      }
      return success;
    });

    ipcMain.handle("collections:create-request", async (_event, { collectionId, folderId, name }) => {
      const res = await this.collection.createRequest(collectionId, folderId, name);
      if (res) {
        this.messenger.broadcast("database-change", {
          entity: "request",
          action: "create",
          id: res.id,
          data: res,
        });
      }
      return res;
    });

    ipcMain.handle("collections:duplicate-request", async (_event, { id, newId, name }) => {
      const res = await this.collection.duplicateRequest(id, newId, name);
      if (res) {
        this.messenger.broadcast("database-change", {
          entity: "request",
          action: "create",
          id: newId,
          data: res,
        });
      }
      return res;
    });

    ipcMain.handle("collections:delete-request", async (_event, { id }) => {
      const success = await this.collection.deleteRequest(id);
      if (success) {
        this.messenger.broadcast("database-change", {
          entity: "request",
          action: "delete",
          id,
        });
      }
      return success;
    });

    ipcMain.handle("collections:move-or-reorder-item", async (_event, { id, type, targetFolderId, orderIndex }) => {
      const success = await this.collection.moveOrReorderItem(id, type, targetFolderId, orderIndex);
      if (success) {
        this.messenger.broadcast("database-change", {
          entity: type,
          action: "move",
          id,
          data: { parentId: targetFolderId, orderIndex },
        });
      }
      return success;
    });
  }
}
