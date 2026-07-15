import React from "react";
import { useSidebarModalStore } from "@/core/store/useSidebarModalStore";
import useCollectionStore from "@/core/store/useCollectionStore";

export default function useModalConfig() {
  const { modalConfig, setModalConfig } = useSidebarModalStore();
  
  const addFolder = useCollectionStore((state) => state.addFolder);
  const addRoute = useCollectionStore((state) => state.addRoute);
  const renameItem = useCollectionStore((state) => state.renameItem);

  const handleModalAdd = (name: string) => {
    const { type, targetId } = modalConfig;
    if (type === "folder") {
      addFolder?.(targetId, name);
    } else if (type === "file" || type === "route:http") {
      addRoute?.(targetId, name, "http");
    } else if (type === "route:sse") {
      addRoute?.(targetId, name, "sse");
    } else if (type === "route:websocket") {
      addRoute?.(targetId, name, "websocket");
    } else if (type === "rename") {
      if (targetId) renameItem?.(targetId, name);
    }
    setModalConfig({ ...modalConfig, open: false, currentName: "" });
  };

  const getModalProps = () => {
    switch (modalConfig.type) {
      case "folder":
        return {
          title: "Nova Pasta",
          description: "Insira o nome da nova pasta",
          trigger: (
            <button className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white">
              Nova Pasta
            </button>
          ),
        };
      case "file":
      case "route:http":
        return {
          title: "Nova Rota HTTP",
          description: "Insira o nome da nova rota HTTP",
          trigger: null,
        };
      case "route:sse":
        return {
          title: "Nova Conexão SSE",
          description: "Insira o nome da nova conexão SSE",
          trigger: null,
        };
      case "route:websocket":
        return {
          title: "Nova Conexão WebSocket",
          description: "Insira o nome da nova conexão WebSocket",
          trigger: null,
        };
      case "rename":
        return {
          title: "Renomear Item",
          description: "Insira o novo nome do item",
          defaultValue: modalConfig.currentName, // Passa o nome atual para o input
          trigger: (
            <button className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white">
              Renomear
            </button>
          ),
        };
      default:
        return {
          title: "",
          description: "",
          trigger: null,
        };
    }
  };

  return { modalConfig, setModalConfig, handleModalAdd, getModalProps };
}

