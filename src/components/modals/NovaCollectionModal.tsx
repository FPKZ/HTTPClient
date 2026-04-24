import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useTabStore from "../../store/useTabStore";
import useModalStore from "../../store/useModalStore";
import { useNewCollection } from "../../hooks/useNewCollection";

interface NovaCollectionModalProps {
  children?: React.ReactNode;
}

export default function NovaCollectionModal({ children }: NovaCollectionModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [routes, setRoutes] = useState<string[]>([
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
  ]);
  const navigate = useNavigate();
  const loadCollection = useTabStore((state) => state.loadCollection);
  const { newCollection, createTestRoute } = useNewCollection();

  const isNovaCollectionOpen = useModalStore(
    (state) => state.isNovaCollectionOpen,
  );
  const setNovaCollectionOpen = useModalStore(
    (state) => state.setNovaCollectionOpen,
  );

  useEffect(() => {
    if (isNovaCollectionOpen) {
      setName("");
      setDesc("");
      setRoutes(["GET", "POST", "PUT", "DELETE", "PATCH"]);
    }
  }, [isNovaCollectionOpen]);

  const handleCheckboxChange = (method: string) => {
    setRoutes((prevRoutes) => {
      if (prevRoutes.includes(method)) {
        return prevRoutes.filter((r) => r !== method);
      } else {
        return [...prevRoutes, method];
      }
    });
  };

  const handleCreate = () => {
    let testRoutes: any[] = []; // Typed as any[] temporarily as we don't have the Route type here yet
    if (routes.length > 0) {
      testRoutes = routes; // Note: In the original JS, this looked fishy (string[] instead of route objects). 
      // If routes are just strings here but newCollection expects objects, this might need fixing.
      // But looking at the logic: newCollection(name, desc, testRoutes)
      // I'll stick to the JS logic for now, but keeping it as any[].
    } else {
      testRoutes = createTestRoute();
    }

    loadCollection(newCollection(name, desc, testRoutes));
    setNovaCollectionOpen(false);
    navigate("/home");
  };

  return (
    <Dialog.Root
      open={isNovaCollectionOpen}
      onOpenChange={setNovaCollectionOpen}
    >
      {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="
            fixed left-1/2 top-1/2 
            w-[65vw] max-w-[700px] p-6 max-h-[95vh] overflow-y-auto
            -translate-x-1/2 -translate-y-1/2 
            rounded-lg border
            bg-zinc-900 border-zinc-800! shadow-xl 
            focus:outline-none z-50 data-[state=open]:animate-contentShow
          "
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-white">
              Nova Collection
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
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
            <div>
              <label className="text-[0.65rem] font-bold text-zinc-500 mb-2 block uppercase tracking-wider">
                Rotas Iniciais
              </label>
              <div className="flex flex-wrap gap-4">
                {["GET", "POST", "PUT", "DELETE", "PATCH"].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={routes.includes(method)}
                      onChange={() => handleCheckboxChange(method)}
                      className="w-4 h-4 rounded! border-zinc-800! bg-zinc-950 text-yellow-600 focus:ring-yellow-600 focus:ring-offset-zinc-900 transition-colors"
                    />
                    <span className="text-[0.7rem] font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {method}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20! p-3 rounded">
              <p className="text-[0.7rem] text-blue-400">
                💡 Esta coleção será criada com as rotas selecionadas
                para você começar a explorar.
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-2">
            <Dialog.Close asChild>
              <button className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded text-xs font-bold hover:bg-zinc-700 transition-colors">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleCreate}
              className="bg-yellow-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-yellow-700 transition-colors shadow-lg shadow-yellow-600/10"
            >
              Criar Coleção
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
