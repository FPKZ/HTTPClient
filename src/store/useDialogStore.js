import { create } from "zustand";

/**
 * useDialogStore
 * Gerencia o estado de diálogos globais que podem ser acionados
 * tanto pelo frontend quanto pelo backend (via IPC).
 */
const useDialogStore = create((set, get) => ({
  open: false,
  title: "",
  description: "",
  options: [],
  resolvePromise: null,

  /**
   * showDialog
   * Abre o diálogo e retorna uma Promise que será resolvida quando
   * o usuário interagir com alguma opção.
   *
   * @param {object} params - { title, description, options }
   * @returns {Promise<any>} - O valor retornado pela opção selecionada
   */
  showDialog: (params) => {
    // Se já houver um diálogo aberto, resolve o anterior como cancelado/null
    const { resolvePromise } = get();
    if (resolvePromise) {
      resolvePromise(null);
    }

    return new Promise((resolve) => {
      set({
        open: true,
        title: params.title || "Aviso",
        description: params.description || "",
        options: params.options || [],
        resolvePromise: resolve,
      });
    });
  },

  /**
   * handleAction
   * Executa a ação da opção selecionada e fecha o diálogo.
   */
  handleAction: (option) => {
    const { resolvePromise } = get();

    if (option.onClick) {
      option.onClick();
    }

    if (resolvePromise) {
      resolvePromise(option.value !== undefined ? option.value : option.label);
    }

    set({ open: false, resolvePromise: null });
  },

  /**
   * closeDialog
   * Fecha o diálogo manualmente (ex: clicando fora ou no X).
   */
  closeDialog: () => {
    const { resolvePromise } = get();
    if (resolvePromise) {
      resolvePromise(null);
    }
    set({ open: false, resolvePromise: null });
  },
}));

export default useDialogStore;
