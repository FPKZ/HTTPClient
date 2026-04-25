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
}