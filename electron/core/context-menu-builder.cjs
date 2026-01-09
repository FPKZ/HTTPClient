const contextMenu = require("electron-context-menu").default;
const { Menu } = require("electron");

class ContextMenuBuilder {
  constructor(windowManager, isDev) {
    this.win = windowManager.getMainWindow();
    this.isDev = isDev;
  }

  build() {

    const contextMenuOptions = {

        window: this.win,

        // Filtro: só mostra o menu se 
        shouldShowMenu: (event, params) => {
            // 1. É um campo de texto/input?
            const isInput = params.isEditable;
            
            // 2. Existe texto selecionado?
            const hasSelection = params.selectionText.trim().length > 0;
            
            // 3. É uma mídia (imagem, vídeo)? 
            // (Isso evita que seja uma "área vazia" de puro texto/fundo)
            const isMedia = params.mediaType !== 'none';

            // O menu SÓ aparece se for input OU tiver seleção OU for mídia
            return isInput || hasSelection || isMedia;
        },

        // 1. Funcionalidades de Desenvolvedor e Utilidade
        showInspectElement: this.isDev, // Habilita o "Inspecionar"
        showCopyImageAddress: true, // Habilita copiar link da imagem
        showSaveImageAs: true, // Habilita "Salvar imagem como"
        // Mostra sugestões do dicionário
        showLookUp: true, 
        // Mostra opção de pesquisa inteligente
        showSearchWithGoogle: false,
        // Permite adicionar palavras ao dicionário
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
            // {
            //     label: '🔄 Atualizar Página',
            //     click: () => browserWindow.reload()
            // },
            {
                label: '⭐ Adicionar aos Favoritos',
                // Este item só aparece se você clicar em um Link
                visible: parameters.linkURL.length > 0,
                click: () => console.log(`Link favoritado: ${parameters.linkURL}`)
            },
            { type: 'separator' }
        ],

        // 4. Adicionando itens DEPOIS do menu padrão (Append)
        append: (defaultActions, parameters, browserWindow) => [
            { type: 'separator' },
            // {
            //     label: '🔍 Analisar Texto Selecionado',
            //     // Só aparece se houver texto selecionado
            //     visible: parameters.selectionText.trim().length > 0,
            //     click: () => {
            //         console.log(`Analisando: ${parameters.selectionText}`);
            //     }
            // },
            {
                label: 'Sobre o App',
                click: () => {
                    console.log('Versão 1.0.0');
                }
            }
        ]
    }

    contextMenu(contextMenuOptions);

  }

  buildContextFolderMenu(event) {
    const contextMenuOptions = [
        {
            label: "Nova Pasta",
            click: () => {
                console.log("Nova Pasta");
            }
        },
        {
            label: "Novo Arquivo",
            click: () => {
                console.log("Novo Arquivo");
            }
        },
        {
            label: "Renomear",
            click: () => {
                console.log("Renomear");
            }
        },
        {
            label: "Excluir",
            click: () => {
                console.log("Excluir");
            }
        }
    ]

    const menu = Menu.buildFromTemplate(contextMenuOptions);
    menu.popup(this.win.fromWebContents(event.sender));
  }

}

module.exports = ContextMenuBuilder;
