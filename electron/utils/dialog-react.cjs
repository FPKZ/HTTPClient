const { ipcMain } = require("electron");

/**
 * Classe para gerenciar diálogos customizados via React no processo Main.
 */
class DialogReact {
  /**
   * @param {WindowManager} windowManager - Instância do gerenciador de janelas
   */
  constructor(windowManager) {
    this.windowManager = windowManager;
  }

  /**
   * Abre um diálogo e aguarda a resposta do usuário.
   * @param {Object} params - Parâmetros do diálogo
   * @param {string} [params.title] - Título
   * @param {string} [params.description] - Descrição/Mensagem
   * @param {Array} [params.options] - Botões/Opções [{ label, value, variant }]
   * @returns {Promise<any>} - O valor da opção selecionada
   */
  async showDialog(params) {
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

module.exports = DialogReact;
