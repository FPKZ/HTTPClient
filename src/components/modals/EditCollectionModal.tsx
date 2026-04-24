import React, { useEffect, useState } from "react";
import EstruturaModal from "./EstruturaModal";

interface EditCollectionModalProps {
  openExternal: boolean;
  setExternalOpen: (open: boolean) => void;
  func: (name: string, desc: string) => void;
  externalName: string;
  externalDesc: string;
}

/**
 * Modal para editar uma coleção existente.
 */
export default function EditCollectionModal({
  openExternal,
  setExternalOpen,
  func,
  externalName,
  externalDesc,
}: EditCollectionModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(externalName);
  const [desc, setDesc] = useState(externalDesc);

  const open = openExternal || internalOpen;

  useEffect(() => {
    if (open) {
      setName(externalName);
      setDesc(externalDesc);
    }
  }, [open, externalName, externalDesc]);

  const setOpen = (val: boolean) => {
    if (setExternalOpen !== undefined) {
      setExternalOpen(val);
    }
    setInternalOpen(val);
  };

  const handleSave = () => {
    func(name, desc);
    setOpen(false);
  };

  return (
    <EstruturaModal
      title="Editar Coleção"
      description="Edite os dados desta coleção"
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
          onClick: handleSave,
          className: "bg-zinc-100 text-zinc-800 px-4 py-2 rounded",
        },
      ]}
    >
      <div className="space-y-4 mb-4">
        <div>
          <label className="text-[0.65rem] font-bold text-zinc-500 mb-1 block uppercase tracking-wider">
            Nome da Coleção
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: API de Produção"
            className="w-full p-2 bg-zinc-950 border border-zinc-800! rounded text-sm text-white focus:border-yellow-600 outline-none transition-colors"
            autoFocus
          />
        </div>
        <div>
          <label className="text-[0.65rem] font-bold text-zinc-500 mb-1 block uppercase tracking-wider">
            Descrição (Opcional)
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Uma breve descrição sobre esta coleção..."
            className="w-full p-2 bg-zinc-950 border border-zinc-800! rounded text-sm text-white focus:border-yellow-600 outline-none h-20 resize-none transition-colors"
          />
        </div>
      </div>
    </EstruturaModal>
  );
}
