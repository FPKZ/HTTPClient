import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import CodeViewer from "../../CodeViewer";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { useCodeSnippets } from "../../../hooks/useCodeSnippets";

interface CodeSnippetsProps {
  request: any;
  theme?: string;
}

/**
 * CodeSnippets
 * Componente para exibição de códigos gerados para diferentes linguagens.
 * Lógica extraída para useCodeSnippets para melhor escalabilidade e performance.
 */
export default function CodeSnippets({ request }: CodeSnippetsProps) {
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedSnippet,
    setSelectedSnippet,
    useSelectMode,
    useRealValues,
    setUseRealValues,
    copied,
    hideSnippetsList,
    headerRef,
    contentRef,
    categories,
    filteredSnippets,
    activeCode,
    copyToClipboard,
  } = useCodeSnippets({ request });

  return (
    <div className="flex-1 h-full border-t border-zinc-700! bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        ref={headerRef}
        className="px-2 py-1.5 border-b border-zinc-800! flex justify-between items-center bg-zinc-900/30 shrink-0"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[0.65rem]! font-black tracking-widest text-zinc-500 uppercase shrink-0">
            Code Snippets
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
          {hideSnippetsList && filteredSnippets.length > 0 && (
            <div className="px-2 py-2 border-b border-zinc-800! bg-zinc-900/20 shrink-0">
              <Select
                value={selectedSnippet?.id.toString() || ""}
                onValueChange={(value) => {
                  const snippet = filteredSnippets.find(
                    (s) => s.id === parseInt(value),
                  );
                  setSelectedSnippet(snippet || null);
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
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => copyToClipboard(activeCode)}
                    className={`p-2 rounded text-[0.65rem]! font-bold transition-all! border flex items-center gap-2 justify-center ${
                      copied
                        ? "bg-green-600 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-yellow-500 border-zinc-700!"
                    }`}
                  >
                    {copied ? <Check size={10} /> : <Copy size={10} />}
                  </button>

                  <button
                    onClick={() => setUseRealValues(!useRealValues)}
                    className={`p-2 rounded border transition-all flex items-center gap-2 justify-center ${
                      useRealValues
                        ? "bg-yellow-500/10 border-yellow-500/50! text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                        : "bg-zinc-800 border-zinc-700! text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700"
                    }`}
                    title={
                      useRealValues
                        ? "Ocultar valores reais (Usar {{variaveis}})"
                        : "Mostrar valores reais das variáveis"
                    }
                  >
                    {useRealValues ? <Eye size={10} /> : <EyeOff size={10} />}
                  </button>
                </div>
              </div>

              {/* Code Display */}
              <div className="flex-1 overflow-hidden p-0 bg-[#0f0f0f]">
                <CodeViewer
                  value={activeCode}
                  language={selectedSnippet.language || "javascript"}
                  theme="code-snippet"
                  config={{
                    renderLineHighlight: "none",
                  }}
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
