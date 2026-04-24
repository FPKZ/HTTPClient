import { ipcMain } from "electron";

interface DialogOptions {
  label: string;
  value: any;
  variant?: string;
}

interface DialogParams {
  title?: string;
  description?: string;
  options?: DialogOptions[];
}

/**
 * Classe para gerenciar diálogos customizados via React no processo Main.
 */
class DialogReact {
  private windowManager: any;

  /**
   * @param {WindowManager} windowManager - Instância do gerenciador de janelas
   */
  constructor(windowManager: any) {
    this.windowManager = windowManager;
  }

  /**
   * Abre um diálogo e aguarda a resposta do usuário.
   * @param {DialogParams} params - Parâmetros do diálogo
   * @returns {Promise<any>} - O valor da opção selecionada
   */
  async showDialog(params: DialogParams): Promise<any> {
    const mainWindow = this.windowManager.getMainWindow();
    if (!mainWindow) {
      console.error("[DialogReact] Erro: MainWindow não encontrada.");
      return null;
    }

    const dialogId = `dialog-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log(
      `[DialogReact] Enviando show-dialog para window, id: ${dialogId}`
    );

    return new Promise((resolve) => {
      // Define o listener para a resposta antes de enviar o comando
      ipcMain.once(`dialog-response-${dialogId}`, (event, result) => {
        console.log(
          `[DialogReact] Recebida resposta para id ${dialogId}:`,
          result
        );
        resolve(result);
      });

      // Envia o comando para o Frontend
      mainWindow.webContents.send("show-dialog", {
        id: dialogId,
        title: params.title || "Aviso",
        description: params.description || "",
        options: params.options || [{ label: "OK", value: true }],
      });
    });
  }
}

export default DialogReact;
