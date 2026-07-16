import { ipcMain } from "electron";
import { BaseHandler } from "./base.handler";
import { IEnvironmentService } from "../../interfaces/environment-service.interface";
import { IAppMessenger } from "../../interfaces/app-messenger.interface";

export class EnvironmentHandler extends BaseHandler {
  private environment: IEnvironmentService;
  private messenger: IAppMessenger;

  constructor(environmentService: IEnvironmentService, messenger: IAppMessenger) {
    super();
    this.environment = environmentService;
    this.messenger = messenger;
  }

  register(): void {
    ipcMain.handle("environments:create", async (_event, { collectionId, name }) => {
      const res = await this.environment.createEnvironment(collectionId, name);
      if (res) {
        this.messenger.broadcast("database-change", {
          entity: "environment",
          action: "create",
          id: res.id,
          data: res,
        });
      }
      return res;
    });

    ipcMain.handle("environments:update", async (_event, { id, name, variables }) => {
      const success = await this.environment.updateEnvironment(id, { name, variables });
      if (success) {
        this.messenger.broadcast("database-change", {
          entity: "environment",
          action: "update",
          id,
          data: { name, variables },
        });
      }
      return success;
    });

    ipcMain.handle("environments:delete", async (_event, { id }) => {
      const success = await this.environment.deleteEnvironment(id);
      if (success) {
        this.messenger.broadcast("database-change", {
          entity: "environment",
          action: "delete",
          id,
        });
      }
      return success;
    });
  }
}
