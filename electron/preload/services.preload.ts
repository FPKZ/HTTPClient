import { ipcRenderer } from "electron";
import type { ServicesAPI, RequestData, ResponseData } from "../../types/api/services";

export const servicesPreload: ServicesAPI = {
    // --- Requisições e Conversão ---
    request: (data: RequestData) => ipcRenderer.invoke("request", data) as Promise<ResponseData>,
    cancelRequest: (requestId: string) => ipcRenderer.send("cancel-request", requestId),
    startConversion: (data) => ipcRenderer.send("start-conversion", data),
    startDownload: () => ipcRenderer.send("start-download"),
    onLog: (callback) => {
        const subscription = (_event: any, value: any) => callback(value);
        ipcRenderer.on("log", subscription);
        return () => {
        ipcRenderer.removeListener("log", subscription);
        };
    },
    onFinished: (callback) => {
        const subscription = (_event: any, value: any) => callback(value);
        ipcRenderer.on("conversion-finished", subscription);
        return () => {
        ipcRenderer.removeListener("conversion-finished", subscription);
        };
    },

    // --- WebSockets ---
    wsConnect: (params) => ipcRenderer.send("ws:connect", params),
    wsSend: (params) => ipcRenderer.send("ws:send", params),
    wsDisconnect: (requestId) => ipcRenderer.send("ws:disconnect", requestId),
    onWsStatus: (callback) => {
        const subscription = (_event: any, value: any) => callback(value);
        ipcRenderer.on("ws:status", subscription);
        return () => {
            ipcRenderer.removeListener("ws:status", subscription);
        };
    },
    onWsMessage: (callback) => {
        const subscription = (_event: any, value: any) => callback(value);
        ipcRenderer.on("ws:message", subscription);
        return () => {
            ipcRenderer.removeListener("ws:message", subscription);
        };
    },

    // --- Server-Sent Events (SSE) ---
    sseConnect: (params) => ipcRenderer.send("sse:connect", params),
    sseDisconnect: (requestId) => ipcRenderer.send("sse:disconnect", requestId),
    onSseStatus: (callback) => {
        const subscription = (_event: any, value: any) => callback(value);
        ipcRenderer.on("sse:status", subscription);
        return () => {
            ipcRenderer.removeListener("sse:status", subscription);
        };
    },
    onSseMessage: (callback) => {
        const subscription = (_event: any, value: any) => callback(value);
        ipcRenderer.on("sse:message", subscription);
        return () => {
            ipcRenderer.removeListener("sse:message", subscription);
        };
    },

    // --- Geral ---
    connectionDisconnectAll: (requestId) => ipcRenderer.send("connection:disconnect-all", requestId),
}