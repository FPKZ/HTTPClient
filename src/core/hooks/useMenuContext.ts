import React from "react";
import useCollectionStore from "@/core/store/useCollectionStore";
import useDialogStore from "@/core/store/useDialogStore";
import useModalConfig from "./useModalConfig";

interface UseMenuContextProps {
  deleteItem: (id: string) => void;
  reorderItems: (activeId: string, overId: string | null, isBelow?: boolean) => void;
}

export default function useMenuContext({
  deleteItem,
  reorderItems,
}: UseMenuContextProps) {
  const { modalConfig, setModalConfig } = useModalConfig();
  const showDialog = useDialogStore((state) => state.showDialog);

  React.useEffect(() => {
    if (!window.electronAPI?.onContextMenuAction) return;

    const unsubscribe = window.electronAPI.onContextMenuAction((data: any) => {
      const { action, targetId } = data;

      switch (action) {
        case "create-folder":
          setModalConfig({ open: true, type: "folder", targetId });
          break;
        case "create-file":
          setModalConfig({ open: true, type: "file", targetId });
          break;
        case "rename":
          setModalConfig({
            open: true,
            type: "rename",
            targetId,
            currentName: data.name, // Passa o nome vindo do contexto
          });
          break;
        case "delete":
          (async () => {
            const confirmed = await showDialog({
              title: "Deletar item",
              description: "Tem certeza que deseja excluir este item?",
              options: [
                { label: "Cancelar", value: false, variant: "secondary" },
                { label: "Confirmar", value: true, variant: "danger" },
              ],
            });
            if (confirmed) {
              deleteItem(targetId);
            }
          })();
          break;
        default:
          console.warn("Ação desconhecida:", action);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [deleteItem, setModalConfig, showDialog]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const isDroppable = over.id.toString().startsWith("droppable-");
    const isOverFolder =
      over.data.current?.type === "folder" ||
      isDroppable;
    const targetFolderId =
      over.data.current?.id ||
      (isDroppable
        ? over.id.toString().replace("droppable-", "")
        : null);

    if (isOverFolder && targetFolderId && active.id !== targetFolderId) {
      // Se colidiu no droppable dos sub-itens (ex: área vazia ou texto "Pasta vazia"),
      // vai direto para dentro da pasta sem calcular ratioY.
      if (isDroppable) {
        useCollectionStore.getState().moveItemToFolder(active.id, targetFolderId);
        return;
      }

      // Caso contrário, colidiu com o sortable da linha. Calcula ratioY da linha para decidir reordenação.
      const element = document.getElementById(targetFolderId);
      const pointerEvent = event.activatorEvent as MouseEvent;

      if (element && pointerEvent && typeof pointerEvent.clientY === "number") {
        const rect = element.getBoundingClientRect();
        const relativeY = pointerEvent.clientY - rect.top;
        const ratioY = relativeY / rect.height;

        // Se soltou na borda superior (15%) ou inferior (15%) da pasta,
        // trata como reordenação (colocar entre), e não jogar dentro.
        if (ratioY < 0.15 || ratioY > 0.85) {
          const isBelow = ratioY > 0.85;
          reorderItems(active.id, targetFolderId, isBelow);
          return;
        }
      }

      useCollectionStore.getState().moveItemToFolder(active.id, targetFolderId);
      return;
    }

    if (active.id !== over.id) {
      const element = document.getElementById(over.id);
      const pointerEvent = event.activatorEvent as MouseEvent;
      let isBelow = false;

      if (element && pointerEvent && typeof pointerEvent.clientY === "number") {
        const rect = element.getBoundingClientRect();
        const relativeY = pointerEvent.clientY - rect.top;
        const ratioY = relativeY / rect.height;
        isBelow = ratioY > 0.5;
      }

      reorderItems(active.id, over.id, isBelow);
    }
  };

  const handleContextMenu = (e: React.MouseEvent | MouseEvent) => {
    // Só dispara se clicar diretamente no container ou na área vazia
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    if (
      target === currentTarget ||
      target.classList.contains("p-2") ||
      target.classList.contains("flex-1")
    ) {
      e.preventDefault();
      if (window.electronAPI?.showRootContextMenu) {
        window.electronAPI.showRootContextMenu();
      }
    }
  };

  return { handleDragEnd, handleContextMenu, modalConfig, setModalConfig };
}
