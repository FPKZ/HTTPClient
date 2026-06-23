import React from "react";
import { Trash2 } from "lucide-react";

export interface HistoryEntry {
  id: string;
  name: string;
  updatedAt: string | number | Date;
  description?: string;
  descricao?: string;
  sourceType?: string;
}

interface HistoryItemProps {
  item: HistoryEntry;
  onLoad: (item: HistoryEntry) => void;
  onDelete: (name: string, id: string) => void;
}

/**
 * HistoryItem
 * Renderiza um único item do histórico.
 */
export default function HistoryItem({ item, onLoad, onDelete }: HistoryItemProps) {
  return (
    <div
      onClick={() => onLoad(item)}
      className="flex items-center justify-between rounded-sm p-2 bg-zinc-900/50 hover:bg-zinc-800 cursor-pointer transition-colors"
    >
      <div className="flex flex-col">
        <span className="text-zinc-200 font-medium" style={{ fontSize: '0.8rem' }}>
          {item.name}
        </span>
        <small className="text-zinc-500" style={{ fontSize: '0.65rem' }}>
          {new Date(item.updatedAt).toLocaleString('pt-BR')} • {item.description || item.descricao || item.sourceType}
        </small>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-zinc-600 hover:text-yellow-500 transition-colors">
          <small style={{ fontSize: '0.6rem' }}>ABRIR</small>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.name, item.id);
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
