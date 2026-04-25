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
}