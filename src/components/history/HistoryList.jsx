import React from "react";
import HistoryItem from "./HistoryItem";

/**
 * HistoryList
 * Componente que renderiza a lista de itens do histórico.
 */
export default function HistoryList({ history, onLoad, onDelete }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-4">
      <h6 className="text-gray-400 mb-3 uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>
        Arquivos Recentes
      </h6>
      <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '250px' }}>
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
