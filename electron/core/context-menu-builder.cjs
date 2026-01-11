const contextMenu = require("electron-context-menu").default;
const { Menu } = require("electron");

class ContextMenuBuilder {
  constructor(windowManager, isDev) {
    this.windowManager = windowManager;
    this.isDev = isDev;
  }

  build() {
    const mainWindow = this.windowManager.getMainWindow();
    if (!mainWindow) return;

    const contextMenuOptions = {
        window: mainWindow,

        // Filtro: só mostra o menu se 
        shouldShowMenu: (event, params) => {
            // 1. É um campo de texto/input?
            const isInput = params.isEditable;
            
            // 2. Existe texto selecionado?
            const hasSelection = params.selectionText.trim().length > 0;
            
            // 3. É uma mídia (imagem, vídeo)? 
            const isMedia = params.mediaType !== 'none';

            // O menu SÓ aparece se for input OU tiver seleção OU for mídia
            return isInput || hasSelection || isMedia;
        },

        // 1. Funcionalidades de Desenvolvedor e Utilidade
        showInspectElement: this.isDev,
        showCopyImageAddress: true,
        showSaveImageAs: true,
        showLookUp: true, 
        showSearchWithGoogle: false,
        showLearnSpelling: true,
        
        // 2. Tradução dos itens padrão (Labels)
        labels: {
            copy: 'Copiar Texto',
            paste: 'Colar Conteúdo',
            cut: 'Recortar',
            saveImageAs: 'Salvar Imagem como...',
            copyImageAddress: 'Copiar Link da Imagem',
            inspect: 'Inspecionar Elemento',
            services: 'Serviços',
            lookUp: 'Pesquisar "{selection}"',
            learnSpelling: 'Adicionar "{word}" ao Dicionário',
        },

        // 3. Adicionando itens ANTES do menu padrão (Prepend)
        prepend: (defaultActions, parameters, browserWindow) => [
            {
                label: '⭐ Adicionar aos Favoritos',
                visible: parameters.linkURL.length > 0,
                click: () => console.log(`Link favoritado: ${parameters.linkURL}`)
            },
            { type: 'separator' }
        ],

        // 4. Adicionando itens DEPOIS do menu padrão (Append)
        append: (defaultActions, parameters, browserWindow) => [
            { type: 'separator' },
            {
                label: 'Sobre o App',
                click: () => {
                    console.log('Versão 1.0.0');
                }
            }
        ]
    };

    contextMenu(contextMenuOptions);
  }

  buildContextFolderMenu(params) {
    const { id, type } = params;
    const mainWindow = this.windowManager.getMainWindow();
    if (!mainWindow) return;
    
    const contextMenuOptions = [
        {
            label: "Nova Pasta",
            click: () => {
                mainWindow.webContents.send("context-menu-action", { action: "create-folder", targetId: id });
            }
        },
        {
            label: "Novo Arquivo",
            click: () => {
                console.log("Nova Arquivo em ", id);
                mainWindow.webContents.send("context-menu-action", { action: "create-file", targetId: id });
            }
        },
        { type: 'separator' },
        {
            label: "Renomear",
            click: () => {
                mainWindow.webContents.send("context-menu-action", { action: "rename", targetId: id });
            }
        },
        {
            label: "Excluir",
            style: 'destructive',
            click: () => {
                mainWindow.webContents.send("context-menu-action", { action: "delete", targetId: id });
            }
        }
    ];

    const menu = Menu.buildFromTemplate(contextMenuOptions);
    menu.popup({ window: mainWindow });
  }

  buildRootContextMenu() {
    const mainWindow = this.windowManager.getMainWindow();
    if (!mainWindow) return;

    const contextMenuOptions = [
      {
        label: "Nova Pasta",
        click: () => {
          mainWindow.webContents.send("context-menu-action", {
            action: "create-folder",
            targetId: null,
          });
        },
      },
      {
        label: "Novo Arquivo",
        click: () => {
          mainWindow.webContents.send("context-menu-action", {
            action: "create-file",
            targetId: null,
          });
        },
      },
    ];

    const menu = Menu.buildFromTemplate(contextMenuOptions);
    menu.popup({ window: mainWindow });
  }
}

module.exports = ContextMenuBuilder;
