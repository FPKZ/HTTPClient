import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { Tab } from "../../types/store";

interface SortableTabProps {
  tab: Tab;
  isActive: boolean;
  isDirty: (id: string) => boolean;
  onActivate: (id: string | null) => void;
  onClose: (e: React.MouseEvent | React.PointerEvent, tabId: string) => void;
  getMethodColor: (method: string) => string;
}

export function SortableTab({
  tab,
  isActive,
  isDirty,
  onActivate,
  onClose,
  getMethodColor,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-tab-id={tab.id}
      onAuxClick={(e) => {
        e.stopPropagation();
        onClose(e, tab.id);
      }}
      onClick={() => onActivate(tab.id)}
      className={`
        group flex items-center gap-1 px-2 h-full min-w-[180px] max-w-[220px] shrink-0 border-r border-zinc-700 cursor-pointer transition-colors select-none
        ${
          isActive
            ? "bg-zinc-900 text-white"
            : "bg-zinc-800 text-gray-400 hover:bg-zinc-750 hover:text-gray-200"
        }
      `}
    >
      {/* Indicador de Modificação */}
      {isDirty(tab.id) && (
        <div
          className="w-2 h-2 me-1 bg-orange-500 rounded-full shrink-0"
          title="Modificado"
        />
      )}

      {/* Método HTTP */}
      <span
        className={`text-[0.6rem]! font-bold ${getMethodColor(
          tab.method,
        )} min-w-[35px] shrink-0`}
      >
        {tab.method}
      </span>

      {/* Título da Aba */}
      <span className="flex-1 text-[0.7rem]! truncate" title={tab.title}>
        {tab.title}
      </span>

      {/* Botão Fechar */}
      <button
        onPointerDown={(e) => e.stopPropagation()} // Impede iniciar arrasto ao clicar em fechar
        onClick={(e) => onClose(e, tab.id)}
        className="opacity-0 group-hover:opacity-100! p-0.5 hover:bg-zinc-600 rounded transition-all shrink-0"
        title="Fechar aba"
      >
        <X size={14} />
      </button>
    </div>
  );
}
