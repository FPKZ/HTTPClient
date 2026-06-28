import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createCollectionSlice } from "./slices/collectionSlice";
import { CollectionSlice } from "../../../types/store";

/**
 * useCollectionStore
 * Store global exclusivo para o gerenciamento de coleções,
 * environments e variáveis globais.
 */
const useCollectionStore = create<CollectionSlice>()(
  persist(
    (set, get, api) => ({
      ...createCollectionSlice(set, get, api),
    }),
    {
      name: "httpclient-collection-storage",
      partialize: (state) => ({
        collection: state.collection,
        globals: state.globals,
      }),
    }
  )
);

export default useCollectionStore;
