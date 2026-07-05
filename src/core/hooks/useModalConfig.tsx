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
    } else if (type === "file") {
      addRoute?.(targetId, name);
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
        return {
          title: "Nova Rota",
          description: "Insira o nome da nova rota",
          trigger: (
            <button className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white">
              Nova Rota
            </button>
          ),
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

