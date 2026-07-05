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

  // Mapa de janelas principais: windowId -> { win, activeCollectionId }
  private mainWindows = new Map<number, { win: BrowserWindow; activeCollectionId: string | null }>();

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

    const win = this.createWindow("/login");
    this.mainWindow = win;
    return win;
  }

  createWindow(route: string, collectionId?: string): BrowserWindow {
    log.info(`[WindowManager] Creating Window for route: ${route}, Collection: ${collectionId}`);

    const win = new BrowserWindow({
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

    win.webContents.on("did-start-loading", () =>
      log.info(`Window ${win.id}: did-start-loading`)
    );
    win.webContents.on("did-finish-load", () =>
      log.info(`Window ${win.id}: did-finish-load`)
    );
    win.webContents.on("did-fail-load", (_e, code, desc, url) =>
      log.error(`Window ${win.id}: did-fail-load`, { code, desc, url })
    );

    win.webContents.on(
      "console-message",
      (_event, level, message, line, sourceId) => {
        const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
        log.info(
          `[Renderer Console - Win ${win.id}][${levels[level] || "LOG"}] ${message} (${path.basename(sourceId)}:${line})`
        );
      }
    );

    const url = this.getRouteURL(route);
    log.info(`Loading URL in Window ${win.id}: ${url}`);
    win.loadURL(url).catch((e) => {
      log.error(`Falha ao carregar URL na janela ${win.id}: ${e.message}`, { url });
      dialog.showErrorBox(
        "Erro ao carregar janela",
        `Falha ao carregar URL: ${e.message}\nPath: ${url}`
      );
    });

    win.setMenuBarVisibility(false);

    const windowId = win.id;
    this.mainWindows.set(windowId, { win, activeCollectionId: collectionId || null });

    win.once("ready-to-show", () => {
      log.info(`Window ${windowId} event: ready-to-show`);
      if (this.updateWindow && !this.updateWindow.isDestroyed()) {
        this.updateWindow.close();
        this.updateWindow = null;
      }
      win.show();
      if (this.isDev) win.webContents.openDevTools();
    });

    win.on("close", (e) => {
      if (this._forceCloseFlag) return;

      // Se for a última janela principal, envia evento para salvar a sessão antes de sair
      if (this.mainWindows.size === 1 && !win.isDestroyed()) {
        e.preventDefault();
        win.webContents.send("request-save-session");
      }
    });

    win.on("closed", () => {
      this.mainWindows.delete(windowId);
      log.info(`Window ${windowId} closed. Remaining main windows: ${this.mainWindows.size}`);
      
      if (this.mainWindow?.id === windowId) {
        this.mainWindow = null;
        if (this.mainWindows.size > 0) {
          const next = this.mainWindows.values().next().value;
          if (next) this.mainWindow = next.win;
        }
      }
    });

    return win;
  }

  setActiveCollectionForWindow(windowId: number, collectionId: string | null): void {
    const entry = this.mainWindows.get(windowId);
    if (entry) {
      entry.activeCollectionId = collectionId;
      log.info(`[WindowManager] Janela ${windowId} agora tem a Coleção ${collectionId} ativa.`);
    }
  }

  isCollectionOpenInAnotherWindow(windowId: number, collectionId: string): boolean {
    for (const [id, entry] of this.mainWindows.entries()) {
      if (id !== windowId && entry.activeCollectionId === collectionId) {
        return true;
      }
    }
    return false;
  }

  focusWindowWithCollection(collectionId: string): boolean {
    for (const [_, entry] of this.mainWindows.entries()) {
      if (entry.activeCollectionId === collectionId) {
        if (entry.win.isMinimized()) entry.win.restore();
        entry.win.focus();
        log.info(`[WindowManager] Focado na janela existente contendo a Coleção ${collectionId}.`);
        return true;
      }
    }
    return false;
  }

  forceCloseApp(): void {
    this._forceCloseFlag = true;
    this.actionLogger.log("Forçando fechamento do app...");
    for (const [_, entry] of this.mainWindows.entries()) {
      if (!entry.win.isDestroyed()) entry.win.close();
    }
    this.mainWindows.clear();
    this.mainWindow = null;
    if (this.actionLoggerWindow && !this.actionLoggerWindow.isDestroyed()) {
      this.actionLoggerWindow.close();
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
        log.info("Fechando janela: ", win.id);
        this.actionLogger.log("Janela fechada: " + win.id);
      } catch (error: any) {
        log.error("Erro ao registrar fechamento da janela:", error);
      } finally {
        win.close();
      }
    }
  }

  closeAll(): void {
    this._forceCloseFlag = true;
    for (const [_, entry] of this.mainWindows.entries()) {
      if (!entry.win.isDestroyed()) entry.win.close();
    }
    this.mainWindows.clear();
    this.mainWindow = null;

    if (this.updateWindow && !this.updateWindow.isDestroyed()) this.updateWindow.close();
    if (this.actionLoggerWindow && !this.actionLoggerWindow.isDestroyed()) this.actionLoggerWindow.close();
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
