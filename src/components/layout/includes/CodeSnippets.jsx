import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  generateCodeSnippet,
  supportedLanguages,
} from "../../../lib/codeGenerator";
import CodeViewer from "../../CodeViewer";

export default function CodeSnippets({ request }) {
  // Inicializar com 'shell' (cURL) como padrão, ou o primeiro disponível
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [useSelectMode, setUseSelectMode] = useState(false);
  const [hideSnippetsList, setHideSnippetsList] = useState(false);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const previousCategoryRef = useRef(activeCategory);

  // Gerar snippets dinamicamente baseados na requisição atual
  const snippets = useMemo(() => {
    if (!request) return [];

    const allSnippets = [];
    let idCounter = 1;

    supportedLanguages.forEach((lang) => {
      lang.variants.forEach((variant) => {
        try {
          const code = generateCodeSnippet(request, lang.id, variant.id);
          allSnippets.push({
            id: idCounter++,
            title: `${lang.label} - ${variant.label}`,
            category: lang.id, // Usando o ID da linguagem como categoria (ex: 'javascript', 'python')
            language: variant.mode, // Modo para syntax highlighting
            code: code,
          });
        } catch (error) {
          console.error(
            `Erro ao gerar snippet para ${lang.label} - ${variant.label}`,
            error,
          );
        }
      });
    });

    return allSnippets;
  }, [request]);

  const categories = useMemo(() => {
    // Criar categorias baseadas nas linguagens suportadas que geraram snippets
    const availableCategories = supportedLanguages
      .filter((lang) => snippets.some((s) => s.category === lang.id))
      .map((lang) => ({
        id: lang.id,
        label: lang.label,
        count: snippets.filter((s) => s.category === lang.id).length,
      }));

    // Adicionar "Todos" no início
    return [
      { id: "all", label: "Todos", count: snippets.length },
      ...availableCategories,
    ];
  }, [snippets]);

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesCategory =
      activeCategory === "all" || snippet.category === activeCategory;
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // Pode adicionar um toast notification aqui
  };

  // Detectar largura disponível e alternar entre botões e select
  useEffect(() => {
    if (!headerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const shouldUseSelect = width < 500;
        setUseSelectMode(shouldUseSelect);

        // Se entrar em modo select e "Todos" estiver selecionado, mudar para primeira categoria
        if (shouldUseSelect) {
          setActiveCategory((currentCategory) => {
            if (currentCategory === "all") {
              const firstCategory = categories.find((cat) => cat.id !== "all");
              return firstCategory ? firstCategory.id : currentCategory;
            }
            return currentCategory;
          });
        }
      }
    });

    resizeObserver.observe(headerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [categories]);

  // Detectar largura da content area para ocultar snippets list
  useEffect(() => {
    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const shouldHide = width < 600;
        setHideSnippetsList(shouldHide);

        // Quando a lista estiver oculta, selecionar automaticamente o primeiro snippet
        if (shouldHide) {
          setSelectedSnippet((current) => {
            if (!current && filteredSnippets.length > 0) {
              return filteredSnippets[0];
            }
            return current;
          });
        }
      }
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [filteredSnippets]);

  // Atualizar snippet selecionado quando categoria muda
  const updateSnippetOnCategoryChange = useCallback(() => {
    if (previousCategoryRef.current !== activeCategory) {
      previousCategoryRef.current = activeCategory;

      if (filteredSnippets.length > 0) {
        // Verificar se o snippet atual ainda está na lista filtrada
        const isStillInList =
          selectedSnippet &&
          filteredSnippets.some((s) => s.id === selectedSnippet.id);

        if (!isStillInList) {
          // Se não estiver mais na lista, selecionar o primeiro snippet disponível
          setSelectedSnippet(filteredSnippets[0]);
        }
      }
    } else if (
      !selectedSnippet &&
      filteredSnippets.length > 0 &&
      hideSnippetsList
    ) {
      // Caso especial para garantir seleção inicial se necessário
      setSelectedSnippet(filteredSnippets[0]);
    }
  }, [activeCategory, filteredSnippets, selectedSnippet, hideSnippetsList]);

  // Executar atualização
  useEffect(() => {
    updateSnippetOnCategoryChange();
  }, [updateSnippetOnCategoryChange]);

  // Sincronizar snippet selecionado quando a lista de snippets muda (ex: trocar de requisição/aba)
  useEffect(() => {
    if (snippets.length > 0) {
      setSelectedSnippet((current) => {
        if (!current) return snippets[0];
        // Tenta encontrar o mesmo snippet (pela categoria e título) na nova lista
        const matching = snippets.find(
          (s) => s.category === current.category && s.title === current.title,
        );
        // Se não encontrar o exato, tenta um da mesma categoria ou o primeiro disponível
        return (
          matching ||
          snippets.find((s) => s.category === current.category) ||
          snippets[0]
        );
      });
    } else {
      setSelectedSnippet(null);
    }
  }, [snippets]);

  return (
    <div className="flex-1 h-full border-t border-zinc-700! bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        ref={headerRef}
        className="px-2 py-1.5 border-b border-zinc-800! flex justify-between items-center bg-zinc-900/30 shrink-0"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[0.65rem]! font-black tracking-widest text-zinc-500 uppercase shrink-0">
            <span className="text-yellow-500">⚡</span> Code Snippets
          </span>
          <span className="text-zinc-700 font-bold shrink-0">•</span>
          <span className="text-zinc-600 text-[0.65rem]! font-medium shrink-0">
            {filteredSnippets.length} snippet
            {filteredSnippets.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Seletor de Categorias */}
        {useSelectMode ? (
          <div className="ml-4 shrink-0 w-[140px]">
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="h-7 rounded bg-zinc-900/80 border-zinc-800! text-[0.6rem]! font-bold uppercase text-yellow-500">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800!">
                {categories
                  .filter((cat) => cat.id !== "all")
                  .map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="text-[0.7rem]!"
                    >
                      {cat.label} ({cat.count})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex bg-zinc-900/80 rounded-lg! p-0.5 border border-zinc-800! ml-4 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md! text-[0.6rem]! font-bold uppercase transition-all! ${
                  activeCategory === cat.id
                    ? "bg-zinc-800 text-yellow-500 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {cat.label}{" "}
                <span className="text-[0.55rem] opacity-60">({cat.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="flex-1 flex overflow-hidden">
        {/* Snippets List */}
        {!hideSnippetsList && (
          <div className="w-40 border-r border-zinc-800! bg-zinc-900/10 overflow-y-auto">
            {/* Search Bar */}
            <div className="px-2 py-2 border-b border-zinc-800! bg-zinc-900/20 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar snippets..."
                  className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800! rounded text-[0.7rem]! text-white placeholder-zinc-600 focus:border-yellow-600 outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs!"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {filteredSnippets.length === 0 ? (
              <div className="p-4 text-center text-zinc-600 text-[0.7rem]">
                Nenhum snippet encontrado
              </div>
            ) : (
              <>
                {filteredSnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => setSelectedSnippet(snippet)}
                    className={`w-full text-left px-3 py-2.5 border-b border-zinc-800! transition-all! ${
                      selectedSnippet?.id === snippet.id
                        ? "bg-zinc-800/50 border-l-2 border-l-yellow-500"
                        : "hover:bg-zinc-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {/* Indicador de Linguagem (Cor) */}
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          snippet.category === "javascript" ||
                          snippet.category === "node"
                            ? "bg-yellow-500"
                            : snippet.category === "python"
                              ? "bg-blue-500"
                              : snippet.category === "shell"
                                ? "bg-green-500"
                                : "bg-zinc-500"
                        }`}
                      />
                      <span className="text-[0.7rem] font-bold text-zinc-300 truncate">
                        {snippet.title}
                      </span>
                    </div>
                    <div className="text-[0.6rem] text-zinc-600 uppercase font-semibold tracking-wider">
                      {snippet.category}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Snippet Viewer */}
        <div className="flex-1 bg-[#040404] overflow-hidden flex flex-col">
          {/* Select de Snippets (quando lista está oculta) */}
          {hideSnippetsList && filteredSnippets.length > 0 && (
            <div className="px-2 py-2 border-b border-zinc-800! bg-zinc-900/20 shrink-0">
              <Select
                value={selectedSnippet?.id.toString() || ""}
                onValueChange={(value) => {
                  const snippet = filteredSnippets.find(
                    (s) => s.id === parseInt(value),
                  );
                  setSelectedSnippet(snippet);
                }}
              >
                <SelectTrigger className="w-full h-8 rounded bg-zinc-900/80 border-zinc-800! text-[0.65rem]! font-bold text-yellow-500">
                  <SelectValue placeholder="Selecione um snippet..." />
                </SelectTrigger>
                <SelectContent className="border-zinc-800!">
                  {filteredSnippets.map((snippet) => (
                    <SelectItem
                      key={snippet.id}
                      value={snippet.id.toString()}
                      className="text-[0.7rem]!"
                    >
                      {snippet.title} ({snippet.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedSnippet ? (
            <>
              {/* Snippet Header */}
              <div className="px-3 py-2.5 border-b border-zinc-800! bg-zinc-900/20 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-[0.75rem]! font-bold text-zinc-200 mb-0.5">
                    {selectedSnippet.title}
                  </h3>
                  <span className="text-[0.6rem] text-zinc-600 uppercase font-semibold tracking-wider">
                    {selectedSnippet.language}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedSnippet.code)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-yellow-500 text-[0.65rem]! font-bold rounded transition-all! border border-zinc-700!"
                >
                  📋 Copiar
                </button>
              </div>

              {/* Code Display */}
              <div className="flex-1 overflow-hidden p-0 bg-[#0f0f0f]">
                <CodeViewer
                  value={selectedSnippet.code}
                  language={selectedSnippet.language || "javascript"}
                  theme="code-snippet"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3 opacity-20">⚡</div>
                <p className="text-zinc-600 text-[0.7rem] font-medium">
                  Selecione um snippet para visualizar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
