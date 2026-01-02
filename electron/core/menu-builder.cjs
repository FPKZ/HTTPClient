const { Menu } = require("electron");

/**
 * MenuBuilder
 * Encapsula a construção do menu nativo do sistema.
 * Segue o SRP ao separar a definição visual do menu da lógica do app.
 */
class MenuBuilder {
  constructor(windowManager) {
    this.win = windowManager;
  }

  build() {
    const template = [
      {
        label: "Novo Arquivo",
        click: () => {
          const mainWindow = this.win.getMainWindow();
          if (mainWindow) mainWindow.webContents.reload();
        },
      },
      { type: "separator" },
      {
        label: "Sair",
        accelerator: "CmdOrCtrl+Q",
        role: "quit",
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    return menu;
  }
}

module.exports = MenuBuilder;
