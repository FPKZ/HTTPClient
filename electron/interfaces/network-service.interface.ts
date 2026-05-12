export interface NetworkRequestParams {
  url: string;
  method: string;
  headers?: any;
  body?: any;
  bodyMode?: "none" | "raw" | "formdata" | "urlencoded" | "binary" | "stream" | "json";
  timeout?: number;
  streamPath?: string;
  signal?: AbortSignal;
  auth?: {
    mode: "a1" | "basic" | "bearer" | "none";
    a1?: {
      pfxPath?: string;
      pfxPassword?: string;
    };
  };
}

export interface NetworkResponse {
  status: number;
  statusText: string;
  headers: any;
  data: any;
  isImage?: boolean;
  isPDF?: boolean;
  isAudio?: boolean;
  isVideo?: boolean;
  isCancelled?: boolean;
  isError?: boolean;
  contentType: string;
  url?: string;
  responseTime: number;
  responseSize: number;
}

export interface INetworkService {
  execute(params: NetworkRequestParams, logCallback?: (data: any) => void): Promise<NetworkResponse>;
}
