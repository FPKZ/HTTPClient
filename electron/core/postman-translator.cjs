/**
 * PostmanTranslator
 * Responsável por traduzir o formato Postman para o modelo unificado CollectionTemplate.
 */
class PostmanTranslator {
  translate(postmanJson) {
    if (!postmanJson || !postmanJson.info || !postmanJson.item) {
      throw new Error(
        "Formato Postman inválido ou não suportado (faltando info ou item)."
      );
    }

    return {
      id: `coll_${Date.now()}`,
      name: postmanJson.info.name,
      descricao: postmanJson.info.description || "",
      items: this._cleanAndDeduplicateRoutes(
        this._processItems(postmanJson.item)
      ),
    };
  }

  _cleanAndDeduplicateRoutes(routes) {
    const seenNames = new Map();

    return routes.map((route) => {
      let cleanName = route.name;

      // 1. Remover redundância de método (ex: "GET User", "Post Order")
      const methods = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "HEAD",
        "OPTIONS",
      ];
      for (const m of methods) {
        const regex = new RegExp(`^${m}\\s+`, "i");
        if (regex.test(cleanName)) {
          cleanName = cleanName.replace(regex, "");
          break;
        }
      }

      // 2. De-duplicação (sem sobrescrever requisições com o mesmo nome)
      let finalName = cleanName;
      let counter = 1;
      while (seenNames.has(finalName.toLowerCase())) {
        finalName = `${cleanName} (${counter})`;
        counter++;
      }
      seenNames.set(finalName.toLowerCase(), true);

      // 3. Se for uma pasta, limpa os itens internos recursivamente
      const updatedRoute = { ...route, name: finalName };
      if (updatedRoute.items && Array.isArray(updatedRoute.items)) {
        updatedRoute.items = this._cleanAndDeduplicateRoutes(
          updatedRoute.items
        );
      }

      return updatedRoute;
    });
  }

  _processItems(items) {
    let routes = [];

    items.forEach((item) => {
      if (item.item && Array.isArray(item.item)) {
        // Se for uma pasta, processa os itens internos mantendo a estrutura de árvore
        routes.push({
          id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: item.name,
          items: this._processItems(item.item),
        });
      } else if (item.request) {
        // É uma requisição direta
        routes.push({
          id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: item.name,
          request: this._extractRequestData(item.request),
          response: {
            status: null,
            statusText: "",
            body: "",
            headers: [],
            time: 0,
            size: 0,
            logs: [],
          },
        });
      }
    });

    return routes;
  }

  _extractRequestData(request) {
    if (!request) return null;

    const headers = this._extractHeaders(request);
    const params = this._extractParams(request.url);
    const body = this._extractBody(request.body);

    return {
      method: request.method || "GET",
      url: this._buildUrl(request.url),
      headers,
      params,
      body,
      auth: this._extractAuth(request.auth),
    };
  }

  _extractAuth(postmanAuth) {
    if (!postmanAuth) {
      return {
        name: "none",
        config: {
          key: "",
          type: "Bearer",
          value: "header",
        },
      };
    }

    const type = postmanAuth.type;
    let config = { key: "", type: "", value: "header" };
    let fieldName = "Authorization";

    // Mapeamento específico para tipos comuns
    if (type === "bearer") {
      const token = postmanAuth.bearer?.[0]?.value || "";
      config.type = "Bearer";
      config.key = token;
    } else if (type === "basic") {
      config.type = "Basic";
      config.key = "";
    } else if (type === "apikey") {
      const keyObj = postmanAuth.apikey?.find((a) => a.key === "key");
      const valObj = postmanAuth.apikey?.find((a) => a.key === "value");
      const locObj = postmanAuth.apikey?.find((a) => a.key === "in");

      fieldName = keyObj?.value || "X-API-Key";
      config.key = valObj?.value || "";
      config.value =
        locObj?.value === "query" ? "header" : locObj?.value || "header";
    } else if (type === "oauth2") {
      const tokenObj = postmanAuth.oauth2?.find((a) => a.key === "accessToken");
      config.type = "Bearer";
      config.key = tokenObj?.value || "";
      fieldName = "Authorization";
    }

    return {
      name: fieldName,
      config,
    };
  }

  _buildUrl(urlObj) {
    if (!urlObj) return "";
    if (typeof urlObj === "string") return urlObj;
    if (urlObj.raw) return urlObj.raw.split("?")[0]; // Remove query params da URL bruta

    let url = "";
    if (urlObj.protocol) url += urlObj.protocol + "://";
    if (urlObj.host) {
      url += Array.isArray(urlObj.host) ? urlObj.host.join(".") : urlObj.host;
    }
    if (urlObj.path) {
      url += "/";
      url += Array.isArray(urlObj.path) ? urlObj.path.join("/") : urlObj.path;
    }
    return url;
  }

  _extractParams(urlObj) {
    if (!urlObj || !urlObj.query || !Array.isArray(urlObj.query)) return [];
    return urlObj.query.map((q) => ({
      key: q.key || "",
      value: q.value || "",
      enabled: !q.disabled,
    }));
  }

  _extractHeaders(request) {
    const headerList = [];

    // Manual Headers
    if (request.header && Array.isArray(request.header)) {
      request.header.forEach((h) => {
        headerList.push({
          key: h.key,
          value: h.value,
          enabled: !h.disabled,
        });
      });
    }

    // Se não houver Content-Type e houver body, adiciona padrão
    if (
      !headerList.find((h) => h.key.toLowerCase() === "content-type") &&
      request.body
    ) {
      headerList.push({
        key: "Content-Type",
        value: "application/json",
        enabled: true,
      });
    }

    return headerList;
  }

  _extractBody(body) {
    if (!body) return { mode: "none", content: "" };

    if (body.mode === "raw") {
      try {
        const cleanRaw = body.raw.replace(/\/\/.*$/gm, "");
        const parsed = JSON.parse(cleanRaw);
        // Se conseguimos parsear como JSON, convertemos para o formato 'inputs' (lista)
        const inputs = Object.entries(parsed).map(([key, value]) => ({
          key,
          value:
            typeof value === "object" ? JSON.stringify(value) : String(value),
          enabled: true,
        }));
        return { mode: "inputs", content: inputs };
      } catch (e) {
        return { mode: "json", content: body.raw };
      }
    }

    if (body.mode === "formdata") {
      const inputs = [];
      if (Array.isArray(body.formdata)) {
        body.formdata.forEach((field) => {
          inputs.push({
            key: field.key,
            value: field.type === "file" ? field.src || "" : field.value,
            enabled: !field.disabled,
          });
        });
      }
      return { mode: "formdata", content: inputs };
    }

    return { mode: "none", content: "" };
  }
}

module.exports = PostmanTranslator;
