import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useWorkspacePageContext } from "../context/WorkspacePageContext";

export default function CreateWorkspaceModal() {
  const {
    isOpenCreateModal,
    setIsOpenCreateModal,
    handleCreateWorkspace,
  } = useWorkspacePageContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Limpa os campos quando abre o modal
  useEffect(() => {
    if (isOpenCreateModal) {
      setName("");
      setDescription("");
    }
  }, [isOpenCreateModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    handleCreateWorkspace(name, description);
  };

  return (
    <Dialog.Root open={isOpenCreateModal} onOpenChange={setIsOpenCreateModal}>
      <Dialog.Portal>
        {/* Overlay do Modal */}
        <Dialog.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-[2px] z-50 transition-all" />
        
        {/* Conteúdo do Modal */}
        <Dialog.Content
          aria-describedby="create-workspace-desc"
          className="
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
            w-[90vw] max-w-[480px] p-6 rounded-xl border
            bg-[#121214] border-zinc-800/80 shadow-2xl 
            focus:outline-none z-50 text-zinc-100 select-none
          "
        >
          {/* Botão Fechar no Canto Superior */}
          <Dialog.Close asChild>
            <button
              className="
                absolute top-4 right-4 p-1 rounded-md text-zinc-500
                hover:text-zinc-300 hover:bg-zinc-900 transition-all cursor-pointer
              "
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </Dialog.Close>

          {/* Título e Descrição */}
          <Dialog.Title className="text-xl font-extrabold text-white tracking-tight">
            Criar Novo Workspace
          </Dialog.Title>
          
          <Dialog.Description
            id="create-workspace-desc"
            className="text-zinc-400 text-xs mt-1.5 mb-6"
          >
            Os workspaces ajudam você a organizar suas coleções de requisições e a colaborar com outras pessoas.
          </Dialog.Description>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Campo Nome */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Nome do Workspace *
              </label>
              <input
                id="name"
                type="text"
                autoComplete="off"
                placeholder="Ex: API Gateway, Projeto Principal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="
                  w-full px-3 py-2.5 rounded-md border text-sm
                  bg-[#0a0a0c] border-zinc-800 text-white outline-none
                  focus:border-brand/60 focus:ring-1 focus:ring-brand/40
                  transition-all placeholder-zinc-600
                "
                autoFocus
                required
              />
            </div>

            {/* Campo Descrição */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Descrição
              </label>
              <textarea
                id="description"
                placeholder="Ex: Coleção de APIs de microsserviços de pagamento..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="
                  w-full px-3 py-2.5 rounded-md border text-sm resize-none
                  bg-[#0a0a0c] border-zinc-800 text-white outline-none
                  focus:border-brand/60 focus:ring-1 focus:ring-brand/40
                  transition-all placeholder-zinc-600
                "
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-zinc-900">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="
                    px-4 py-2 text-xs font-bold rounded-md
                    bg-zinc-900 hover:bg-zinc-800 text-zinc-300
                    transition-all cursor-pointer
                  "
                >
                  Cancelar
                </button>
              </Dialog.Close>
              
              <button
                type="submit"
                disabled={!name.trim()}
                className="
                  px-4 py-2 text-xs font-bold rounded-md
                  bg-brand hover:bg-brand-hover disabled:opacity-50
                  disabled:cursor-not-allowed text-zinc-950 transition-all cursor-pointer
                "
              >
                Criar Workspace
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
