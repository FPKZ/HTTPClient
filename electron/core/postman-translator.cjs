/**
 * PostmanTranslator
 * Responsável por traduzir o formato Postman para um modelo de dados interno.
 * Segue o SRP ao dissociar a leitura/escrita e a formatação final.
 */
class PostmanTranslator {
  translate(postmanJson) {
    if (!postmanJson.info || !postmanJson.item) {
      throw new Error("Formato Postman inválido ou não suportado.");
    }

    return {
      info: {
        name: postmanJson.info.name,
        description: postmanJson.info.description,
      },
      items: this._processItems(postmanJson.item),
    };
  }

  _processItems(items) {
    return items.map((item) => {
      if (item.item && Array.isArray(item.item)) {
        // É uma pasta
        return {
          type: "folder",
          name: item.name,
          items: this._processItems(item.item),
        };
      } else {
        // É uma requisição
        return {
          type: "request",
          name: item.name,
          request: this._extractRequestData(item.request),
        };
      }
    });
  }

  _extractRequestData(request) {
    return {
      method: request.method || "GET",
      url: this._buildUrl(request.url),
      headers: this._extractHeaders(request),
      body: this._extractBody(request.body),
      auth: request.auth,
    };
  }

  _buildUrl(urlObj) {
    if (!urlObj) return "";
    if (typeof urlObj === "string") return urlObj;
    if (urlObj.raw) return urlObj.raw;

    let url = "";
    if (urlObj.protocol) url += urlObj.protocol + "://";
    if (urlObj.host) {
      url += Array.isArray(urlObj.host) ? urlObj.host.join(".") : urlObj.host;
    }
    if (urlObj.path) {
      url += "/";
      url += Array.isArray(urlObj.path) ? urlObj.path.join("/") : urlObj.path;
    }
    if (urlObj.query && Array.isArray(urlObj.query)) {
      const activeQueries = urlObj.query.filter((q) => !q.disabled);
      if (activeQueries.length > 0) {
        url += "?";
        url += activeQueries.map((q) => `${q.key}=${q.value || ""}`).join("&");
      }
    }
    return url;
  }

  _extractHeaders(request) {
    const headers = {};
    
    // Auth Headers
    const authHeaders = this._processAuth(request.auth);
    Object.assign(headers, authHeaders);

    // Manual Headers
    if (request.header && Array.isArray(request.header)) {
      request.header.forEach((h) => {
        if (!h.disabled) {
          headers[h.key] = h.value;
        }
      });
    }
    return headers;
  }

  _processAuth(auth) {
    const headers = {};
    if (!auth || !auth.type) return headers;

    switch (auth.type) {
      case "bearer":
        const token = auth.bearer?.find((item) => item.key === "token")?.value;
        if (token) headers["Authorization"] = `Bearer ${token}`;
        break;
      case "oauth2":
        const oauthToken = auth.oauth2?.find((item) => item.key === "accessToken")?.value;
        headers["Authorization"] = `Bearer ${oauthToken || "{{token}}"}`;
        break;
      case "basic":
        const username = auth.basic?.find((item) => item.key === "username")?.value;
        const password = auth.basic?.find((item) => item.key === "password")?.value;
        if (username && password) {
          const credentials = Buffer.from(`${username}:${password}`).toString("base64");
          headers["Authorization"] = `Basic ${credentials}`;
        }
        break;
      case "apikey":
        const key = auth.apikey?.find((item) => item.key === "key")?.value;
        const value = auth.apikey?.find((item) => item.key === "value")?.value;
        const loc = auth.apikey?.find((item) => item.key === "in")?.value;
        if (key && value && loc === "header") headers[key] = value;
        break;
    }
    return headers;
  }

  _extractBody(body) {
    if (!body) return null;
    if (body.mode === "raw") {
      try {
        const cleanRaw = body.raw.replace(/\/\/.*$/gm, "");
        return JSON.parse(cleanRaw);
      } catch (e) {
        return body.raw;
      }
    }
    if (body.mode === "formdata") {
      const formData = {};
      if (Array.isArray(body.formdata)) {
        body.formdata.forEach((field) => {
          if (!field.disabled) {
            formData[field.key] = field.type === "file" 
              ? { type: "file", src: field.src } 
              : field.value;
          }
        });
      }
      return formData;
    }
    return null;
  }
}

module.exports = PostmanTranslator;
