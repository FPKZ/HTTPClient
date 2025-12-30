#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Módulo de Lógica de Conversão Postman
 *
 * Este módulo é responsável por:
 * 1. Ler arquivos de coleção do Postman (.json).
 * 2. Converter requisições para objetos de configuração do Axios (para uso no Frontend).
 * 3. Converter requisições para formato .http (para visualização ou uso em extensões como REST Client).
 * 4. Processar autenticação e corpos de requisição (JSON, FormData, etc.).
 */

/**
 * Processa a autenticação do Postman e retorna um objeto de headers.
 * Suporta: Bearer Token, OAuth2, API Key e Basic Auth.
 *
 * @param {Object} auth - Objeto de autenticação do Postman.
 * @returns {Object} - Objeto com headers de autenticação (ex: { 'Authorization': 'Bearer ...' }).
 */
function processAuth(auth) {
  const headers = {};

  if (!auth || !auth.type) {
    return headers;
  }

  switch (auth.type) {
    case "bearer":
      if (auth.bearer && Array.isArray(auth.bearer)) {
        const tokenObj = auth.bearer.find((item) => item.key === "token");
        if (tokenObj && tokenObj.value) {
          headers["Authorization"] = `Bearer ${tokenObj.value}`;
        }
      }
      break;

    case "oauth2":
      if (auth.oauth2 && Array.isArray(auth.oauth2)) {
        const tokenObj = auth.oauth2.find((item) => item.key === "accessToken");
        if (tokenObj && tokenObj.value) {
          headers["Authorization"] = `Bearer ${tokenObj.value}`;
        } else {
          headers["Authorization"] = "Bearer {{token}}";
        }
      }
      break;

    case "apikey":
      if (auth.apikey && Array.isArray(auth.apikey)) {
        const keyObj = auth.apikey.find((item) => item.key === "key");
        const valueObj = auth.apikey.find((item) => item.key === "value");
        const inObj = auth.apikey.find((item) => item.key === "in");

        if (keyObj && valueObj && inObj && inObj.value === "header") {
          headers[keyObj.value] = valueObj.value;
        }
      }
      break;

    case "basic":
      if (auth.basic && Array.isArray(auth.basic)) {
        const username = auth.basic.find((item) => item.key === "username");
        const password = auth.basic.find((item) => item.key === "password");

        if (username && password) {
          const credentials = Buffer.from(
            `${username.value}:${password.value}`
          ).toString("base64");
          headers["Authorization"] = `Basic ${credentials}`;
        }
      }
      break;
  }

  return headers;
}

/**
 * Constrói a URL final a partir do objeto de URL do Postman.
 * Concatena protocolo, host, caminho e query parameters.
 *
 * @param {Object|string} urlObj - Objeto URL do Postman ou string.
 * @returns {string} - URL completa.
 */
function buildUrl(urlObj) {
  if (typeof urlObj === "string") {
    return urlObj;
  }

  if (urlObj.raw) {
    return urlObj.raw;
  }

  let url = "";

  // Protocolo
  if (urlObj.protocol) {
    url += urlObj.protocol + "://";
  }

  // Host
  if (urlObj.host) {
    if (Array.isArray(urlObj.host)) {
      url += urlObj.host.join(".");
    } else {
      url += urlObj.host;
    }
  }

  // Path
  if (urlObj.path) {
    url += "/";
    if (Array.isArray(urlObj.path)) {
      url += urlObj.path.join("/");
    } else {
      url += urlObj.path;
    }
  }

  // Query Parameters
  if (urlObj.query && Array.isArray(urlObj.query)) {
    const activeQueries = urlObj.query.filter((q) => !q.disabled);
    if (activeQueries.length > 0) {
      url += "?";
      url += activeQueries.map((q) => `${q.key}=${q.value || ""}`).join("&");
    }
  }

  return url;
}

/**
 * Processa o corpo da requisição (Body) do Postman.
 * Trata JSON (raw) e FormData.
 *
 * @param {Object} body - Objeto body do Postman.
 * @returns {Object|string|null} - Corpo processado para uso no Axios ou string.
 */
function processBody(body) {
  if (!body) return null;

  if (body.mode === "raw") {
    try {
      // Tenta fazer parse se for JSON, senão retorna a string crua
      // Remove comentários inline do JSON se houver (comum no Postman)
      const cleanRaw = body.raw.replace(/\/\/.*$/gm, "");
      return JSON.parse(cleanRaw);
    } catch (e) {
      return body.raw;
    }
  }

  if (body.mode === "formdata") {
    // Para FormData, retornamos uma estrutura descritiva
    // O frontend deverá reconstruir o FormData real
    const formData = {};
    if (Array.isArray(body.formdata)) {
      body.formdata.forEach((field) => {
        if (!field.disabled) {
          formData[field.key] =
            field.type === "file"
              ? { type: "file", src: field.src }
              : field.value;
        }
      });
    }
    return formData;
  }

  return null;
}

// ============================================================================
// CONVERSÃO PARA AXIOS (Objeto JS)
// ============================================================================

/**
 * Converte um item de requisição do Postman para um objeto de configuração Axios.
 * Este objeto será usado pelo frontend para realizar as chamadas.
 *
 * @param {Object} item - Item da coleção Postman (Request).
 * @returns {Object} - Configuração Axios ({ method, url, headers, data }).
 */
function convertRequestToAxios(item) {
  if (!item.request) return null;

  const request = item.request;
  const method = request.method || "GET";
  const url = buildUrl(request.url);

  // Headers
  let headers = processAuth(request.auth);

  if (request.header && Array.isArray(request.header)) {
    request.header.forEach((h) => {
      if (!h.disabled) {
        headers[h.key] = h.value;
      }
    });
  }

  // Body
  const data = processBody(request.body);

  return {
    name: item.name,
    request: {
      url,
      method,
      headers,
      body: data, // Renomeado de 'data' para 'body' para alinhar com o exemplo do usuário
    },
  };
}

/**
 * Gera um nome único para uma chave em um objeto, adicionando sufixo se necessário.
 * @param {string} name - Nome desejado.
 * @param {string} method - Método da requisição.
 * @returns {string} - Nome único.
 */
function getUniqueName(name, method) {
  let uniqueName = `${name} (${method})`;

  return uniqueName;
}

/**
 * Processa recursivamente a coleção para gerar uma estrutura de objetos Axios.
 * Mantém a hierarquia de pastas.
 *
 * @param {Array} items - Lista de itens do Postman.
 * @returns {Object} - Estrutura hierárquica { "Nome Pasta": { ... }, "Nome Request": { ... } }
 */
function processCollectionToAxios(items) {
  const result = {};

  if (!items || !Array.isArray(items)) return result;

  items.forEach((item) => {
    const name = item.name || "Unnamed";
    const uniqueName = getUniqueName(name, item.request.method, result);

    if (item.item && Array.isArray(item.item)) {
      // É uma pasta
      result[uniqueName] = processCollectionToAxios(item.item);
    } else if (item.request) {
      // É uma requisição
      const axiosConfig = convertRequestToAxios(item);
      if (axiosConfig) {
        // Atualiza o nome no objeto de configuração também, para consistência
        axiosConfig.name = uniqueName;
        result[uniqueName] = axiosConfig;
      }
    }
  });

  return result;
}

// ============================================================================
// CONVERSÃO PARA .HTTP (String Texto)
// ============================================================================

/**
 * Converte um item de requisição do Postman para o formato de texto .http.
 * Útil para visualização e debug.
 *
 * @param {Object} item - Item da coleção Postman.
 * @returns {string} - Conteúdo formatado em .http.
 */
function convertRequestToHttpString(item) {
  if (!item.request) return "";

  let httpContent = `### ${item.name || "Request"}\n`;

  const method = item.request.method || "GET";
  const url = buildUrl(item.request.url);

  httpContent += `${method} ${url}\n`;

  // Headers
  const authHeaders = processAuth(item.request.auth);
  Object.entries(authHeaders).forEach(([key, value]) => {
    httpContent += `${key}: ${value}\n`;
  });

  if (item.request.header && Array.isArray(item.request.header)) {
    item.request.header.forEach((h) => {
      if (!h.disabled) {
        httpContent += `${h.key}: ${h.value}\n`;
      }
    });
  }

  // Body
  const body = item.request.body;
  if (body) {
    if (body.mode === "raw") {
      httpContent += "\n";
      httpContent += body.raw; // Mantém raw, incluindo comentários se houver
      httpContent += "\n";
    } else if (body.mode === "formdata") {
      const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
      httpContent += `Content-Type: multipart/form-data; boundary=${boundary}\n\n`;

      if (Array.isArray(body.formdata)) {
        body.formdata.forEach((field) => {
          if (!field.disabled) {
            httpContent += `--${boundary}\n`;
            if (field.type === "file") {
              httpContent += `Content-Disposition: form-data; name="${field.key}"; filename="${field.src || "file"}"\n\n`;
              httpContent += `< ${field.src || "./file"}\n`;
            } else {
              httpContent += `Content-Disposition: form-data; name="${field.key}"\n\n`;
              httpContent += `${field.value}\n`;
            }
          }
        });
        httpContent += `--${boundary}--\n`;
      }
    }
  }

  return httpContent + "\n";
}

/**
 * Processa recursivamente a coleção para gerar uma estrutura de objetos com strings .http.
 *
 * @param {Array} items - Itens da coleção.
 * @returns {Object} - Estrutura { "Nome Pasta": { ... }, "Nome Request": "GET http://..." }
 */
function processCollectionToHttpObject(items) {
  const result = {};

  if (!items || !Array.isArray(items)) return result;

  items.forEach((item) => {
    const name = item.name || "Unnamed";
    const uniqueName = getUniqueName(name, result);

    if (item.item && Array.isArray(item.item)) {
      // Pasta
      result[uniqueName] = processCollectionToHttpObject(item.item);
    } else if (item.request) {
      // Requisição
      // Atualiza o nome no comentário do .http se necessário (opcional, mas bom para consistência)
      // Como convertRequestToHttpString usa item.name, podemos clonar o item ou aceitar que o comentário interno fique com o nome original
      // Vamos manter o nome original no comentário interno por enquanto, mas a chave do objeto será única.
      result[uniqueName] = convertRequestToHttpString(item);
    }
  });

  return result;
}

/**
 * Converte o objeto estruturado de volta para uma única string (para exportação).
 *
 * @param {Object} httpObject - Objeto gerado por processCollectionToHttpObject.
 * @param {string} parentName - Nome da pasta pai (para comentários).
 * @returns {string} - Conteúdo completo do arquivo .http.
 */
function flattenHttpObjectToString(httpObject, parentName = "") {
  let content = "";

  Object.entries(httpObject).forEach(([key, value]) => {
    if (typeof value === "string") {
      // É uma requisição (string .http)
      content += value;
    } else {
      // É uma pasta (objeto)
      const folderName = parentName ? `${parentName} / ${key}` : key;
      content += `\n# 📁 Folder: ${folderName}\n`;
      content += flattenHttpObjectToString(value, folderName);
    }
  });

  return content;
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS DE ARQUIVO
// ============================================================================

/**
 * Encontra arquivos JSON recursivamente.
 */
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith(".") && file !== "node_modules") {
        findJsonFiles(filePath, fileList);
      }
    } else if (stat.isFile() && file.endsWith(".json")) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const json = JSON.parse(content);
        if (json.info && json.item) {
          fileList.push(filePath);
        }
      } catch (error) {
        // Ignorar
      }
    }
  });

  return fileList;
}

module.exports = {
  findJsonFiles,
  processCollectionToAxios,
  processCollectionToHttpObject,
  flattenHttpObjectToString,
  // Exportando funções individuais caso necessário para testes unitários
  convertRequestToAxios,
  convertRequestToHttpString,
};
