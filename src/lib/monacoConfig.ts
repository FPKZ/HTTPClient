/**
 * Interface customizada para as opções do editor, definindo explicitamente
 * os valores permitidos para facilitar a visualização no IntelliSense.
 */
export interface IDefaultEditorOptions {
  fontSize?: number;
  fontFamily?: string;
  fontLigatures?: boolean | string;
  lineHeight?: number;
  readOnly?: boolean;
  wordWrap?: "off" | "on" | "wordWrapColumn" | "bounded";
  tabSize?: number;
  insertSpaces?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
  lineNumbers?: "off" | "on" | "relative" | "interval";
  lineNumbersMinChars?: number;
  renderLineHighlight?: "none" | "gutter" | "line" | "all";
  minimap?: {
    enabled?: boolean;
  };
  stickyScroll?: {
    enabled?: boolean;
  };
  folding?: boolean;
  matchBrackets?: "never" | "near" | "always";
  scrollBeyondLastLine?: boolean;
  scrollbar?: {
    vertical?: "auto" | "visible" | "hidden";
    horizontal?: "auto" | "visible" | "hidden";
    verticalScrollbarSize?: number;
    horizontalScrollbarSize?: number;
    alwaysConsumeMouseWheel?: boolean;
  };
  automaticLayout?: boolean;
  cursorBlinking?: "blink" | "smooth" | "phase" | "expand" | "solid";
  cursorStyle?:
    | "line"
    | "block"
    | "underline"
    | "line-thin"
    | "block-outline"
    | "underline-thin";
  cursorSmoothCaretAnimation?: "off" | "explicit" | "on";
  multiCursorModifier?: "ctrlCmd" | "alt";
  quickSuggestions?:
    | boolean
    | {
        other?: boolean | "on" | "inline" | "off";
        comments?: boolean | "on" | "inline" | "off";
        strings?: boolean | "on" | "inline" | "off";
      };
  suggestOnTriggerCharacters?: boolean;
  acceptSuggestionOnEnter?: "on" | "smart" | "off";
  contextmenu?: boolean;
  links?: boolean;
  colorDecorators?: boolean;
  theme?: string;
  bracketPairColorization?: {
    enabled?: boolean;
    independentColorPoolPerBracketType?: boolean;
  };
  guides?: {
    bracketPairs?: boolean | "active";
    bracketPairsHorizontal?: boolean | "active";
    highlightActiveBracketPair?: boolean;
    indentation?: boolean;
    highlightActiveIndentation?: boolean;
  };
  dragAndDrop?: boolean;
  emptySelectionClipboard?: boolean;
  copyWithSyntaxHighlighting?: boolean;
  mouseWheelZoom?: boolean;
  smoothScrolling?: boolean;
  padding?: {
    top?: number;
    bottom?: number;
  };
  renderControlCharacters?: boolean;
  renderWhitespace?: "none" | "boundary" | "selection" | "trailing" | "all";
  snippetSuggestions?: "top" | "bottom" | "inline" | "none";
  hover?: {
    enabled?: boolean;
    delay?: number;
    sticky?: boolean;
  };
  find?: {
    addExtraSpaceOnTop?: boolean;
    autoFindInSelection?: "never" | "always" | "multiline";
    seedSearchStringFromSelection?: "never" | "always" | "selection";
  };
}

/**
 * Configurações padrão para o Monaco Editor.
 * Exporta um objeto 'defaultEditorOptions' que contém todas as configurações
 * que devem ser aplicadas consistentemente em toda a aplicação.
 */
export const defaultEditorOptions: IDefaultEditorOptions = {
  // --- Aparência e Fonte ---
  fontSize: 12, // Tamanho da fonte em pixels
  fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace", // Família da fonte (preferência por fontes monoespaçadas com ligaduras)
  fontLigatures: true, // Habilita ligaduras de fonte (ex: => vira uma seta única se a fonte suportar)
  lineHeight: 20, // Altura da linha em pixels. Ajuste para mais ou menos espaçamento vertical

  // --- Comportamento de Edição ---
  readOnly: false, // Define se o editor é somente leitura (pode ser sobrescrito por componente)
  wordWrap: "on", // Quebra de linha automática: 'on', 'off', 'wordWrapColumn', 'bounded'
  tabSize: 2, // Número de espaços equivalentes a um TAB
  insertSpaces: true, // Usa espaços ao invés de tabs reais
  formatOnPaste: true, // Formata automaticamente o código ao colar
  formatOnType: true, // Formata automaticamente ao digitar (ex: fecha chaves, indenta)

  // --- Interface e Visualização (Gutter/Margem) ---
  lineNumbers: "on", // Exibição dos números de linha: 'on', 'off', 'relative', 'interval'
  lineNumbersMinChars: 3, // Largura mínima da coluna de números de linha (em caracteres)
  renderLineHighlight: "all", // Destaca a linha atual: 'none', 'gutter', 'line', 'all'
  minimap: {
    enabled: false, // Exibe o minimapa (visão geral do código na lateral direita)
  },
  stickyScroll: {
    enabled: false, // Desabilita o "grude" do contexto em cima do editor
  },
  folding: true, // Habilita a funcionalidade de dobrar/expandir blocos de código
  matchBrackets: "always", // Destaca os parênteses/chaves correspondentes: 'always', 'near', 'never'

  // --- Scroll e Layout ---
  scrollBeyondLastLine: false, // Permite rolar além da última linha do arquivo
  scrollbar: {
    vertical: "auto", // Barra de rolagem vertical: 'auto', 'visible', 'hidden'
    horizontal: "auto", // Barra de rolagem horizontal: 'auto', 'visible', 'hidden'
    verticalScrollbarSize: 10, // Largura da barra de rolagem vertical (px)
    horizontalScrollbarSize: 10, // Altura da barra de rolagem horizontal (px)
    alwaysConsumeMouseWheel: false, // Se true, impede que o scroll propaque para o elemento pai
  },
  automaticLayout: true, // Ajusta automaticamente o layout quando o container muda de tamanho (importante para resizable panels)

  // --- Cursor e Seleção ---
  cursorBlinking: "smooth", // Estilo do piscar do cursor: 'blink', 'smooth', 'phase', 'expand', 'solid'
  cursorStyle: "line", // Estilo do cursor: 'line', 'block', 'underline', 'line-thin', 'block-outline', 'underline-thin'
  cursorSmoothCaretAnimation: "on", // Animação suave do cursor ao mover
  multiCursorModifier: "alt", // Tecla modificadora para adicionar múltiplos cursores (ex: Alt + Click)

  // --- Sugestões e Autocomplete ---
  quickSuggestions: true, // Habilita sugestões rápidas enquanto digita
  suggestOnTriggerCharacters: true, // Habilita sugestões ao digitar caracteres de gatilho (ex: '.')
  acceptSuggestionOnEnter: "on", // Aceita a sugestão ao pressionar Enter: 'on', 'smart', 'off'

  // --- Outros ---
  contextmenu: false, // Habilita/desabilita o menu de contexto nativo do Monaco (clique direito).
  // Geralmente desativado para implementar menus customizados.
  links: true, // Detecta e torna clicáveis links no código
  colorDecorators: true, // Exibe caixinhas de cor inline (ex: #FF0000 mostra um quadrado vermelho)

  // --- Extras / Faltantes ---
  theme: "vs-dark", // Tema padrão
  bracketPairColorization: {
    enabled: true, // Colore pares de chaves/parênteses com cores diferentes
  },
  guides: {
    bracketPairs: false, // Mostra guias de alinhamento para pares de chaves
    indentation: true, // Mostra guias de indentação
  },
  dragAndDrop: true, // Permite arrastar e soltar texto
  emptySelectionClipboard: true, // Copia a linha atual se nada estiver selecionado
  copyWithSyntaxHighlighting: true, // Copia o texto com a formatação de sintaxe
  mouseWheelZoom: false, // Permite zoom com Ctrl + Scroll
  smoothScrolling: true, // Rolagem suave
  padding: {
    top: 5,
    bottom: 5,
  },
  renderControlCharacters: false, // Exibe caracteres de controle
  renderWhitespace: "none", // Exibe espaços em branco: 'none', 'boundary', 'selection', 'trailing', 'all'
  snippetSuggestions: "inline", // Sugestões de snippets: 'top', 'bottom', 'inline', 'none'
  hover: {
    enabled: true,
    delay: 300,
    sticky: true,
  },
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: "multiline",
    seedSearchStringFromSelection: "always",
  },
};
