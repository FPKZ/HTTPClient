import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CollectionsTabsProps {
  rota: [string, any][];
  activeKey: string;
  onSelect: (key: string) => void;
  scrollRef: React.RefObject<HTMLElement | null>;
  onScroll: (e: React.UIEvent<HTMLElement>) => void;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
}

/**
 * CollectionsTabs
 * Gerencia a lista de abas superiores com navegação por scroll.
 */
export default function CollectionsTabs({
  rota,
  activeKey,
  onSelect,
  scrollRef,
  onScroll,
  canScrollLeft,
  canScrollRight,
  scrollLeft,
  scrollRight,
}: CollectionsTabsProps) {
  return (
    <div className="flex items-end relative">
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="h-full text-white bg-[#1e1e1ede] rounded-none px-1 z-10 absolute left-0 border-0 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div className="grow overflow-hidden">
        <nav
          ref={scrollRef as any}
          onScroll={onScroll}
          className="flex border-none pl-1 flex-nowrap overflow-x-auto whitespace-nowrap"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {rota.map(([key, data]) => {
            const isActive = activeKey === key;
            const method = data?.request?.method || "GET";
            
            // Definição de cores baseadas no método
            const methodColors: Record<string, string> = {
              GET: "text-green-500",
              POST: "text-blue-500",
              PUT: "text-yellow-500",
              PATCH: "text-orange-500",
              DELETE: "text-red-500",
            };
            const colorClass = methodColors[method] || "text-gray-400";

            return (
              <div key={key} className="shrink-0">
                <button
                  className={`px-3 py-1 mr-1 font-bold tracking-wide uppercase rounded-t-lg transition-colors border-0 cursor-pointer no-underline flex items-center gap-2 ${
                    isActive
                      ? "bg-zinc-800 text-yellow-500"
                      : "bg-transparent text-gray-500 hover:text-gray-300"
                  }`}
                  onClick={() => onSelect(key)}
                >
                  <span className={`${colorClass} font-black`} style={{ fontSize: "0.6rem", minWidth: "35px" }}>
                    {method}
                  </span>
                  <small style={{ fontSize: "0.7rem", maxWidth: "200px" }} className="truncate block">
                    {key.replace(/^\[.*?\]\s*/, "")}
                  </small>
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="h-full text-white bg-[#1e1e1ede] rounded-none px-1 z-10 absolute right-0 border-0 cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
