import { create } from "zustand";

/**
 * useModalStore
 * Gerencia a visibilidade de modais específicos da aplicação.
 */
const useModalStore = create((set) => ({
  isNovaCollectionOpen: false,

  setNovaCollectionOpen: (isOpen) => set({ isNovaCollectionOpen: isOpen }),

  // Pode adicionar outros modais aqui no futuro
  // isSettingsOpen: false,
  // setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
}));

export default useModalStore;
