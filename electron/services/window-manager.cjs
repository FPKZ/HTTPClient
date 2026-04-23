const { BrowserWindow, Menu, screen } = require("electron");
const path = require("path");
const icon = path.join(__dirname, "../../assets/icon1.png");

/**
 * WindowManager
 * Gerencia a criação e o ciclo de vida das janelas do app.
 * Isola a lógica de rotas, webPreferences e eventos de janela (minimize/maximize/close).
 */
class WindowManager {
  constructor(isDev, preloadPath, actionLogger) {
    this.isDev = isDev;
    this.preloadPath = preloadPath;
    this.actionLogger = actionLogger;
    this.mainWindow = null;
    this.updateWindow = null;
  }

  getRouteURL(route) {
    if (this.isDev) {
      return `http://127.0.0.1:5173#${route}`;
    }
    const indexPath = path.join(__dirname, "../../dist/index.html");
    return `file://${indexPath}#${route}`;
  }

  createMainWindow() {
    if (this.mainWindow) return this.mainWindow;

    // Pega as dimensões do monitor principal (agora é seguro usar 'screen')
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const log = require("electron-log");
    log.info("Creating Main Window...", {
      isDev: this.isDev,
      preloadPath: this.preloadPath,
    });

    // const { dialog } = require('electron'); // Debug
    // dialog.showMessageBox({ message: 'Creating Main Window...' });

    this.mainWindow = new BrowserWindow({
      title: "HTTPClient",
      icon: icon,
      width: 1100,
      height: 800,
      minWidth: 730,
      minHeight: 400,
      fullscreen: false,
      show: true, // Força a visibilidade para debug
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
    this.mainWindow.webContents.on("did-fail-load", (e, code, desc, url) =>
      log.error("Main Window: did-fail-load", { code, desc, url }),
    );
    this.mainWindow.webContents.on("dom-ready", () =>
      log.info("Main Window: dom-ready"),
    );

    // Redireciona console do Renderer para o log do Main
    this.mainWindow.webContents.on(
      "console-message",
      (event, level, message, line, sourceId) => {
        const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
        log.info(
          `[Renderer Console][${levels[level] || "LOG"}] ${message} (${path.basename(sourceId)}:${line})`,
        );
      },
    );

    this.mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription, validatedURL) => {
        log.error(
          `[Renderer Load Failed] ${errorCode}: ${errorDescription} - ${validatedURL}`,
        );
      },
    );

    const url = this.getRouteURL("/login");
    log.info(`Loading URL in Main Window: ${url}`);
    this.mainWindow.loadURL(url).catch((e) => {
      const log = require("electron-log");
      log.error(`Falha ao carregar URL: ${e.message}`, {
        url: this.getRouteURL("/login"),
      });
      const { dialog } = require("electron");
      dialog.showErrorBox(
        "Erro ao carregar janela",
        `Falha ao carregar URL: ${e.message}\nPath: ${this.getRouteURL(
          "/login",
        )}`,
      );
    });
    // this.mainWindow.removeMenu(); // Remove completely (kills shortcuts on Windows)
    this.mainWindow.setMenuBarVisibility(false); // Hide visually but keep shortcuts

    this.mainWindow.once("ready-to-show", () => {
      log.info("Main Window event: ready-to-show");
      if (this.updateWindow && !this.updateWindow.isDestroyed()) {
        this.updateWindow.close();
        this.updateWindow = null;
      }
      this.mainWindow.show();
      if (this.isDev) this.mainWindow.webContents.openDevTools();
    });

    // Intercepta o fechamento para salvar sessão
    this.mainWindow.on("close", (e) => {
      if (this.forceClose) return; // Permite o fechamento se a flag estiver ativa

      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        e.preventDefault();
        this.mainWindow.webContents.send("request-save-session");
      }
    });

    return this.mainWindow;
  }

  forceCloseApp() {
    this.forceClose = true;
    if (this.mainWindow) {
      this.actionLogger.log("Fechando App");
      this.mainWindow.close();
    }
  }

  createUpdateWindow() {
    if (this.updateWindow) return this.updateWindow;

    const log = require("electron-log");
    log.info("Creating Update Window...");

    this.updateWindow = new BrowserWindow({
      icon: icon,
      width: 300,
      height: 400,
      resizable: false,
      center: true,
      frame: false,
      transparent: false, // Desativado para teste
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
    this.updateWindow.webContents.on("did-fail-load", (e, code, desc, url) =>
      log.error("Update Window: did-fail-load", { code, desc, url }),
    );

    // Redireciona console do Renderer para o log do Main (Update Window)
    this.updateWindow.webContents.on(
      "console-message",
      (event, level, message, line, sourceId) => {
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

  createActionLoggerWindow() {
    const log = require("electron-log");
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
      // backgroundColor: "#1e1e1e", // Removido para suportar transparência
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
    this.actionLoggerWindow.webContents.on("did-fail-load", (e, code, desc, url) =>
      log.error("Action Logger Window: did-fail-load", { code, desc, url }),
    );

    // Redireciona console do Renderer para o log do Main (Action Logger Window)
    this.actionLoggerWindow.webContents.on(
      "console-message",
      (event, level, message, line, sourceId) => {
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

  minimize() {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  }

  maximize() {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  }

  close() {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      try{
        console.log("fechando janela", win.getTitle());
        this.actionLogger.log("Janela fechada");
      } catch (error) {
        console.log("Erro ao fechar janela", error);
        this.actionLogger.log("Erro ao fechar janela: " + error.message);
      }finally{
        win.close();
      }
    }
  }

  closeAll() {
    const wins = BrowserWindow.getAllWindows();
    wins.forEach((win) => win.close());
  }

  setMenu(template) {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    return menu;
  }

  getMainWindow() {
    return this.mainWindow;
  }

  getUpdateWindow() {
    return this.updateWindow;
  }

  getActionLoggerWindow() {
    return this.actionLoggerWindow;
  }

  toggleDevTools() {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.toggleDevTools();
    }
  }
}

module.exports = WindowManager;
