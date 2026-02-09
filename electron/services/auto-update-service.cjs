const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

/**
 * AutoUpdateService
 * Gerencia o ciclo de vida de atualizações automáticas.
 * Segue o SRP ao isolar os listeners do autoUpdater e a lógica de simulação.
 */
class AutoUpdateService {
  constructor(isDev) {
    this.isDev = isDev;
    this.setupLogger();
  }

  setupLogger() {
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = "info";
  }

  init(windowManager, onLaunchApp) {
    const updateWindow = windowManager.getUpdateWindow();

    if (!this.isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    } else {
      this._runUpdateSimulation(windowManager, onLaunchApp);
    }

    autoUpdater.on("update-available", (info) => {
      const updateWindow = windowManager.getUpdateWindow();
      if (updateWindow && !updateWindow.isDestroyed()) {
        updateWindow.webContents.send("update-available");
      }
      log.info("⬇️ Atualização disponível:", info);
    });

    autoUpdater.on("update-not-available", (info) => {
      log.info("✅ Nenhuma atualização disponível:", info);
      onLaunchApp();
    });

    autoUpdater.on("download-progress", (progress) => {
      const updateWindow = windowManager.getUpdateWindow();
      if (updateWindow && !updateWindow.isDestroyed()) {
        updateWindow.webContents.send("download-progress", progress.percent);
      }
    });

    autoUpdater.on("update-downloaded", (info) => {
      const updateWindow = windowManager.getUpdateWindow();
      if (updateWindow && !updateWindow.isDestroyed()) {
        updateWindow.webContents.send("update-downloaded");
      }
      log.info("🔁 Atualização baixada:", info);
      // Parâmetros: (isSilent, isForceRunAfter)
      // setTimeout(() => , 2000);
      actionLogger.logClear();
      setTimeout(() => autoUpdater.quitAndInstall(true, true), 2000);
    });

    autoUpdater.on("error", (err) => {
      log.error("❌ Erro na atualização:", err);
      setTimeout(onLaunchApp, 1500);
    });
  }

  _runUpdateSimulation(windowManager, onLaunchApp) {
    const updateWindow = windowManager.getUpdateWindow();
    if (!updateWindow) return;

    updateWindow.webContents.on("did-finish-load", () => {
      setTimeout(() => {
        if (updateWindow.isDestroyed()) return;
        updateWindow.webContents.send("update-available");

        let percent = 0;
        const interval = setInterval(() => {
          percent += 10;
          if (updateWindow && !updateWindow.isDestroyed()) {
            updateWindow.webContents.send("download-progress", percent);
            if (percent >= 100) {
              clearInterval(interval);
              updateWindow.webContents.send("update-downloaded");
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

module.exports = AutoUpdateService;
