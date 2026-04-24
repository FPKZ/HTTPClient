import contextMenu, { Options } from "electron-context-menu";
import { BrowserWindow } from "electron";
import WindowManager from "../services/window-manager";

class ContextMenuBuilder {
  private windowManager: WindowManager;
  private isDev: boolean;

  constructor(windowManager: WindowManager, isDev: boolean) {
    this.windowManager = windowManager;
    this.isDev = isDev;
  }

  build(): void {
    const contextMenuOptions: Options = {
      // No longer restricted to a single window to ensure it initializes even if mainWindow is late

      // Filtro: só mostra o menu se
      shouldShowMenu: (_event, params) => {
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
      prepend: (_defaultActions, parameters, _browserWindow) => [
        {
          label: "⭐ Adicionar aos Favoritos",
          visible: (parameters.linkURL?.length || 0) > 0,
          click: () => console.log(`Link favoritado: ${parameters.linkURL}`),
        },
        { type: "separator" },
      ],

      // 4. Adicionando itens DEPOIS do menu padrão (Append)
      append: (_defaultActions, _parameters, _browserWindow) => [
        { type: "separator" },
        {
          label: "Sobre o App",
          click: () => {
            console.log("Versão 1.0.0");
          },
        },
      ],
    };

    const contextMenuFunc = (contextMenu as any).default || contextMenu;
    if (typeof contextMenuFunc === "function") {
      contextMenuFunc(contextMenuOptions);
    } else {
      console.error("[ContextMenuBuilder] Erro: contextMenu não é uma função.", contextMenuFunc);
    }
  }
}

export default ContextMenuBuilder;
