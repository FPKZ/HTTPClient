import React from "react";
import { Folder, Trash2 } from "lucide-react";
import { getRelativeTime } from "@/utils/dateUtils";

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


export default function HistoryItem({ item, onLoad, onDelete }: HistoryItemProps) {
  return (
    <div
      onClick={() => onLoad(item)}
      className="
        p-3
        flex items-center justify-between 
        rounded border border-zinc-800/80 hover:border-brand-hover 
        bg-[#141414] hover:bg-[#161616] 
        cursor-pointer transition-all duration-200 group"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
        {/* Ícone de pasta em cor de destaque volt/laranja */}
        <div className="text-amber-500 shrink-0 flex justify-center items-center">
          <Folder size={18} className="fill-current/10" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-zinc-100 font-bold text-[0.85rem] truncate leading-tight">
            {item.name}
          </span>
          <span className="text-zinc-500 text-[0.7rem] truncate mt-0.5 leading-normal">
            {item.description || item.descricao || item.sourceType || "Sem descrição"}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end gap-1">
          <span className="text-zinc-500 text-[0.6rem] font-bold uppercase tracking-wider">
            {getRelativeTime(item.updatedAt, { uppercase: true })}
          </span>
        </div>
      </div>
      <div 
        className="text-red-500 hover:bg-red-500/20 p-1 rounded hidden group-hover:flex cursor-pointer ml-2"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.name, item.id);
        }}
        title="Remover"
      >
        <Trash2 size={12} />
      </div>
    </div>
  );
}
