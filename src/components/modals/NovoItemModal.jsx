import React, { useEffect, useState } from "react";
import EstruturaModal from "./EstruturaModal";

export default function NovoItemModal({
  children,
  onAdd,
  title,
  description,
  placeholder,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  defaultValue = "",
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(defaultValue);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;

  const setOpen = (val) => {
    if (setExternalOpen !== undefined) {
      setExternalOpen(val);
    }
    setInternalOpen(val);
  };

  // Reset name when modal opens
  useEffect(() => {
    if (open) {
      setName(defaultValue);
    }
  }, [open, defaultValue]);

  

  function build() {
    return (
      <EstruturaModal
        title={title || "Adicionar Nome do Item"}
        description={description || "Insira o nome do item"}
        trigger={children}
        onAdd={() => onAdd(name)}
        open={open}
        onOpenChange={setOpen}
      >
        <input
          type="text"
          placeholder={placeholder || "Nome do item"}
          className="w-full p-2 border rounded mb-4 !border-zinc-800 bg-zinc-800 text-white outline-none focus:border-blue-500"
          onChange={(e) => setName(e.target.value)}
          value={name}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAdd(name);
              setOpen(false);
            }
          }}
          autoFocus
        />
      </EstruturaModal>
    );
  }

  return build();
}
