import { ipcMain, BrowserWindow, Menu } from "electron";
import { BaseHandler } from "./base.handler";
import { IWindowManager } from "../../interfaces/window-manager.interface";

export class WindowHandler extends BaseHandler {
  private win: IWindowManager;

  constructor(windowManager: IWindowManager) {
    super();
    this.win = windowManager;
  }

  register(): void {
    ipcMain.on("resize-window", (event, bounds: { width: number; height: number; x: number; y: number }) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) win.setBounds(bounds);
    });

    ipcMain.on("minimize", () => this.win.minimize());
    ipcMain.on("maximize", () => this.win.maximize());
    ipcMain.on("close", () => this.win.close());
    ipcMain.on("close-all", () => this.win.closeAll());
    ipcMain.on("force-close", () => this.win.forceCloseApp());
    
    // Canais de Multi-Janela
    ipcMain.on("window:create", (_event, { route, collectionId }: { route: string; collectionId?: string }) => {
      this.win.createWindow(route, collectionId);
    });

    ipcMain.on("window:set-active-collection", (event, collectionId: string | null) => {
      const senderWin = BrowserWindow.fromWebContents(event.sender);
      if (senderWin) {
        this.win.setActiveCollectionForWindow(senderWin.id, collectionId);
      }
    });

    ipcMain.handle("window:check-collection-open", (event, collectionId: string) => {
      const senderWin = BrowserWindow.fromWebContents(event.sender);
      const senderId = senderWin ? senderWin.id : -1;
      const isOpen = this.win.isCollectionOpenInAnotherWindow(senderId, collectionId);
      if (isOpen) {
        this.win.focusWindowWithCollection(collectionId);
      }
      return isOpen;
    });

    ipcMain.on("open-menu", () => {
      const mainWindow = this.win.getMainWindow();
      if (mainWindow) {
        const menu = Menu.getApplicationMenu();
        if (menu) menu.popup({ window: mainWindow });
      }
    });

    ipcMain.on("toggle-dev-tools", () => {
      this.win.toggleDevTools();
    });
  }
}

