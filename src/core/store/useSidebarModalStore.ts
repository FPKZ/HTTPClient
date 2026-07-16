import { create } from "zustand";

export interface ModalConfig {
  open: boolean;
  type: "folder" | "file" | "rename" | "route:http" | "route:sse" | "route:websocket" | null;
  targetId: string | null;
  currentName?: string;
}

interface SidebarModalState {
  modalConfig: ModalConfig;
  setModalConfig: (config: ModalConfig | ((prev: ModalConfig) => ModalConfig)) => void;
}

export const useSidebarModalStore = create<SidebarModalState>((set) => ({
  modalConfig: {
    open: false,
    type: null,
    targetId: null,
    currentName: "",
  },
  setModalConfig: (config) =>
    set((state) => ({
      modalConfig: typeof config === "function" ? config(state.modalConfig) : config,
    })),
}));
