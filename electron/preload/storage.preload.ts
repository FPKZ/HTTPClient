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
    getRequestDetails: (id) => ipcRenderer.invoke("get-request-details", id),
    saveRequestDetails: (id, data) => ipcRenderer.invoke("save-request-details", { id, data }),
    getCollectionForExport: (id) => ipcRenderer.invoke("get-collection-for-export", id),
    onRequestSaveSession: (callback) => {
        const subscription = () => callback();
        ipcRenderer.on("request-save-session", subscription);
        return () => {
        ipcRenderer.removeListener("request-save-session", subscription);
        };
    },
    saveAndQuit: (data) => ipcRenderer.send("save-and-quit", data),

    // --- Coleções Granulares (CollectionService) ---
    createFolder: (params) => ipcRenderer.invoke("collections:create-folder", params),
    renameItem: (params) => ipcRenderer.invoke("collections:rename-item", params),
    deleteFolder: (params) => ipcRenderer.invoke("collections:delete-folder", params),
    createRequest: (params) => ipcRenderer.invoke("collections:create-request", params),
    duplicateRequest: (params) => ipcRenderer.invoke("collections:duplicate-request", params),
    deleteRequest: (params) => ipcRenderer.invoke("collections:delete-request", params),
    moveOrReorderItem: (params) => ipcRenderer.invoke("collections:move-or-reorder-item", params),

    // --- Workspaces ---
    getWorkspaces: (userId) => ipcRenderer.invoke("workspaces:get-all", userId),
    getWorkspaceDetails: (id) => ipcRenderer.invoke("workspaces:get-details", id),
    createWorkspace: (params) => ipcRenderer.invoke("workspaces:create", params),
    updateWorkspace: (workspace) => ipcRenderer.invoke("workspaces:update", workspace),
    deleteWorkspace: (id) => ipcRenderer.invoke("workspaces:delete", id),
    linkCollection: (params) => ipcRenderer.invoke("workspaces:link-collection", params),
    unlinkCollection: (collectionId) => ipcRenderer.invoke("workspaces:unlink-collection", collectionId),
    inviteMember: (params) => ipcRenderer.invoke("workspaces:invite-member", params),
    removeMember: (params) => ipcRenderer.invoke("workspaces:remove-member", params),
}