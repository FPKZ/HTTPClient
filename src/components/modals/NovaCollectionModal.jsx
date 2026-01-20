import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useTabStore from "../../store/useTabStore";
import { useHistory } from "@/hooks/useHistory";

export default function NovaCollectionModal({ children }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const navigate = useNavigate();
  const loadCollection = useTabStore((state) => state.loadCollection);
  const { handleSaveCollection } = useHistory();

  const createTestRoute = (method) => ({
    id: `route_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 5)}_${method.toLowerCase()}`,
    type: "route",
    name: `Test Route`,
    request: {
      method: method,
      url: "https://jsonplaceholder.typicode.com/posts/1",
      headers: [
        { key: "Content-Type", value: "application/json", enabled: true },
      ],
      params: [],
      body: {
        mode: method === "GET" || method === "DELETE" ? "none" : "json",
        content:
          method === "GET" || method === "DELETE"
            ? ""
            : JSON.stringify({ title: "foo", body: "bar", userId: 1 }, null, 2),
      },
      auth: {
        name: "none",
        config: { key: "", type: "Bearer", value: "header" },
      },
    },
    response: {
      status: null,
      statusText: "",
      body: "",
      headers: [],
      time: 0,
      size: 0,
      logs: [],
    },
  });

  const handleCreate = () => {
    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    const testRoutes = methods.map(createTestRoute);

    const newCollection = {
      id: `coll_${Date.now()}`,
      collectionName: name || "Nova Coleção",
      description: desc,
      items: testRoutes, // Adiciona as 5 rotas teste
    };
    
    // Atualiza diretamente o store, forçando a re-renderização da Home
    loadCollection(newCollection);
    setOpen(false);
    navigate("/");
  };

  const [open, setOpen] = useState(false);
  
  React.useEffect(() => {
    if (window.electronAPI?.onMenuAction) {
      const unsubscribe = window.electronAPI.onMenuAction(async (action) => {
        if (action === "new-collection") {
          try {
            // Aguarda o usuário decidir se quer salvar/salvar antes de abrir o modal
            await handleSaveCollection();
          } catch (error) {
            console.error("Erro ao tentar salvar coleção:", error);
          } finally {
            setOpen(true);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [handleSaveCollection]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 animate-overlayShow" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="
            fixed left-1/2 top-1/2 
            w-[65vw] max-w-[700px] p-6 max-h-[95vh] overflow-y-auto
            -translate-x-1/2 -translate-y-1/2 
            rounded-lg border
            bg-zinc-900 border-zinc-800! shadow-xl 
            focus:outline-none z-50  data-[state=open]:animate-contentShow
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
            <div className="bg-blue-500/10 border border-blue-500/20! p-3 rounded">
              <p className="text-[0.7rem] text-blue-400">
                💡 Esta coleção será criada com 5 rotas de teste (GET, POST,
                PUT, DELETE, PATCH) para você começar a explorar.
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
