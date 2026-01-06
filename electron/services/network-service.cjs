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
    const contentType = response.headers["content-type"] || "";
    const isImage = contentType.toLowerCase().startsWith("image/");

    let body;
    if (isImage) {
      body = Buffer.from(response.data).toString("base64");
    } else {
      body = Buffer.from(response.data).toString("utf8");
      try {
        if (contentType.includes("application/json")) {
          body = JSON.parse(body);
        }
      } catch (e) {}
    }

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
    let errorBody = error.message;
    if (error.response?.data) {
      errorBody = Buffer.from(error.response.data).toString("utf8");
      try {
        if (
          error.response.headers["content-type"]?.includes("application/json")
        ) {
          errorBody = JSON.parse(errorBody);
        }
      } catch (e) {}
    }

    return {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || "Internal Server Error",
      headers: error.response?.headers || {},
      data: errorBody,
      isError: true,
    };
  }
}

module.exports = NetworkService;
