import React, { useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import useTabStore from "../../store/useTabStore";

/**
 * TabBar
 * Barra de abas horizontal (estilo navegador).
 */
export default function TabBar() {
  const tabs = useTabStore((state) => state.tabs);
  const activeTabId = useTabStore((state) => state.activeTabId);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const closeTab = useTabStore((state) => state.closeTab);
  const addBlankTab = useTabStore((state) => state.addBlankTab);

  const tabBarRef = useRef(null);

  // Auto-scroll para aba ativa quando muda
  useEffect(() => {
    if (tabBarRef.current && activeTabId) {
      const activeTabElement = tabBarRef.current.querySelector(
        `[data-tab-id="${activeTabId}"]`
      );
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTabId]);

  const handleCloseTab = (e, tabId) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: "text-green-400",
      POST: "text-yellow-400",
      PUT: "text-blue-400",
      DELETE: "text-red-400",
      PATCH: "text-purple-400",
    };
    return colors[method?.toUpperCase()] || "text-gray-400";
  };

  if (tabs.length === 0) {
    return (
      <div className="h-12 bg-zinc-800 border-b border-zinc-700 flex items-center justify-center">
        <button
          onClick={addBlankTab}
          className="flex items-center gap-2 px-4 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-gray-300 rounded transition-colors"
        >
          <Plus size={16} />
          <span className="text-sm">Nova Aba</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-12 bg-zinc-800 border-b border-zinc-700 flex items-center">
      {/* Abas */}
      <div
        ref={tabBarRef}
        className="flex-1 flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent"
        style={{ scrollbarWidth: "thin" }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group flex items-center gap-2 px-3 py-2 min-w-[180px] max-w-[220px] border-r border-zinc-700 cursor-pointer transition-colors
                ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-800 text-gray-400 hover:bg-zinc-750 hover:text-gray-200"
                }
              `}
            >
              {/* Método HTTP */}
              <span
                className={`text-xs font-bold ${getMethodColor(
                  tab.method
                )} min-w-[40px]`}
              >
                {tab.method}
              </span>

              {/* Título da Aba */}
              <span className="flex-1 text-sm truncate">{tab.title}</span>

              {/* Indicador de Modificação */}
              {tab.isDirty && (
                <div
                  className="w-2 h-2 bg-orange-500 rounded-full"
                  title="Modificado"
                />
              )}

              {/* Botão Fechar */}
              <button
                onClick={(e) => handleCloseTab(e, tab.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-600 rounded transition-all"
                title="Fechar aba"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Botão Nova Aba */}
      <button
        onClick={addBlankTab}
        className="px-3 py-2 hover:bg-zinc-700 transition-colors"
        title="Nova aba"
      >
        <Plus size={18} className="text-gray-400" />
      </button>
    </div>
  );
}
