import { create } from "zustand";

/**
 * useModalStore
 * Gerencia a visibilidade de modais específicos da aplicação.
 */
const useModalStore = create((set) => ({
  isNovaCollectionOpen: false,
  isEnvInfoOpen: false,
  isExportModalOpen: false,
  exportFormat: null, // 'json' | 'http'

  setNovaCollectionOpen: (isOpen) => set({ isNovaCollectionOpen: isOpen }),
  setEnvInfoOpen: (isOpen) => set({ isEnvInfoOpen: isOpen }),
  setExportModalOpen: (isOpen, format = null) => set({ 
    isExportModalOpen: isOpen,
    exportFormat: format 
  }),
}));

export default useModalStore;
