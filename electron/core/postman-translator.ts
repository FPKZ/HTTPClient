interface PostmanAuth {
  type: string;
  bearer?: Array<{ key: string; value: string }>;
  basic?: Array<{ key: string; value: string }>;
  apikey?: Array<{ key: string; value: string }>;
  oauth2?: Array<{ key: string; value: string }>;
}

interface PostmanRequest {
  method: string;
  url: string | { raw: string; protocol: string; host: string | string[]; path: string | string[]; query?: Array<{ key: string; value: string; disabled?: boolean }> };
  header?: Array<{ key: string; value: string; disabled?: boolean }>;
  body?: { mode: string; raw?: string; formdata?: Array<{ key: string; value?: string; type?: string; src?: string; disabled?: boolean }> };
  auth?: PostmanAuth;
}

interface PostmanItem {
  name: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
}

interface PostmanCollection {
  info: { name: string; description?: string };
  item: PostmanItem[];
}

export interface CollectionItem {
  id: string;
  name: string;
  type?: string;
  items?: CollectionItem[];
  request?: {
    method: string;
    url: string;
    headers: Array<{ key: string; value: string; enabled: boolean }>;
    params: Array<{ key: string; value: string; enabled: boolean }>;
    body: { mode: string; content: any };
    auth: { name: string; config: { key: string; type: string; value: string } };
  };
  response?: {
    status: number | null;
    statusText: string;
    body: string;
    headers: any[];
    time: number;
    size: number;
    logs: any[];
  };
}

export interface CollectionTemplate {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
}

/**
 * PostmanTranslator
 * Responsável por traduzir o formato Postman para o modelo unificado CollectionTemplate.
 */
export class PostmanTranslator {
  translate(postmanJson: PostmanCollection): CollectionTemplate {
    if (!postmanJson || !postmanJson.info || !postmanJson.item) {
      throw new Error(
        "Formato Postman inválido ou não suportado (faltando info ou item)."
      );
    }

    return {
      id: `${postmanJson.info.name}_${Date.now()}`,
      name: postmanJson.info.name,
      description: postmanJson.info.description || "",
      items: this._cleanAndDeduplicateRoutes(
        this._processItems(postmanJson.item)
      ),
    };
  }

  private _cleanAndDeduplicateRoutes(routes: CollectionItem[]): CollectionItem[] {
    const seenNames = new Map<string, boolean>();

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
      const updatedRoute: CollectionItem = { ...route, name: finalName };
      if (updatedRoute.items && Array.isArray(updatedRoute.items)) {
        updatedRoute.items = this._cleanAndDeduplicateRoutes(
          updatedRoute.items
        );
      }

      return updatedRoute;
    });
  }

  private _processItems(items: PostmanItem[]): CollectionItem[] {
    let routes: CollectionItem[] = [];

    items.forEach((item) => {
      if (item.item && Array.isArray(item.item)) {
        // Se for uma pasta, processa os itens internos mantendo a estrutura de árvore
        routes.push({
          id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: item.name,
          type: "folder",
          items: this._processItems(item.item),
        });
      } else if (item.request) {
        // É uma requisição direta
        routes.push({
          id: `route_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: item.name,
          type: "route",
          request: this._extractRequestData(item.request)!,
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

  private _extractRequestData(request: PostmanRequest | undefined): CollectionItem['request'] | null {
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

  private _extractAuth(postmanAuth: PostmanAuth | undefined): CollectionItem['request']['auth'] {
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

  private _buildUrl(urlObj: any): string {
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

  private _extractParams(urlObj: any): Array<{ key: string; value: string; enabled: boolean }> {
    if (!urlObj || !urlObj.query || !Array.isArray(urlObj.query)) return [];
    return urlObj.query.map((q: any) => ({
      key: q.key || "",
      value: q.value || "",
      enabled: !q.disabled,
    }));
  }

  private _extractHeaders(request: PostmanRequest): Array<{ key: string; value: string; enabled: boolean }> {
    const headerList: Array<{ key: string; value: string; enabled: boolean }> = [];

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

  private _extractBody(body: PostmanRequest['body'] | undefined): { mode: string; content: any } {
    if (!body) return { mode: "none", content: "" };

    if (body.mode === "raw") {
      try {
        const cleanRaw = body.raw?.replace(/\/\/.*$/gm, "") || "";
        return { mode: "json", content: cleanRaw };
      } catch (e) {
        return { mode: "json", content: body.raw || "" };
      }
    }

    if (body.mode === "formdata") {
      const inputs: any[] = [];
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

export default PostmanTranslator;
