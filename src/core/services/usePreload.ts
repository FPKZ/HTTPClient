import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useDialogStore from "@/core/store/useDialogStore";
import useUserStore from "@/core/store/useUserStore";
import { initMonacoThemes } from "@/lib/monacoSetup";
import { useThemeStore } from "@/core/store";
import { applyTheme } from "@/core/store/useThemeStore";

export default function usePreload(): void {
  const navigate = useNavigate();
  const location = useLocation();
  const showDialog = (useDialogStore as any)((state: any) => state.showDialog);
  const setUser = (useUserStore as any)((state: any) => state.setUser);
  const clearUser = (useUserStore as any)((state: any) => state.clearUser);

  useEffect(() => {
    // Aplica o tema ativo ao iniciar
    const activeTheme = useThemeStore.getState().theme;
    applyTheme(activeTheme);
    initMonacoThemes();
  }, []);

  useEffect(() => {
    // Listener para navegação
    const removeNavListener = window.electronAPI.ipcRenderer.on(
      "navigate-to",
      (path: string) => {
        navigate(path);
      }
    );


    const checkUser = async () => {
      const user = await window.electronAPI.getUser();
      if (user) {
        setUser(user);
      } else {
        clearUser();
      }
    };
    checkUser();

    const removeUserListener = window.electronAPI.onUserChanged((user: any) => {
      if (user) {
        setUser(user);
      } else {
        clearUser();
      }
    });

    // Listener para diálogos globais vindos do backend
    const removeDialogListener = window.electronAPI.ipcRenderer.on(
      "show-dialog",
      async (params: any) => {
        console.log("[App] Recebido evento show-dialog:", params);
        // params: { id, title, description, options: [{ label, value, variant }] }
        const result = await showDialog(params);
        console.log("[App] Dialog resolvido com resultado:", result);

        // Envia a resposta de volta para o backend se necessário
        if (params.id) {
          window.electronAPI.ipcRenderer.send(`dialog-response-${params.id}`, result);
        }
      }
    );

    return () => {
      if (removeNavListener) removeNavListener();
      if (removeDialogListener) removeDialogListener();
      if (removeUserListener) removeUserListener();
    };
  }, [navigate, showDialog, setUser, clearUser]);
}
