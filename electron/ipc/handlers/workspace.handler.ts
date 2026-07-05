import { ipcMain } from "electron";
import { BaseHandler } from "./base.handler";
import { IWorkspaceService } from "../../interfaces/workspace-service.interface";
import { IAppMessenger } from "../../interfaces/app-messenger.interface";

export class WorkspaceHandler extends BaseHandler {
  private workspace: IWorkspaceService;
  private messenger: IAppMessenger;

  constructor(workspaceService: IWorkspaceService, messenger: IAppMessenger) {
    super();
    this.workspace = workspaceService;
    this.messenger = messenger;
  }

  register(): void {
    ipcMain.handle("workspaces:get-all", (_event, userId: string) =>
      this.workspace.getWorkspaces(userId)
    );
    ipcMain.handle("workspaces:get-details", (_event, id: string) =>
      this.workspace.getWorkspaceDetails(id)
    );
    ipcMain.handle("workspaces:create", async (_event, params) => {
      console.log("[WorkspaceHandler] workspaces:create recebido com params:", params);
      const res = await this.workspace.createWorkspace(params);
      console.log("[WorkspaceHandler] createWorkspace retornou res:", res);
      if (res) {
        console.log("[WorkspaceHandler] Enviando broadcast de database-change para workspace id:", res.id);
        this.messenger.broadcast("database-change", { entity: "workspace", id: res.id });
      }
      return res;
    });
    ipcMain.handle("workspaces:update", async (_event, workspace) => {
      const res = await this.workspace.updateWorkspace(workspace);
      if (res) {
        this.messenger.broadcast("database-change", { entity: "workspace", id: workspace.id });
      }
      return res;
    });
    ipcMain.handle("workspaces:delete", async (_event, id: string) => {
      const res = await this.workspace.deleteWorkspace(id);
      if (res) {
        this.messenger.broadcast("database-change", { entity: "workspace", id });
      }
      return res;
    });
    ipcMain.handle("workspaces:link-collection", async (_event, { workspaceId, collectionId }) => {
      const res = await this.workspace.linkCollection(workspaceId, collectionId);
      if (res) {
        this.messenger.broadcast("database-change", { entity: "workspace", id: workspaceId });
        this.messenger.broadcast("database-change", { entity: "collection", id: collectionId });
      }
      return res;
    });
    ipcMain.handle("workspaces:unlink-collection", async (_event, collectionId: string) => {
      const res = await this.workspace.unlinkCollection(collectionId);
      if (res) {
        this.messenger.broadcast("database-change", { entity: "collection", id: collectionId });
      }
      return res;
    });
    ipcMain.handle("workspaces:invite-member", async (_event, { workspaceId, email, role }) => {
      const res = await this.workspace.inviteMember(workspaceId, email, role);
      if (res) {
        this.messenger.broadcast("database-change", { entity: "workspace", id: workspaceId });
      }
      return res;
    });
    ipcMain.handle("workspaces:remove-member", async (_event, { workspaceId, userId }) => {
      const res = await this.workspace.removeMember(workspaceId, userId);
      if (res) {
        this.messenger.broadcast("database-change", { entity: "workspace", id: workspaceId });
      }
      return res;
    });
  }
}

