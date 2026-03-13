import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDialogStore from "../store/useDialogStore";
import useUserStore from "../store/useUserStote";
import { initMonacoThemes } from "@/lib/monacoSetup";
import { useLocation } from "react-router-dom"


export default function usePreload() {
    const navigate = useNavigate();
    const showDialog = useDialogStore((state) => state.showDialog);
    const setUser = useUserStore((state) => state.setUser);
    const clearUser = useUserStore((state) => state.clearUser);
    const pathname = useLocation();


    useEffect(() => {
        initMonacoThemes();
        // Listener para navegação
        const removeNavListener = window.electronAPI.ipcRenderer.on(
            "navigate-to",
            (path) => {
            navigate(path);
            },
        );

        window.electronAPI.onUserChangerd((user) => {
                if(user){
                    setUser(user);
                }else{
                    clearUser();
                    navigate("/login");
                }
        })

        // window.electronAPI.getUser().then((user) => {
        //     if(user){
        //         setUser(user);
        //         if(pathname.pathname === "/login") navigate("/");
        //     }else{
        //         clearUser();
        //         navigate("/login");
        //     }
        // });

        // Listener para diálogos globais vindos do backend
        const removeDialogListener = window.electronAPI.ipcRenderer.on(
            "show-dialog",
            async (params) => {
            console.log("[App] Recebido evento show-dialog:", params);
            // params: { title, description, options: [{ label, value, variant }] }
            const result = await showDialog(params);
            console.log("[App] Dialog resolvido com resultado:", result);

            // Envia a resposta de volta para o backend se necessário
            if (params.id) {
                window.electronAPI.ipcRenderer.send(
                `dialog-response-${params.id}`,
                result,
                );
            }
            },
        );

        return () => {
            if (removeNavListener) removeNavListener();
            if (removeDialogListener) removeDialogListener();
        };
    }, [navigate, showDialog]);

}