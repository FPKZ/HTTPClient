import React from "react";
import HistoryItem, { HistoryEntry } from "./HistoryItem";

interface HistoryListProps {
  history: HistoryEntry[];
  onLoad: (item: HistoryEntry) => void;
  onDelete: (name: string, id: string) => void;
  onAllDelete: () => void;
}

export default function HistoryList({ history, onLoad, onDelete, onAllDelete }: HistoryListProps) {
  if (!history || history.length === 0) return null;

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-2 mb-3">
        <h6
          className="text-zinc-500 uppercase tracking-wider font-bold font-sans text-[0.7rem]"
        >
          Recent Collections
        </h6>
        <button
          title="Limpar histórico"
          disabled={history.length === 0}
          className="
            tracking-wider font-bold font-sans cursor-pointer
            text-brand hover:text-brand-hover transition-colors
          "
          style={{ fontSize: "0.75rem" }}
        >
          View All
        </button>
      </div>
      <div className="flex-1 overflow-auto flex flex-col gap-2 py-1 custom-scrollbar">
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
