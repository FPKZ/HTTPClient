import React, { useEffect, useState } from "react";
import EstruturaModal from "./EstruturaModal";

interface NovoItemModalProps {
  children?: React.ReactNode;
  onAdd: (name: string) => void;
  title?: string;
  description?: string;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultValue?: string;
}

export default function NovoItemModal({
  children,
  onAdd,
  title,
  description,
  placeholder,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  defaultValue = "",
}: NovoItemModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(defaultValue);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;

  const setOpen = (val: boolean) => {
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
        open={open}
        onOpenChange={setOpen}
        buttons={[
          {
            label: "Cancelar",
            onClick: () => setOpen(false),
            className: "bg-zinc-800 text-zinc-200 px-4 py-2 rounded mr-2",
          },
          {
            label: "Salvar",
            onClick: () => {
              onAdd(name);
              setOpen(false);
            },
            className: "bg-zinc-100 text-zinc-800 px-4 py-2 rounded",
          },
        ]}
      >
        <input
          type="text"
          placeholder={placeholder || "Nome do item"}
          className="w-full p-2 border rounded mb-4 border-zinc-800! bg-zinc-800 text-white outline-none focus:border-blue-500"
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
