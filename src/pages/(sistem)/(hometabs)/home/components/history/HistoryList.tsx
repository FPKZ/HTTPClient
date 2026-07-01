import React from "react";
import HistoryItem, { HistoryEntry } from "./HistoryItem";
import { Trash2 } from "lucide-react";

interface HistoryListProps {
  history: HistoryEntry[];
  onLoad: (item: HistoryEntry) => void;
  onDelete: (name: string, id: string) => void;
  onAllDelete: () => void;
}

/**
 * HistoryList
 * Componente que renderiza a lista de itens do histórico.
 */
export default function HistoryList({ history, onLoad, onDelete, onAllDelete }: HistoryListProps) {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col w-full h-full min-h-0">
      <div className="flex justify-between border-b">
        <h6
          className="text-gray-300 mb-1 shrink-0 uppercase tracking-wider font-bold font-sans"
          style={{ fontSize: "0.7rem" }}
        >
          Arquivos Recentes
        </h6>
        <button
          title="Limpar histórico"
          disabled={history.length === 0}
          className="
            mb-1 shrink-0 tracking-wider font-bold font-sans underline decoration-1 cursor-pointer
            text-amber-400 hover:text-blue-500/80 transition-colors
          "
          style={{ fontSize: "0.7rem" }}
          // onClick={() => onAllDelete()}
        >
          View All
        </button>
      </div>
      <div className="flex-1 overflow-auto flex flex-col gap-2 py-3">
        {history.map((item) => (
          <HistoryItem
            key={item.id}
            item={item}
            onLoad={onLoad}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
