import React, { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import EstruturaModal from "./EstruturaModal";

export default function NovoItemModal({ children, onAdd }) {

  const [name, setName] = useState("");

  useEffect(() => {
    setName("");
  }, [children]);

  return (
    <EstruturaModal title="Adicionar Nome do Item" description="Insira o nome do item" trigger={children} onAdd={() => onAdd(name)}>
      <input
        type="text"
        placeholder="Nome do item"
        className="w-full p-2 border rounded mb-4 !border-zinc-800"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
    </EstruturaModal>
  )
}
