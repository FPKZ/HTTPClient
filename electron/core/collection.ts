/**
 * Collection Types & Template (TS)
 * Define a estrutura unificada para coleções e rotas do sistema.
 */

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  name: string; // O nome do campo (ex: Authorization ou token, use "none" para desativar)
  config: {
    key: string; // O token em si
    type: string; // O tipo/prefixo (ex: Bearer)
    value: "header" | "body"; // O local de inserção
  };
}

export interface RequestData {
  method: string;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: {
    mode: "inputs" | "json" | "formdata" | "none";
    content: any; // KeyValuePair[] quando for "inputs"
  };
  auth: AuthConfig;
}

export interface ResponseData {
  status: number | null;
  statusText: string;
  body: string;
  headers: KeyValuePair[];
  time: number;
  size: number;
  logs: any[];
}

export interface RouteData {
  id: string;
  name: string;
  request: RequestData;
  response: ResponseData;
}

export interface FolderData {
    id: string;
    name: string;
    items: RouteData[];
}

export interface CollectionData {
  id: string;
  collectionName: string;
  description: string;
  routes: RouteData[] | FolderData[]; // Alterado de 'telas' para 'routes'
}

export class CollectionTemplate {
  /**
   * Cria uma nova coleção seguindo o molde
   */
  static createCollection(
    name: string = "Nova Coleção",
    description: string = ""
  ): CollectionData {
    return {
      id: `coll_${Date.now()}`,
      collectionName: name,
      description: description,
      routes: [],
    };
  }

  /**
   * Cria uma nova rota com estrutura padrão e body em modo 'inputs'
   */
  static createRoute(name: string = "Nova Rota"): RouteData {
    return {
      id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name,
      request: {
        method: "GET",
        url: "",
        headers: [
          { key: "Content-Type", value: "application/json", enabled: true },
        ],
        params: [],
        body: {
          mode: "inputs",
          content: [{ key: "", value: "", enabled: true }],
        },
        auth: {
          name: "Authorization",
          config: {
            key: "",
            type: "Bearer",
            value: "header",
          },
        },
      },
      response: {
        status: null,
        statusText: "",
        body: "",
        headers: [],
        time: 0,
        size: 0,
        logs: [],
      },
    };
  }

  static createEmptyHeader(): KeyValuePair {
    return { key: "", value: "", enabled: true };
  }

  static createEmptyParam(): KeyValuePair {
    return { key: "", value: "", enabled: true };
  }

  static createEmptyBodyInput(): KeyValuePair {
    return { key: "", value: "", enabled: true };
  }
}
