import React from "react";

interface ModalConfig {
  open: boolean;
  type: "folder" | "file" | "rename" | null;
  targetId: string | null;
  currentName: string;
}

interface UseModalConfigProps {
  addFolder: (parentId: string | null, name: string) => void;
  addRoute: (parentId: string | null, name: string) => void;
  renameItem: (id: string | null, name: string) => void;
}

export default function useModalConfig({ addFolder, addRoute, renameItem }: UseModalConfigProps) {
  const [modalConfig, setModalConfig] = React.useState<ModalConfig>({
    open: false,
    type: null,
    targetId: null,
    currentName: "", // Adicionado para carregar o nome atual
  });

  const handleModalAdd = (name: string) => {
    const { type, targetId } = modalConfig;
    if (type === "folder") {
      addFolder(targetId, name);
    } else if (type === "file") {
      addRoute(targetId, name);
    } else if (type === "rename") {
      renameItem(targetId, name);
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
