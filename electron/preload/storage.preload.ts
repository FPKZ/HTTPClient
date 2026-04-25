import { ipcRenderer } from "electron";
import type { StorageAPI } from "../../types/api/storage";

export const storagePreload: StorageAPI = {
    // --- Diálogos e Sistema de Arquivos ---
    selectFolder: () => ipcRenderer.invoke("dialog:openDirectory"),
    selectFile: (filters) => ipcRenderer.invoke("dialog:openFile", filters),
    selectSaveLocation: () => ipcRenderer.invoke("dialog:saveLocation"),
    saveFile: (data) => ipcRenderer.invoke("save-file", data),
    readJsonFile: (path) => ipcRenderer.invoke("read-json-file", path),
    exportHttp: (data) => ipcRenderer.invoke("export-http", data),
    confirm: (message) => ipcRenderer.invoke("dialog:confirm", message),
    newFile: () => ipcRenderer.send("new-file"),

    // --- Gestão de Coleções e Histórico ---
    getHistory: () => ipcRenderer.invoke("get-history"),
    saveHistory: (data) => ipcRenderer.invoke("save-history", data),
    getCollectionById: (params) => ipcRenderer.invoke("get-collection-by-id", params),
    deleteHistoryItem: (id) => ipcRenderer.invoke("delete-history-item", id),
    deleteAllHistory: () => ipcRenderer.invoke("delete-all-history"),
    onRequestSaveSession: (callback) => {
        const subscription = () => callback();
        ipcRenderer.on("request-save-session", subscription);
        return () => {
        ipcRenderer.removeListener("request-save-session", subscription);
        };
    },
    saveAndQuit: (data) => ipcRenderer.send("save-and-quit", data),   
}