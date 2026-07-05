import { useEffect } from "react";
import useWorkspacesStore from "../store/slices/useWorkspacesStore";
import useCollectionStore from "../store/useCollectionStore";
import useUserStore from "../store/useUserStore";

export function useDatabaseSync() {
  const { user } = useUserStore();
  const { loadWorkspaces } = useWorkspacesStore();
  const {
    collection,
    loadCollection,
    applyCreateItem,
    applyUpdateItem,
    applyDeleteItem,
    applyMoveItem
  } = useCollectionStore();

  // Carrega os workspaces inicialmente assim que o usuário estiver logado
  useEffect(() => {
    if (user?.id) {
      loadWorkspaces(user.id);
    }
  }, [user?.id, loadWorkspaces]);

  useEffect(() => {
    if (!(window as any).electronAPI?.onDatabaseChange) return;

    const unsubscribe = (window as any).electronAPI.onDatabaseChange(
      (data: { entity: string; action?: string; id: string; data?: any }) => {
        console.log(`[useDatabaseSync] Evento de alteração recebido:`, data);

        // 1. Sincroniza Workspaces
        if (data.entity === "workspace" && user?.id) {
          loadWorkspaces(user.id);
        }

        // 2. Sincroniza Coleção Ativa
        if (data.entity === "collection") {
          if (collection.id === data.id) {
            (window as any).electronAPI
              .getCollectionById({ id: data.id, source: "local" })
              .then((updatedCol: any) => {
                if (updatedCol) {
                  loadCollection(updatedCol, true);
                }
              })
              .catch((err: any) =>
                console.error("Erro ao recarregar coleção após alteração:", err)
              );
          }
        }

        // 3. Sincronização Granular e Atômica (Pastas e Rotas)
        if (data.entity === "folder" || data.entity === "request" || data.entity === "route") {
          const normalizedEntity = (data.entity === "request" || data.entity === "route") ? "route" : "folder";
          
          if (data.action === "create") {
            applyCreateItem(normalizedEntity, data.data);
          } else if (data.action === "update") {
            applyUpdateItem(normalizedEntity, data.id, data.data);
          } else if (data.action === "delete") {
            applyDeleteItem(normalizedEntity, data.id);
          } else if (data.action === "move") {
            applyMoveItem(normalizedEntity, data.id, data.data.parentId, data.data.orderIndex);
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, collection.id, loadWorkspaces, loadCollection, applyCreateItem, applyUpdateItem, applyDeleteItem, applyMoveItem]);
}
