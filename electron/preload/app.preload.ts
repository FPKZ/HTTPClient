import { ipcRenderer, webUtils } from "electron";
import type { AppAPI } from "../../types/api/app";

// Detecta o ambiente via argumento injetado pelo WindowManager
const isDev = process.argv.some((arg) => arg === "--is-dev=true");

export const appPreload: AppAPI = {

    // --- Estado e Utilitários ---
    isDev: isDev,
    getFilePath: (file: File) => webUtils.getPathForFile(file),

    // --- Comunicação IPC Básica ---
    ipcRenderer: {
        on(channel: string, func: (...args: any[]) => void) {
        const validChannels = [
            "update-available",
            "download-progress",
            "update-downloaded",
            "navigate-to",
            "check-for-updates",
            "show-dialog",
            "log-error",
            "new-action-log",
            "conect",
            "network-status",
            "log",
            "conversion-finished",
            "menu-action",
            "user-changed",
            "request-save-session"
        ];
        if (validChannels.includes(channel)) {
            const subscription = (_event: any, ...args: any[]) => func(...args);
            ipcRenderer.on(channel, subscription);
            return () => {
            ipcRenderer.removeListener(channel, subscription);
            };
        }
        return () => {};
        },
        send(channel: string, ...args: any[]) {
        ipcRenderer.send(channel, ...args);
        },
        invoke(channel: string, ...args: any[]) {
        return ipcRenderer.invoke(channel, ...args);
        },
    },

    teste: () => ipcRenderer.send("teste"),

    // --- Controles de Janela ---
    minimize: () => ipcRenderer.send("minimize"),
    maximize: () => ipcRenderer.send("maximize"),
    close: () => ipcRenderer.send("close"),
    closeAll: () => ipcRenderer.send("close-all"),
    forceClose: () => ipcRenderer.send("force-close"),
    toggleDevTools: () => ipcRenderer.send("toggle-dev-tools"),

    // --- Clipboard (Native) ---
    copy: () => ipcRenderer.send("clipboard:copy"),
    cut: () => ipcRenderer.send("clipboard:cut"),
    paste: () => ipcRenderer.send("clipboard:paste"),
    selectAll: () => ipcRenderer.send("clipboard:selectAll"),

    // --- Função de Log de Ações ---
    logAction: (action: any, user: any) => ipcRenderer.invoke("log-action", action, user),
    startActionLogger: () => ipcRenderer.send("start-action-logger"),
    stopActionLogger: () => ipcRenderer.send("stop-action-logger"),
    resizeWindow: (bounds: any) => ipcRenderer.send("resize-window", bounds),
    openActionLogger: () => ipcRenderer.send("open-action-logger"),

    // --- Rede ---
    conect: () => ipcRenderer.invoke("conect"),
    onNetworkStatus: (callback: any) => {
        const subscription = (_event: any, value: any) => callback(value);
        ipcRenderer.on("network-status", subscription);
        return () => {
        ipcRenderer.removeListener("network-status", subscription);
        };
    },

    // --- Menus (App) ---
    openMenu: () => ipcRenderer.send("open-menu"),
    onMenuAction: (callback) => {
        const subscription = (_event: any, value: any) => callback(value);
        ipcRenderer.on("menu-action", subscription);
        return () => {
        ipcRenderer.removeListener("menu-action", subscription);
        };
    },
  
}