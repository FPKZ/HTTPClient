import type { ResponseData, RequestData } from "../index";

export { 
    ResponseData,
    RequestData
} 

export interface ServicesAPI {
    // --- Requisições e Conversão ---
    request: (data: RequestData) => Promise<ResponseData>;
    cancelRequest: (requestId: string) => void;
    startConversion: (data: any) => void;
    startDownload: () => void;
    onLog: (callback: (value: any) => void) => () => void;
    onFinished: (callback: (value: any) => void) => () => void;

    // --- WebSockets ---
    wsConnect: (params: { requestId: string, url: string, headers?: any }) => void;
    wsSend: (params: { requestId: string, message: string }) => void;
    wsDisconnect: (requestId: string) => void;
    onWsStatus: (callback: (data: { requestId: string, status: "connecting" | "connected" | "disconnected", error?: string, reason?: string, code?: number }) => void) => () => void;
    onWsMessage: (callback: (data: { requestId: string, type: "incoming", data: any, timestamp: number }) => void) => () => void;

    // --- Server-Sent Events (SSE) ---
    sseConnect: (params: { requestId: string, url: string, headers?: any }) => void;
    sseDisconnect: (requestId: string) => void;
    onSseStatus: (callback: (data: { requestId: string, status: "connecting" | "connected" | "disconnected", error?: string }) => void) => () => void;
    onSseMessage: (callback: (data: { requestId: string, event: string, data: string, id?: string, timestamp: number }) => void) => () => void;

    // --- Geral ---
    connectionDisconnectAll: (requestId: string) => void;
}