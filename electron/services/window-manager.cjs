const { BrowserWindow, Menu, screen } = require("electron");
const path = require("path");

/**
 * WindowManager
 * Gerencia a criação e o ciclo de vida das janelas do app.
 * Isola a lógica de rotas, webPreferences e eventos de janela (minimize/maximize/close).
 */
class WindowManager {
  constructor(isDev, preloadPath) {
    this.isDev = isDev;
    this.preloadPath = preloadPath;
    this.mainWindow = null;
    this.updateWindow = null;
  }

  getRouteURL(route) {
    if (this.isDev) {
      return `http://localhost:5173#${route}`;
    }
    const indexPath = path.join(__dirname, "../../dist/index.html");
    return `file://${indexPath}#${route}`;
  }

  createMainWindow() {
    if (this.mainWindow) return this.mainWindow;

    // Pega as dimensões do monitor principal (agora é seguro usar 'screen')
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    this.mainWindow = new BrowserWindow({
      title: "HTTPClient",
      icon: path.join(__dirname, "../../assets/icon1.png"),
      width: 1100,
      height: 800,
      minWidth: 950,
      minHeight: 700,
      fullscreen: false,
      show: false,
      center: true,
      resizable: true,
      frame: false,
      darkTheme: true,
      webPreferences: {
        preload: this.preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    this.mainWindow.loadURL(this.getRouteURL("/upload"));
    // this.mainWindow.removeMenu(); // Remove completely (kills shortcuts on Windows)
    this.mainWindow.setMenuBarVisibility(false); // Hide visually but keep shortcuts

    this.mainWindow.once("ready-to-show", () => {
      if (this.updateWindow) {
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
      this.mainWindow.close();
    }
  }

  createUpdateWindow() {
    if (this.updateWindow) return this.updateWindow;

    this.updateWindow = new BrowserWindow({
      width: 300,
      height: 400,
      resizable: false,
      center: true,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: {
        preload: this.preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    this.updateWindow.loadURL(this.getRouteURL("/update"));
    return this.updateWindow;
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
    if (win) win.close();
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
}

module.exports = WindowManager;
