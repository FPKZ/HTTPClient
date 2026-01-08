import { useEffect } from "react";

/**
 * useQuickExit
 * Gerencia o fechamento rápido do aplicativo em resposta ao sinal de salvamento do Electron.
 * @param {Function} onSave Optional callback to perform saving before quitting.
 */
export function useQuickExit(onSave) {
  useEffect(() => {
    if (window.electronAPI?.onRequestSaveSession) {
      const unsubscribe = window.electronAPI.onRequestSaveSession(() => {
        if (onSave) {
          onSave();
        } else {
          // Se não houver lógica de salvamento, fecha o app imediatamente
          window.electronAPI.close();
        }
      });
      return () => unsubscribe && unsubscribe();
    }
  }, [onSave]);
}
