import { useState, useEffect, useRef, useMemo, useCallback } from "react";

export default function CodeSnipers() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [useSelectMode, setUseSelectMode] = useState(false);
  const [hideSnippetsList, setHideSnippetsList] = useState(false);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const previousCategoryRef = useRef(activeCategory);

  // Snippets de exemplo - pode ser substituído por dados do store
  const snippets = useMemo(
    () => [
      {
        id: 1,
        title: "JavaScript - Fetch",
        category: "javascript",
        language: "javascript",
        code: `const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 2500,
    currency: 'USD'
  })
};

fetch('https://api.example.io/v1/authorize', options)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
      },
      {
        id: 2,
        title: "Python - Requests",
        category: "python",
        language: "python",
        code: `import requests

url = 'https://api.example.io/v1/users'
headers = {'Authorization': 'Bearer token123'}
response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    print(data)`,
      },
      {
        id: 3,
        title: "cURL - POST Request",
        category: "curl",
        language: "bash",
        code: `curl -X POST https://api.example.io/v1/data \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"name":"John","email":"john@example.com"}'`,
      },
    ],
    [],
  );

  const categories = useMemo(
    () => [
      { id: "all", label: "Todos", count: snippets.length },
      {
        id: "javascript",
        label: "JavaScript",
        count: snippets.filter((s) => s.category === "javascript").length,
      },
      {
        id: "python",
        label: "Python",
        count: snippets.filter((s) => s.category === "python").length,
      },
      {
        id: "curl",
        label: "cURL",
        count: snippets.filter((s) => s.category === "curl").length,
      },
    ],
    [snippets],
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    updateSnippetOnCategoryChange();
  }, [updateSnippetOnCategoryChange]);

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
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="bg-zinc-900/80 border border-zinc-800! rounded-lg! px-2.5 py-1.5 m-[1px]! text-[0.6rem]! font-bold uppercase text-yellow-500 focus:border-yellow-600 outline-none transition-colors ml-4 shrink-0"
          >
            {categories
              .filter((cat) => cat.id !== "all")
              .map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                  className="bg-zinc-900 text-zinc-300"
                >
                  {cat.label} ({cat.count})
                </option>
              ))}
          </select>
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
            {filteredSnippets.length === 0 ? (
              <div className="p-4 text-center text-zinc-600 text-[0.7rem]">
                Nenhum snippet encontrado
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="px-2 py-2 border-b border-zinc-800! bg-zinc-900/20 shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar snippets..."
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800! rounded text-[0.7rem] text-white placeholder-zinc-600 focus:border-yellow-600 outline-none transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
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
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          snippet.category === "javascript"
                            ? "bg-yellow-500"
                            : snippet.category === "python"
                              ? "bg-blue-500"
                              : "bg-green-500"
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
              <select
                value={selectedSnippet?.id || ""}
                onChange={(e) => {
                  const snippet = filteredSnippets.find(
                    (s) => s.id === parseInt(e.target.value),
                  );
                  setSelectedSnippet(snippet);
                }}
                className="w-full bg-zinc-900/80 border border-zinc-800! rounded-lg! px-2.5 py-1.5 text-[0.65rem]! font-bold text-yellow-500 focus:border-yellow-600 outline-none transition-colors"
              >
                {/* <option value="" className="bg-zinc-900 text-zinc-500">
                  Selecione um snippet...
                </option> */}
                {filteredSnippets.map((snippet) => (
                  <option
                    key={snippet.id}
                    value={snippet.id}
                    className="bg-zinc-900 text-zinc-300"
                  >
                    {snippet.title} ({snippet.category})
                  </option>
                ))}
              </select>
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
              <div className="flex-1 overflow-auto p-2">
                <pre className="text-[0.7rem]! m-0 text-zinc-300 font-mono leading-relaxed permitirSelect">
                  <code className="language-javascript">
                    {selectedSnippet.code}
                  </code>
                </pre>
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
