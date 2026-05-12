import { BrowserWindow, Menu, screen, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import log from "electron-log";
import { IWindowManager } from "../interfaces/window-manager.interface";
import { IActionLogger } from "../interfaces/utils.interface";

const icon = path.join(__dirname, "../../assets/icon1.png");

/**
 * WindowManager
 * Gerencia a criação e o ciclo de vida das janelas do app.
 * Isola a lógica de rotas, webPreferences e eventos de janela (minimize/maximize/close).
 */
export class WindowManager implements IWindowManager {
  private isDev: boolean;
  private preloadPath: string;
  private actionLogger: IActionLogger;
  private mainWindow: BrowserWindow | null = null;
  private updateWindow: BrowserWindow | null = null;
  private actionLoggerWindow: BrowserWindow | null = null;
  private _forceCloseFlag: boolean = false;

  constructor(isDev: boolean, preloadPath: string, actionLogger: IActionLogger) {
    this.isDev = isDev;
    this.preloadPath = preloadPath;
    this.actionLogger = actionLogger;
  }

  getRouteURL(route: string): string {
    if (this.isDev) {
      return `http://127.0.0.1:5173#${route}`;
    }

    const indexPath = path.join(__dirname, "../../dist/index.html");
    return `file://${indexPath}#${route}`;
  }

  createMainWindow(): BrowserWindow {
    if (this.mainWindow) return this.mainWindow;

    log.info("Creating Main Window...", {
      isDev: this.isDev,
      preloadPath: this.preloadPath,
    });

    this.mainWindow = new BrowserWindow({
      title: "HTTPClient",
      icon: icon,
      width: 1100,
      height: 800,
      minWidth: 730,
      minHeight: 400,
      fullscreen: false,
      show: true,
      center: true,
      resizable: true,
      frame: false,
      darkTheme: true,
      backgroundColor: "#1e1e1e",
      webPreferences: {
        preload: this.preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        additionalArguments: [`--is-dev=${this.isDev}`],
      },
    });

    this.mainWindow.webContents.on("did-start-loading", () =>
      log.info("Main Window: did-start-loading"),
    );
    this.mainWindow.webContents.on("did-finish-load", () =>
      log.info("Main Window: did-finish-load"),
    );
    this.mainWindow.webContents.on("did-fail-load", (_e, code, desc, url) =>
      log.error("Main Window: did-fail-load", { code, desc, url }),
    );
    this.mainWindow.webContents.on("dom-ready", () =>
      log.info("Main Window: dom-ready"),
    );

    this.mainWindow.webContents.on(
      "console-message",
      (_event, level, message, line, sourceId) => {
        const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
        log.info(
          `[Renderer Console][${levels[level] || "LOG"}] ${message} (${path.basename(sourceId)}:${line})`,
        );
      },
    );

    const url = this.getRouteURL("/login");
    log.info(`Loading URL in Main Window: ${url}`);
    this.mainWindow.loadURL(url).catch((e) => {
      log.error(`Falha ao carregar URL: ${e.message}`, {
        url: this.getRouteURL("/login"),
      });
      dialog.showErrorBox(
        "Erro ao carregar janela",
        `Falha ao carregar URL: ${e.message}\nPath: ${this.getRouteURL(
          "/login",
        )}`,
      );
    });
    
    this.mainWindow.setMenuBarVisibility(false);

    this.mainWindow.once("ready-to-show", () => {
      log.info("Main Window event: ready-to-show");
      if (this.updateWindow && !this.updateWindow.isDestroyed()) {
        this.updateWindow.close();
        this.updateWindow = null;
      }
      if (this.mainWindow) {
        this.mainWindow.show();
        if (this.isDev) this.mainWindow.webContents.openDevTools();
      }
    });

    this.mainWindow.on("close", (e) => {
      if (this._forceCloseFlag) return;

      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        e.preventDefault();
        this.mainWindow.webContents.send("request-save-session");
      }
    });

    return this.mainWindow;
  }

  forceCloseApp(): void {
    this._forceCloseFlag = true;
    if (this.mainWindow) {
      this.actionLogger.log("Fechando App");
      this.mainWindow.close();
    }
  }

  createUpdateWindow(): BrowserWindow {
    if (this.updateWindow) return this.updateWindow;

    log.info("Creating Update Window...");

    this.updateWindow = new BrowserWindow({
      icon: icon,
      width: 300,
      height: 400,
      resizable: false,
      center: true,
      frame: false,
      transparent: false,
      alwaysOnTop: true,
      backgroundColor: "#1e1e1e",
      webPreferences: {
        preload: this.preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        additionalArguments: [`--is-dev=${this.isDev}`],
      },
    });

    this.updateWindow.webContents.on("did-start-loading", () =>
      log.info("Update Window: did-start-loading"),
    );
    this.updateWindow.webContents.on("did-finish-load", () =>
      log.info("Update Window: did-finish-load"),
    );
    this.updateWindow.webContents.on("did-fail-load", (_e, code, desc, url) =>
      log.error("Update Window: did-fail-load", { code, desc, url }),
    );

    this.updateWindow.webContents.on(
      "console-message",
      (_event, level, message, line, sourceId) => {
        const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
        log.info(
          `[Update Window Console][${levels[level] || "LOG"}] ${message} (${path.basename(sourceId)}:${line})`,
        );
      },
    );

    const url = this.getRouteURL("/update");
    log.info(`Loading URL in Update Window: ${url}`);
    this.updateWindow.loadURL(url);
    return this.updateWindow;
  }

  createActionLoggerWindow(): BrowserWindow {
    log.info("Creating Action Logger Window...");

    this.actionLoggerWindow = new BrowserWindow({
      icon: icon,
      minWidth: 300,
      minHeight: 400,
      width: 300,
      height: 400,
      resizable: true,
      center: true,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: {
        preload: this.preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        additionalArguments: [`--is-dev=${this.isDev}`],
      },
    });

    this.actionLoggerWindow.webContents.on("did-start-loading", () =>
      log.info("Action Logger Window: did-start-loading"),
    );
    this.actionLoggerWindow.webContents.on("did-finish-load", () =>
      log.info("Action Logger Window: did-finish-load"),
    );
    this.actionLoggerWindow.webContents.on("did-fail-load", (_e, code, desc, url) =>
      log.error("Action Logger Window: did-fail-load", { code, desc, url }),
    );

    this.actionLoggerWindow.webContents.on(
      "console-message",
      (_event, level, message, line, sourceId) => {
        const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
        log.info(
          `[Action Logger Window Console][${levels[level] || "LOG"}] ${message} (${path.basename(sourceId)}:${line})`,
        );
      },
    );

    const url = this.getRouteURL("/action-logger");
    log.info(`Loading URL in Action Logger Window: ${url}`);
    this.actionLoggerWindow.loadURL(url);
    return this.actionLoggerWindow;
  }

  minimize(): void {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  }

  maximize(): void {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  }

  close(): void {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      try {
        console.log("fechando janela", win.getTitle());
        this.actionLogger.log("Janela fechada");
      } catch (error: any) {
        console.log("Erro ao fechar janela", error);
        this.actionLogger.log("Erro ao fechar janela: " + error.message);
      } finally {
        win.close();
      }
    }
  }

  closeAll(): void {
    const wins = BrowserWindow.getAllWindows();
    wins.forEach((win) => win.close());
  }

  setMenu(template: any): Menu {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    return menu;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  getUpdateWindow(): BrowserWindow | null {
    return this.updateWindow;
  }

  getActionLoggerWindow(): BrowserWindow | null {
    return this.actionLoggerWindow;
  }

  focusMainWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.focus();
    }
  }

  toggleDevTools(): void {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.toggleDevTools();
    }
  }
}

export default WindowManager;
