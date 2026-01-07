const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

/**
 * NetworkService
 * Responsável exclusivamente por executar requisições HTTP via Axios.
 * Segue o SRP ao isolar toda a complexidade de FormData e buffers de resposta.
 */
class NetworkService {
  /**
   * Executa uma requisição HTTP.
   * @param {Object} params - { url, method, headers, body }
   * @param {Function} logCallback - Callback para enviar logs parciais.
   * @returns {Promise<Object>} - Resposta processada.
   */
  async execute({ url, method, headers, body, bodyMode }, logCallback) {
    let requestData = body;
    let requestHeaders = { ...headers };

    // Verifica se deve usar FormData (modo explícito ou presença de arquivos)
    const isFormData = bodyMode === "formdata";
    const hasFiles = this._checkIfHasFiles(body);

    if (isFormData || hasFiles) {
      const form = new FormData();
      if (body && typeof body === "object") {
        for (const [key, value] of Object.entries(body)) {
          if (this._isFileData(value)) {
            if (fs.existsSync(value.src)) {
              form.append(key, fs.createReadStream(value.src));
            }
          } else if (
            typeof value === "string" &&
            (value.includes("/") || value.includes("\\"))
          ) {
            if (fs.existsSync(value)) {
              form.append(key, fs.createReadStream(value));
            } else {
              form.append(key, value);
            }
          } else {
            form.append(
              key,
              typeof value === "object" ? JSON.stringify(value) : value
            );
          }
        }
      }
      requestData = form;
      requestHeaders = { ...requestHeaders, ...form.getHeaders() };
    }

    try {
      const response = await axios({
        method,
        url,
        headers: requestHeaders,
        data: requestData,
        responseType: "arraybuffer",
      });

      const processed = this._processSuccessResponse(response);
      if (logCallback) logCallback(processed);
      return processed;
    } catch (error) {
      const errorData = this._processErrorResponse(error);
      if (logCallback) logCallback(errorData);
      return errorData;
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
      response.headers
    );

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: body,
      isImage,
      contentType,
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
