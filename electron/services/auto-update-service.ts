import { autoUpdater, UpdateInfo } from "electron-updater";
import log from "electron-log";
import { IWindowManager } from "../interfaces/window-manager.interface";
import { AppMessenger } from "./app-messenger";

/**
 * AutoUpdateService
 * Gerencia o ciclo de vida de atualizações automáticas.
 * Segue o SRP ao isolar os listeners do autoUpdater e a lógica de simulação.
 */

interface ActionLogger {
  log: (action: string, user?: string | null) => boolean;
  logClear: () => boolean;
}

class AutoUpdateService {
  private isDev: boolean;
  private actionLogger: ActionLogger;

  constructor(isDev: boolean, actionLogger: ActionLogger) {
    this.isDev = isDev;
    this.actionLogger = actionLogger;
    this.setupLogger();
  }

  private setupLogger(): void {
    autoUpdater.logger = log;
    // @ts-ignore - electron-log and electron-updater compatibility
    autoUpdater.logger.transports.file.level = "info";
  }

  init(windowManager: IWindowManager, messenger: AppMessenger, onLaunchApp: () => void): void {
    if (!this.isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    } else {
      this._runUpdateSimulation(windowManager, messenger, onLaunchApp);
    }

    autoUpdater.on("update-available", (info: UpdateInfo) => {
      messenger.sendToUpdate("update-available");
      log.info("⬇️ Atualização disponível:", info);
    });

    autoUpdater.on("update-not-available", (info: UpdateInfo) => {
      log.info("✅ Nenhuma atualização disponível:", info);
      onLaunchApp();
    });

    autoUpdater.on("download-progress", (progress) => {
      messenger.sendToUpdate("download-progress", progress.percent);
    });

    autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
      messenger.sendToUpdate("update-downloaded");
      log.info("🔁 Atualização baixada:", info);
      this.actionLogger.logClear();
      setTimeout(() => autoUpdater.quitAndInstall(true, true), 2000);
    });

    autoUpdater.on("error", (err: Error) => {
      log.error("❌ Erro na atualização:", err);
      setTimeout(onLaunchApp, 1500);
    });
  }

  private _runUpdateSimulation(windowManager: IWindowManager, messenger: AppMessenger, onLaunchApp: () => void): void {
    const updateWindow = windowManager.getUpdateWindow();
    if (!updateWindow) return;

    updateWindow.webContents.on("did-finish-load", () => {
      setTimeout(() => {
        if (updateWindow.isDestroyed()) return;
        messenger.sendToUpdate("update-available");

        let percent = 0;
        const interval = setInterval(() => {
          percent += 10;
          if (updateWindow && !updateWindow.isDestroyed()) {
            messenger.sendToUpdate("download-progress", percent);
            if (percent >= 100) {
              clearInterval(interval);
              messenger.sendToUpdate("update-downloaded");
              setTimeout(() => onLaunchApp(), 2000);
            }
          } else {
            clearInterval(interval);
          }
        }, 800);
      }, 2000);
    });
  }
}

export default AutoUpdateService;
