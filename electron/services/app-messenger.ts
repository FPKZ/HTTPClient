import { IWindowManager } from "../interfaces/window-manager.interface";

/**
 * AppMessenger
 * Serviço responsável por enviar mensagens IPC do processo Main para as janelas do Renderer.
 * Evita que outros serviços dependam diretamente das instâncias de BrowserWindow ou do WindowManager completo.
 */
export class AppMessenger {
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
   * Foca a janela principal
   */
  focusMain(): void {
    this.windowManager.focusMainWindow();
  }
}

export default AppMessenger;
