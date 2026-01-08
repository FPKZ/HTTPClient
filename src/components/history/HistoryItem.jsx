import React from "react";
import { Trash2 } from "lucide-react";

/**
 * HistoryItem
 * Renderiza um único item do histórico.
 */
export default function HistoryItem({ item, onLoad, onDelete }) {
  return (
    <div
      onClick={() => onLoad(item)}
      className="d-flex items-center justify-between rounded-1 p-2 bg-zinc-900/50 hover:bg-zinc-800 cursor-pointer transition-colors"
    >
      <div className="d-flex flex-column">
        <span className="text-zinc-200 font-medium" style={{ fontSize: '0.8rem' }}>
          {item.name}
        </span>
        <small className="text-zinc-500" style={{ fontSize: '0.65rem' }}>
          {new Date(item.updatedAt).toLocaleString('pt-BR')} • {item.sourceType}
        </small>
      </div>
      <div className="d-flex items-center gap-3">
        <div className="text-zinc-600 hover:text-yellow-500 transition-colors">
          <small style={{ fontSize: '0.6rem' }}>ABRIR</small>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e, item.id);
          }}
          className="p-1.5 rounded-full hover:bg-red-500/20 text-zinc-600 hover:text-red-500 transition-colors border-none bg-transparent"
          title="Excluir do histórico"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
