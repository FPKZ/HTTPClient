const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

/**
 * NetworkService
 * Responsável exclusivamente por executar requisições HTTP via Axios.
 * Segue o SRP ao isolar toda a complexidade de FormData e buffers de resposta.
 */
class NetworkService {
  constructor() {
    this.MAX_MEMORY_BUFFER = 50 * 1024 * 1024; // 50MB
    this.DEFAULT_TIMEOUT = 60000; // 60s
  }

  /**
   * Executa uma requisição HTTP.
   * @param {Object} params - { url, method, headers, body, bodyMode, timeout, streamPath }
   * @param {Function} logCallback - Callback para enviar logs parciais.
   * @returns {Promise<Object>} - Resposta processada.
   */
  async execute(
    { url, method, headers, body, bodyMode, timeout, streamPath },
    logCallback,
  ) {
    let requestData = body;
    let requestHeaders = { ...headers };

    // 1. FormData (modo explícito ou presença de arquivos em objeto genérico)
    const isFormData = bodyMode === "formdata";
    const hasFiles = this._checkIfHasFiles(body);

    if (isFormData || hasFiles) {
      const form = new FormData();
      if (body && typeof body === "object") {
        for (const [key, value] of Object.entries(body)) {
          if (this._isFileData(value)) {
            if (this._validateFilePath(value.src)) {
              form.append(key, fs.createReadStream(value.src));
            }
          } else if (
            typeof value === "string" &&
            (value.includes("/") || value.includes("\\"))
          ) {
            if (this._validateFilePath(value)) {
              form.append(key, fs.createReadStream(value));
            } else {
              form.append(key, value);
            }
          } else {
            form.append(
              key,
              typeof value === "object" ? JSON.stringify(value) : value,
            );
          }
        }
      }
      requestData = form;
      requestHeaders = { ...requestHeaders, ...form.getHeaders() };
    }

    // 2. URL-Encoded
    if (bodyMode === "urlencoded") {
      const params = new URLSearchParams();
      if (body && typeof body === "object") {
        for (const [key, value] of Object.entries(body)) {
          params.append(key, value);
        }
      }
      requestData = params.toString();
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

    try {
      const response = await axios({
        method,
        url,
        headers: requestHeaders,
        data: requestData,
        timeout: timeout || this.DEFAULT_TIMEOUT,
        responseType: bodyMode === "stream" ? "stream" : "arraybuffer",
        onDownloadProgress: (progressEvent) => {
          if (logCallback && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            logCallback({
              status: "downloading",
              progress: percentCompleted,
              loaded: progressEvent.loaded,
              total: progressEvent.total,
            });
          }
        },
      });

      // Proteção contra OOM (Out of Memory)
      if (bodyMode !== "stream") {
        const contentLength = parseInt(response.headers["content-length"], 10);
        if (contentLength > this.MAX_MEMORY_BUFFER) {
          throw new Error(
            `Resposta muito grande (${(contentLength / 1024 / 1024).toFixed(2)}MB). Para evitar crash, use o modo 'Streaming' ou salve diretamente em arquivo.`,
          );
        }
      }

      // Se for stream e tiver um path para salvar, pipe para o arquivo
      const finalStreamPath = headers["x-save-path"] || streamPath;
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
              contentType: response.headers["content-type"],
            }),
          );
          writer.on("error", reject);
        });
      }

      const processed = this._processSuccessResponse(response);
      if (logCallback) logCallback(processed);
      return processed;
    } catch (error) {
      const errorData = this._processErrorResponse(error);
      if (logCallback) logCallback(errorData);
      return errorData;
    }
  }

  _validateFilePath(filePath) {
    try {
      if (!filePath || typeof filePath !== "string") return false;
      if (!fs.existsSync(filePath)) return false;
      const stats = fs.statSync(filePath);
      return stats.isFile();
    } catch (e) {
      return false;
    }
  }

  _checkIfHasFiles(body) {
    return (
      body &&
      typeof body === "object" &&
      Object.values(body).some(this._isFileData)
    );
  }

  _isFileData(value) {
    return (
      value && typeof value === "object" && value.src && value.type === "file"
    );
  }

  _processSuccessResponse(response) {
    const { body, isImage, contentType } = this._processResponseData(
      response.data,
      response.headers,
    );

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: body,
      isImage,
      contentType,
      url: response.config?.url,
    };
  }

  _processErrorResponse(error) {
    let status = error.response?.status || 500;
    let statusText = error.response?.statusText || "Internal Server Error";
    let headers = error.response?.headers || {};
    let data = error.message;

    let isImage = false;
    let contentType = headers["content-type"] || "text/plain";

    if (error.response?.data) {
      const processed = this._processResponseData(error.response.data, headers);
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
      isError: true,
      contentType,
    };
  }

  /**
   * Centraliza o processamento de dados binários da resposta.
   */
  _processResponseData(arrayBuffer, headers) {
    const buffer = Buffer.from(arrayBuffer);
    let contentType = (headers["content-type"] || "").toLowerCase();

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
      } else if (
        buffer.toString("utf8", 0, 4) === "RIFF" &&
        buffer.toString("utf8", 8, 12) === "WEBP"
      ) {
        isImage = true;
        detectedMime = "image/webp";
      } else if (hex.startsWith("424d")) {
        isImage = true;
        detectedMime = "image/bmp";
      }
    }

    // 2. Se detectamos via bytes, forçamos o contentType correto se o original for genérico ou ausente
    if (isImage && detectedMime) {
      if (
        !contentType ||
        contentType.includes("application/octet-stream") ||
        contentType.includes("text/plain")
      ) {
        contentType = detectedMime;
      }
    }

    // 3. Fallback por Content-Type se não detectou por bytes
    if (!isImage && contentType.startsWith("image/")) {
      isImage = true;
    }

    let body;
    if (isImage) {
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

module.exports = NetworkService;
