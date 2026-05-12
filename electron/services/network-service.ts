import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import https from "https";
import { Worker } from "worker_threads";
import { INetworkService, NetworkRequestParams, NetworkResponse } from "../interfaces/network-service.interface";

/**
 * NetworkService
 * Responsável exclusivamente por executar requisições HTTP via Axios.
 * Segue o SRP ao isolar toda a complexidade de FormData e buffers de resposta.
 */

export class NetworkService implements INetworkService {
  private MAX_MEMORY_BUFFER: number;
  private DEFAULT_TIMEOUT: number;
  private WORKER_THRESHOLD: number;

  constructor() {
    this.MAX_MEMORY_BUFFER = 50 * 1024 * 1024; // 50MB
    this.DEFAULT_TIMEOUT = 60000; // 60s
    this.WORKER_THRESHOLD = 256 * 1024; // 256KB - Limite para usar Worker
  }

  /**
   * Executa uma requisição HTTP.
   * @param params - { url, method, headers, body, bodyMode, timeout, streamPath, signal }
   * @param logCallback - Callback para enviar logs parciais.
   * @returns Resposta processada.
   */
  async execute(params: NetworkRequestParams, logCallback?: (data: any) => void): Promise<NetworkResponse> {
    const { url, method, headers, body, bodyMode, timeout, streamPath, signal, auth } = params;
    let requestData: any = body;
    let requestHeaders = { ...headers };
    let httpsAgent: https.Agent | null = null;

    // 0. Autenticação A1 (Certificado Cliente)
    if (auth?.mode === "a1" && auth.a1?.pfxPath) {
      try {
        if (fs.existsSync(auth.a1.pfxPath)) {
          const pfx = fs.readFileSync(auth.a1.pfxPath);
          httpsAgent = new https.Agent({
            pfx,
            passphrase: auth.a1.pfxPassword || "",
            rejectUnauthorized: false, // Opcional: permite certificados auto-assinados de servidores no MTLS
          });
        }
      } catch (e) {
        console.error("Erro ao carregar certificado A1:", e);
      }
    }

    // 1. FormData (modo explícito ou presença de arquivos em objeto genérico)
    const isFormData = bodyMode === "formdata";
    const hasFiles = this._checkIfHasFiles(body);

    if (isFormData || hasFiles) {
      const form = new FormData();
      if (body && typeof body === "object") {
        for (const [key, value] of Object.entries(body as any)) {
          if (this._isFileData(value)) {
            if (this._validateFilePath(value.src)) {
              form.append(key, fs.createReadStream(value.src));
            }
          } else if (typeof value === "string" && (value.includes("/") || value.includes("\\"))) {
            if (this._validateFilePath(value)) {
              form.append(key, fs.createReadStream(value));
            } else {
              form.append(key, value);
            }
          } else {
            form.append(key, typeof value === "object" ? JSON.stringify(value) : value);
          }
        }
      }
      requestData = form;
      requestHeaders = { ...requestHeaders, ...form.getHeaders() };
    }

    // 2. URL-Encoded
    if (bodyMode === "urlencoded") {
      const urlParams = new URLSearchParams();
      if (body && typeof body === "object") {
        for (const [key, value] of Object.entries(body as object)) {
          urlParams.append(key, value);
        }
      }
      requestData = urlParams.toString();
      requestHeaders["content-type"] = "application/x-www-form-urlencoded";
    }

    // 3. Binary Raw
    if (bodyMode === "binary") {
      if (this._isFileData(body)) {
        if (this._validateFilePath(body.src)) {
          requestData = fs.createReadStream(body.src);
        }
      } else if (Buffer.isBuffer(body) || typeof body === "string") {
        requestData = body;
      }
    }

    const startTime = Date.now();
    try {
      const response: AxiosResponse = await axios({
        method,
        url,
        headers: requestHeaders,
        data: requestData,
        timeout: timeout || this.DEFAULT_TIMEOUT,
        httpsAgent, // Injeção do certificado client se existir
        signal: signal, // Suporte a cancelamento
        responseType: bodyMode === "stream" ? "stream" : "arraybuffer",
        onDownloadProgress: (progressEvent) => {
          if (logCallback && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            logCallback({
              status: "downloading",
              progress: percentCompleted,
              loaded: progressEvent.loaded,
              total: progressEvent.total,
            });
          }
        },
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const responseSize = response.data?.byteLength || 0;

      // Proteção contra OOM (Out of Memory)
      if (bodyMode !== "stream") {
        const contentLengthHeader = response.headers["content-length"];
        const contentLength = contentLengthHeader ? parseInt(contentLengthHeader as string, 10) : 0;
        if (contentLength > this.MAX_MEMORY_BUFFER) {
          throw new Error(
            `Resposta muito grande (${(contentLength / 1024 / 1024).toFixed(2)}MB). Para evitar crash, use o modo 'Streaming' ou salve diretamente em arquivo.`
          );
        }
      }

      // Se for stream e tiver um path para salvar, pipe para o arquivo
      const finalStreamPath = (headers && headers["x-save-path"]) || streamPath;
      if (bodyMode === "stream" && finalStreamPath) {
        const writer = fs.createWriteStream(finalStreamPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on("finish", () =>
            resolve({
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              data: {
                message: "Download finalizado com sucesso",
                path: finalStreamPath,
              },
              contentType: response.headers["content-type"] as string,
              responseTime,
              responseSize,
            })
          );
          writer.on("error", reject);
        });
      }

      const processed = await this._processSuccessResponse(response, responseTime, responseSize);
      if (logCallback) logCallback(processed);
      return processed;
    } catch (error: any) {
      // Se o erro foi por cancelamento, tratamos de forma específica se necessário
      if (axios.isCancel(error) || error.name === "CanceledError") {
        return {
          status: 0,
          statusText: "Cancelled",
          headers: {},
          data: "Requisição cancelada pelo usuário",
          isCancelled: true,
          responseTime: Date.now() - startTime,
          responseSize: 0,
          contentType: "text/plain",
        };
      }
      const errorData = await this._processErrorResponse(error, Date.now() - startTime);
      if (logCallback) logCallback(errorData);
      return errorData;
    }
  }

  private _validateFilePath(filePath: string): boolean {
    try {
      if (!filePath || typeof filePath !== "string") return false;
      if (!fs.existsSync(filePath)) return false;
      const stats = fs.statSync(filePath);
      return stats.isFile();
    } catch (e) {
      return false;
    }
  }

  private _checkIfHasFiles(body: any): boolean {
    return body && typeof body === "object" && Object.values(body).some((v) => this._isFileData(v));
  }

  private _isFileData(value: any): boolean {
    return value && typeof value === "object" && value.src && value.type === "file";
  }

  private async _processSuccessResponse(response: AxiosResponse, responseTime: number, responseSize: number): Promise<NetworkResponse> {
    const { body, isImage, contentType } = await this._processResponseData(response.data, response.headers);

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: body,
      isImage,
      isPDF: contentType.includes("application/pdf"),
      isAudio: contentType.includes("audio/"),
      isVideo: contentType.includes("video/"),
      contentType,
      url: response.config?.url,
      responseTime,
      responseSize,
    };
  }

  private async _processErrorResponse(error: any, responseTime: number): Promise<NetworkResponse> {
    let status = error.response?.status || 500;
    let statusText = error.response?.statusText || "Internal Server Error";
    let headers = error.response?.headers || {};
    let data = error.message;
    let responseSize = error.response?.data?.byteLength || 0;

    let isImage = false;
    let contentType = headers["content-type"] || "text/plain";

    if (error.response?.data) {
      const processed = await this._processResponseData(error.response.data, headers);
      data = processed.body;
      isImage = processed.isImage;
      contentType = processed.contentType;
    }

    return {
      status,
      statusText,
      headers,
      data,
      isImage,
      isPDF: (contentType as string).includes("application/pdf"),
      isAudio: (contentType as string).includes("audio/"),
      isVideo: (contentType as string).includes("video/"),
      isError: true,
      contentType: contentType as string,
      responseTime,
      responseSize,
    };
  }

  /**
   * Centraliza o processamento de dados binários da resposta.
   * Usa Worker Thread se o dado for grande para não travar o processo principal.
   */
  private async _processResponseData(arrayBuffer: any, headers: any): Promise<{ body: any; isImage: boolean; contentType: string }> {
    const dataSize = arrayBuffer.byteLength || 0;

    // Se for maior que o threshold, delega para o Worker
    if (dataSize > this.WORKER_THRESHOLD) {
      console.log(`[NetworkService] Resposta grande (${(dataSize / 1024).toFixed(1)}KB). Usando Worker Thread...`);
      return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, "../workers/response-processor"), {
          workerData: { arrayBuffer, headers },
        });

        worker.on("message", (msg) => {
          if (msg.success) resolve(msg);
          else reject(new Error(msg.error));
          worker.terminate();
        });

        worker.on("error", (err) => {
          reject(err);
          worker.terminate();
        });

        worker.on("exit", (code) => {
          if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    }

    // Processamento síncrono para dados pequenos (Main Thread)
    const buffer = Buffer.from(arrayBuffer);
    let contentType = ((headers["content-type"] as string) || "").toLowerCase();

    // 1. Detecção por Magic Numbers (PNG, JPEG, GIF, WEBP, BMP)
    let isImage = false;
    let detectedMime = null;

    if (buffer.length > 4) {
      const hex = buffer.toString("hex", 0, 4);

      if (hex.startsWith("89504e47")) {
        isImage = true;
        detectedMime = "image/png";
      } else if (hex.startsWith("ffd8ff")) {
        isImage = true;
        detectedMime = "image/jpeg";
      } else if (hex.startsWith("47494638")) {
        isImage = true;
        detectedMime = "image/gif";
      } else if (buffer.toString("utf8", 0, 4) === "RIFF" && buffer.toString("utf8", 8, 12) === "WEBP") {
        isImage = true;
        detectedMime = "image/webp";
      } else if (hex.startsWith("424m")) {
        isImage = true;
        detectedMime = "image/bmp";
      } else if (hex.startsWith("25504446")) {
        detectedMime = "application/pdf";
      }
    }

    // 2. Se detectamos via bytes, forçamos o contentType correto
    if (detectedMime) {
      if (!contentType || contentType.includes("application/octet-stream") || contentType.includes("text/plain")) {
        contentType = detectedMime;
      }
    }

    // 3. Fallback por Content-Type
    if (!detectedMime && contentType.startsWith("image/")) {
      isImage = true;
    }

    const isPDF = contentType.includes("application/pdf");
    const isAudio = contentType.includes("audio/");
    const isVideo = contentType.includes("video/");

    let body: any;
    if (isImage || isPDF || isAudio || isVideo) {
      body = buffer.toString("base64");
    } else {
      body = buffer.toString("utf8");
      if (contentType.includes("application/json")) {
        try {
          body = JSON.parse(body);
        } catch (e) {
          // Mantém como string se falhar o parse
        }
      }
    }

    return { body, isImage, contentType };
  }
}

export default NetworkService;
