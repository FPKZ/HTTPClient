import { useCallback } from "react";
import { useHistory } from "./useHistory";
import useModalStore from "../store/useModalStore";

/**
 * useNewCollection
 * Hook para disparar a criação de uma nova coleção.
 * Garante que a coleção atual seja salva/confirmada antes de abrir o modal.
 */
export function useNewCollection() {
  const { handleSaveCollection } = useHistory();
  const setNovaCollectionOpen = useModalStore(
    (state) => state.setNovaCollectionOpen,
  );

  const triggerNewCollection = useCallback(async () => {
    try {
      // Tenta salvar a coleção atual antes de prosseguir
      await handleSaveCollection();
    } catch (error) {
      console.error("Erro ao salvar coleção antes de criar nova:", error);
    } finally {
      // Abre o modal de nova coleção
      setNovaCollectionOpen(true);
    }
  }, [handleSaveCollection, setNovaCollectionOpen]);

  return { triggerNewCollection };
}
