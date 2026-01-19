import React from "react";
import HistoryItem from "./HistoryItem";

/**
 * HistoryList
 * Componente que renderiza a lista de itens do histórico.
 */
export default function HistoryList({ history, onLoad, onDelete }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col h-full min-h-0">
      <h6
        className="text-gray-400 mb-3 shrink-0 uppercase tracking-wider"
        style={{ fontSize: "0.7rem" }}
      >
        Arquivos Recentes
      </h6>
      <div className="flex-1 overflow-auto d-flex flex-column gap-2 pr-2">
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
