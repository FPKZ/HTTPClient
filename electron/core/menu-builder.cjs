const { Menu } = require("electron");

/**
 * MenuBuilder
 * Encapsula a construção do menu nativo do sistema.
 * Segue o SRP ao separar a definição visual do menu da lógica do app.
 */
class MenuBuilder {
  constructor(windowManager, isDev) {
    this.win = windowManager;
    this.isDev = isDev;
  }

  build() {
    const template = [
      {
        label: "Novo Arquivo",
        click: () => {
          const mainWindow = this.win.getMainWindow();
          if (mainWindow) mainWindow.webContents.send("menu-action", "new-collection");
        },
        accelerator: "CmdOrCtrl+N",
      },
      {
        label: "Salvar Arquivo",
        click: () => {
          console.log("[Menu] Salvar Arquivo clicked");
          const mainWindow = this.win.getMainWindow();
          if (mainWindow) {
            console.log("[Menu] Sending menu-action save-file");
            mainWindow.webContents.send("menu-action", "save-file");
          } else {
            console.error("[Menu] MainWindow not found");
          }
        },
        accelerator: "CmdOrCtrl+S",
      },
      this.isDev && {
        label: "Desenvolvedor",
        submenu: [
          {
            label: "Mostrar/Esconder Console",
            accelerator: "CmdOrCtrl+I",
            click: () => {
              const mainWindow = this.win.getMainWindow();
              if (mainWindow) mainWindow.webContents.toggleDevTools();
            },
          },
        ],
      },
      { type: "separator" },
      {
        label: "Sair",
        accelerator: "CmdOrCtrl+Q",
        click: () => {
          console.log("[Menu] Sair clicked");
          const mainWindow = this.win.getMainWindow();
          if (mainWindow) {
             console.log("[Menu] Sending request-save-session");
             mainWindow.webContents.send("request-save-session");
          } else {
            console.error("[Menu] MainWindow not found");
          }
        },
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    return menu;
  }
}

module.exports = MenuBuilder;
