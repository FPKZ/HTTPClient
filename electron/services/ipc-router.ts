import { IWindowManager } from "../interfaces/window-manager.interface";
import { IUserService } from "../interfaces/user-service.interface";
import { IWorkspaceService } from "../interfaces/workspace-service.interface";
import { IHistoryService } from "../interfaces/history-service.interface";
import { ICollectionService } from "../interfaces/collection-service.interface";
import { INetworkService } from "../interfaces/network-service.interface";
import { IExportService } from "../interfaces/export-service.interface";
import { IAppMessenger } from "../interfaces/app-messenger.interface";
import { IDialogReact, IActionLogger } from "../interfaces/utils.interface";
import PostmanTranslator from "../core/postman-translator";

import { AuthHandler } from "../ipc/handlers/auth.handler";
import { WorkspaceHandler } from "../ipc/handlers/workspace.handler";
import { HistoryHandler } from "../ipc/handlers/history.handler";
import { CollectionHandler } from "../ipc/handlers/collection.handler";
import { NetworkHandler } from "../ipc/handlers/network.handler";
import { WindowHandler } from "../ipc/handlers/window.handler";
import { FileHandler } from "../ipc/handlers/file.handler";
import { LogHandler } from "../ipc/handlers/log.handler";
import { DialogHandler } from "../ipc/handlers/dialog.handler";
import { ConversionHandler } from "../ipc/handlers/conversion.handler";
import { SystemHandler } from "../ipc/handlers/system.handler";
import { BaseHandler } from "../ipc/handlers/base.handler";

/**
 * IpcRouter
 * Centraliza o registro de todos os handlers IPC modulares.
 * Elimina o acoplamento direto com as implementações concretas e centraliza
 * a orquestração dos contratos definidos pelas interfaces.
 */
export class IpcRouter {
  private handlers: BaseHandler[] = [];

  constructor(dependencies: {
    windowManager: IWindowManager;
    userService: IUserService;
    workspaceService: IWorkspaceService;
    historyService: IHistoryService;
    collectionService: ICollectionService;
    networkService: INetworkService;
    exportService: IExportService;
    messenger: IAppMessenger;
    actionLogger: IActionLogger;
    dialogReact: IDialogReact;
    translator: PostmanTranslator;
    formatters: { axios: any, http: any };
  }) {
    this.handlers = [
      new AuthHandler(dependencies.userService),
      new WorkspaceHandler(dependencies.workspaceService, dependencies.messenger),
      new HistoryHandler(dependencies.historyService, dependencies.windowManager, dependencies.messenger),
      new CollectionHandler(dependencies.collectionService, dependencies.messenger),
      new NetworkHandler(dependencies.networkService, dependencies.messenger),
      new WindowHandler(dependencies.windowManager),
      new FileHandler(dependencies.exportService, { http: dependencies.formatters.http }),
      new LogHandler(dependencies.actionLogger, dependencies.windowManager),
      new DialogHandler(dependencies.dialogReact),
      new ConversionHandler(dependencies.translator, dependencies.dialogReact),
      new SystemHandler(),
    ];
  }

  /**
   * Registra todos os manipuladores IPC
   */
  register(): void {
    this.handlers.forEach((handler) => handler.register());
  }
}

export default IpcRouter;
