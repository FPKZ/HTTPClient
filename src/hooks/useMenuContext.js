import React from "react";
import useTabStore from "../store/useTabStore";

export default function useMenuContext({ modalConfig, setModalConfig, deleteItem, reorderItems }) {

  React.useEffect(() => {
    if (!window.electronAPI?.onContextMenuAction) return;

    const unsubscribe = window.electronAPI.onContextMenuAction((data) => {
      const { action, targetId } = data;

      switch (action) {
        case "create-folder":
          setModalConfig({ open: true, type: "folder", targetId });
          break;
        case "create-file":
          setModalConfig({ open: true, type: "file", targetId });
          break;
        case "rename":
          setModalConfig({ open: true, type: "rename", targetId });
          break;
        case "delete":
          (async () => {
            const confirmed = await window.electronAPI.confirm("Tem certeza que deseja excluir este item?");
            if (confirmed) {
              deleteItem(targetId);
            }
          })();
          break;
        default:
          console.warn("Ação desconhecida:", action);
      }
    });
    return unsubscribe;
  }, [deleteItem]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    // Check if dropped ONTO a folder (either specifically the droppable or the sortable folder)
    const isOverFolder =
      over.data.current?.type === "folder" ||
      over.id.toString().startsWith("droppable-");
    const targetFolderId =
      over.data.current?.id ||
      (over.id.toString().startsWith("droppable-")
        ? over.id.toString().replace("droppable-", "")
        : null);

    if (isOverFolder && targetFolderId && active.id !== targetFolderId) {
      useTabStore.getState().moveItemToFolder(active.id, targetFolderId);
      return;
    }

    if (active.id !== over.id) {
      reorderItems(active.id, over.id);
    }
  };

  const handleContextMenu = (e) => {
    // Só dispara se clicar diretamente no container ou na área vazia
    if (
      e.target === e.currentTarget ||
      e.target.classList.contains("p-2") ||
      e.target.classList.contains("flex-1")
    ) {
      e.preventDefault();
      if (window.electronAPI?.showRootContextMenu) {
        window.electronAPI.showRootContextMenu();
      }
    }
  };

  

  return { handleDragEnd, handleContextMenu, modalConfig, setModalConfig };
}
