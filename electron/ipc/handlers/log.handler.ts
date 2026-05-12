import { ipcMain } from "electron";
import log from "electron-log";
import { BaseHandler } from "./base.handler";
import { IActionLogger } from "../../interfaces/utils.interface";
import { IWindowManager } from "../../interfaces/window-manager.interface";

export class LogHandler extends BaseHandler {
  private actionLogger: IActionLogger;
  private win: IWindowManager;

  constructor(actionLogger: IActionLogger, windowManager: IWindowManager) {
    super();
    this.actionLogger = actionLogger;
    this.win = windowManager;
  }

  register(): void {
    ipcMain.handle("log-action", (_event, action: string, user: string | null) => {
      return this.actionLogger.log(action, user);
    });

    ipcMain.on("start-action-logger", () =>
      this.actionLogger.logRead(this.win.getActionLoggerWindow()),
    );

    ipcMain.on("stop-action-logger", () => this.actionLogger.logStop());

    ipcMain.on("log-error", (_event, errorData: any) => {
      log.error("[Renderer Error]", errorData);
    });
  }
}
