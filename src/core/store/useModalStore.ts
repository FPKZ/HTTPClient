import { create } from "zustand";

/**
 * useModalStore
 * Gerencia a visibilidade de modais específicos da aplicação.
 */

interface ModalState {
  isNovaCollectionOpen: boolean;
  isEnvInfoOpen: boolean;
  isExportModalOpen: boolean;
  exportFormat: "json" | "http" | null;
  setNovaCollectionOpen: (isOpen: boolean) => void;
  setEnvInfoOpen: (isOpen: boolean) => void;
  setExportModalOpen: (isOpen: boolean, format?: "json" | "http" | null) => void;
}

const useModalStore = create<ModalState>((set) => ({
  isNovaCollectionOpen: false,
  isEnvInfoOpen: false,
  isExportModalOpen: false,
  exportFormat: null,

  setNovaCollectionOpen: (isOpen) => set({ isNovaCollectionOpen: isOpen }),
  setEnvInfoOpen: (isOpen) => set({ isEnvInfoOpen: isOpen }),
  setExportModalOpen: (isOpen, format = null) =>
    set({
      isExportModalOpen: isOpen,
      exportFormat: format,
    }),
}));

export default useModalStore;
