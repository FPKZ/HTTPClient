const contextMenu = require("electron-context-menu").default;
const { Menu } = require("electron");

class ContextMenuBuilder {
  constructor(windowManager, isDev) {
    this.windowManager = windowManager;
    this.isDev = isDev;
  }

  build() {
    const contextMenuOptions = {
      // No longer restricted to a single window to ensure it initializes even if mainWindow is late

      // Filtro: só mostra o menu se
      shouldShowMenu: (event, params) => {
        // Em desenvolvimento, sempre permite o menu (para inspeção)
        if (this.isDev) return true;

        // Em produção, seguindo as regras de UX
        const isInput = params.isEditable;
        const hasSelection = params.selectionText.trim().length > 0;
        const isMedia = params.mediaType !== "none";

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
        copy: "Copiar Texto",
        paste: "Colar Conteúdo",
        cut: "Recortar",
        saveImageAs: "Salvar Imagem como...",
        copyImageAddress: "Copiar Link da Imagem",
        inspect: "Inspecionar Elemento",
        services: "Serviços",
        lookUp: 'Pesquisar "{selection}"',
        learnSpelling: 'Adicionar "{word}" ao Dicionário',
      },

      // 3. Adicionando itens ANTES do menu padrão (Prepend)
      prepend: (defaultActions, parameters, browserWindow) => [
        {
          label: "⭐ Adicionar aos Favoritos",
          visible: parameters.linkURL.length > 0,
          click: () => console.log(`Link favoritado: ${parameters.linkURL}`),
        },
        { type: "separator" },
      ],

      // 4. Adicionando itens DEPOIS do menu padrão (Append)
      append: (defaultActions, parameters, browserWindow) => [
        { type: "separator" },
        {
          label: "Sobre o App",
          click: () => {
            console.log("Versão 1.0.0");
          },
        },
      ],
    };

    contextMenu(contextMenuOptions);
  }
}

module.exports = ContextMenuBuilder;
