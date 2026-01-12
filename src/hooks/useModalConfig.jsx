
import React from "react";

export default function useModalConfig({ addFolder, addRoute, renameItem }) {
    
    const [modalConfig, setModalConfig] = React.useState({
      open: false,
      type: null,
      targetId: null,
    });

    const handleModalAdd = (name) => {
      const { type, targetId } = modalConfig;
      if (type === "folder") {
        addFolder(targetId, name);
      } else if (type === "file") {
        addRoute(targetId, name);
      } else if (type === "rename") {
        renameItem(targetId, name);
      }
      setModalConfig({ ...modalConfig, open: false });
    };
  
    const getModalProps = () => {
      switch (modalConfig.type) {
        case "folder":
          return {
            title: "Nova Pasta",
            description: "Insira o nome da nova pasta",
            trigger: <button className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white">Nova Pasta</button>,
          };
        case "file":
          return {
            title: "Nova Rota",
            description: "Insira o nome da nova rota",
            trigger: <button className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white">Nova Rota</button>,
          };
        case "rename":
          return {
            title: "Renomear Item",
            description: "Insira o novo nome do item",
            trigger: <button className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white">Renomear</button>,
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