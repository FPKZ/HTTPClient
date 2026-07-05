import { WebContents, BrowserWindow } from "electron";
import { IWindowManager } from "../interfaces/window-manager.interface";
import { IAppMessenger } from "../interfaces/app-messenger.interface";

/**
 * AppMessenger
 * Serviço responsável por enviar mensagens IPC do processo Main para as janelas do Renderer.
 * Evita que outros serviços dependam diretamente das instâncias de BrowserWindow ou do WindowManager completo.
 */
export class AppMessenger implements IAppMessenger {
  private windowManager: IWindowManager;

  constructor(windowManager: IWindowManager) {
    this.windowManager = windowManager;
  }

  /**
   * Envia uma mensagem para a janela principal (Main Window)
   */
  sendToMain(channel: string, ...args: any[]): void {
    const win = this.windowManager.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  }

  /**
   * Envia uma mensagem para a janela de atualização (Update Window)
   */
  sendToUpdate(channel: string, ...args: any[]): void {
    const win = this.windowManager.getUpdateWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  }

  /**
   * Envia uma mensagem para uma janela específica via WebContents
   */
  sendToWindow(contents: WebContents | null, channel: string, ...args: any[]): void {
    if (contents && !contents.isDestroyed()) {
      contents.send(channel, ...args);
    }
  }

  /**
   * Envia uma mensagem para todas as janelas abertas
   */
  broadcast(channel: string, ...args: any[]): void {
    const wins = BrowserWindow.getAllWindows();
    wins.forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, ...args);
      }
    });
  }

  /**
   * Foca a janela principal
   */
  focusMain(): void {
    this.windowManager.focusMainWindow();
  }
}


export default AppMessenger;
