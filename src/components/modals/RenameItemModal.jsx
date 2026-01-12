import React, { useEffect, useState } from "react";
import EstruturaModal from "./EstruturaModal";

export default function RenameItemModal({ children, onAdd, id, initialName }) {
  const [name, setName] = useState(initialName);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
    }
  }, [open, initialName]);

  const handleAdd = () => {
    onAdd(id, name);
    setOpen(false);
  };

  return (
    <EstruturaModal
      key={open ? "open" : "closed"}
      title="Renomear Item"
      description="Insira o novo nome do item"
      trigger={children}
      onAdd={handleAdd}
      open={open}
      onOpenChange={setOpen}
    >
      <input
        type="text"
        placeholder="Nome do item"
        className="w-full p-2 border rounded mb-4 border-zinc-800! bg-zinc-800 text-white outline-none focus:border-blue-500"
        onChange={(e) => setName(e.target.value)}
        value={name}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAdd();
          }
        }}
        autoFocus
      />
    </EstruturaModal>
  );
}
