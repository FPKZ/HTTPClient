import { create } from "zustand";

/**
 * useModalStore
 * Gerencia a visibilidade de modais específicos da aplicação.
 */
const useModalStore = create((set) => ({
  isNovaCollectionOpen: false,
  isEnvInfoOpen: false,

  setNovaCollectionOpen: (isOpen) => set({ isNovaCollectionOpen: isOpen }),
  setEnvInfoOpen: (isOpen) => set({ isEnvInfoOpen: isOpen }),
}));

export default useModalStore;
