import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createTabSlice } from "./slices/tabSlice";
import { createCollectionSlice } from "./slices/collectionSlice";

/**
 * useTabStore
 * Store centralizado utilizando o Slice Pattern para aplicar os princípios SOLID.
 *
 * Dividido em:
 * - tabSlice: Gerenciamento de abas e rascunhos.
 * - collectionSlice: Gerenciamento da árvore da coleção (fonte da verdade).
 */
const useTabStore = create(
  persist(
    (set, get) => ({
      ...createTabSlice(set, get),
      ...createCollectionSlice(set, get),
    }),
    {
      name: "httpclient-tabs-storage", // Nome da chave no localStorage
      partialize: (state) => ({
        // Persiste apenas abas e o ID da aba ativa
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    },
  ),
);

export default useTabStore;
