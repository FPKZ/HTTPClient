import React from "react";
import HistoryItem from "./HistoryItem";
import { Trash2 } from "lucide-react";

/**
 * HistoryList
 * Componente que renderiza a lista de itens do histórico.
 */
export default function HistoryList({ history, onLoad, onDelete, onAllDelete }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col h-full min-h-0">
      <div className="flex justify-between">
        <h6
          className="text-gray-400 mb-3 shrink-0 uppercase tracking-wider"
          style={{ fontSize: "0.7rem" }}
        >
          Arquivos Recentes
        </h6>
        <button
          title="Limpar histórico"
          disabled={history.length === 0}
          className="
            mb-3 shrink-0 uppercase tracking-wider cursor-pointer
            text-gray-400 hover:text-red-500 transition-colors
          "
          style={{ fontSize: "0.7rem" }}
          onClick={() => onAllDelete()}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-auto d-flex flex-column gap-2">
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
