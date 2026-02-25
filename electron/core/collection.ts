/**
 * Tipos e Moldes de Coleção (TS)
 * Define a estrutura unificada para coleções e rotas do sistema.
 */

/**
 * Interface para representar um par de chave e valor (usado em headers, params, etc).
 */
export interface KeyValuePair {
  key: string; // Nome do campo (ex: Content-Type)
  value: string; // Valor do campo (ex: application/json)
  enabled: boolean; // Indica se este item está ativo na requisição
}

/**
 * Configuração de Autenticação.
 */
export interface AuthConfig {
  mode: "token" | "a1" | "none"; // Modo de autenticação: token simples, certificado A1 ou nenhum
  name: string; // O nome do campo para token (ex: Authorization ou nome de um cookie)
  config: {
    key: string; // O valor do token/chave secreta
    type: string; // O tipo/prefixo (ex: Bearer, Basic)
    value: "header" | "body" | "query"; // Onde o token deve ser inserido
  };
  /**
   * Configurações específicas para Certificado Digital A1.
   */
  a1?: {
    pfxPath: string; // Caminho para o arquivo .pfx
    pfxPassword: string; // Senha do certificado
  };
}

/**
 * Dados da Requisição HTTP.
 */
export interface RequestData {
  method: string; // Método HTTP (GET, POST, etc)
  url: string; // URL de destino (pode conter variáveis como {{base_url}})
  headers: KeyValuePair[]; // Lista de cabeçalhos
  params: KeyValuePair[]; // Lista de parâmetros de query string (?id=1)
  body: {
    mode: "inputs" | "json" | "formdata" | "none"; // Formato do corpo da requisição
    content: any; // Conteúdo do corpo. Se for "inputs", será um KeyValuePair[]
  };
  auth: AuthConfig; // Configuração de segurança
}

/**
 * Dados da Resposta HTTP (Cache da última execução).
 */
export interface ResponseData {
  status: number | null; // Status Code (ex: 200, 404)
  statusText: string; // Texto do status (ex: OK, Not Found)
  body: string; // Conteúdo retornado pela API
  headers: KeyValuePair[]; // Cabeçalhos retornados pela API
  time: number; // Tempo de resposta em milissegundos
  size: number; // Tamanho da resposta em bytes
  logs: any[]; // Logs internos de execução ou erros
}

/**
 * Representação de uma Rota (Endpoint individual).
 */
export interface RouteData {
  id: string; // ID único da rota (ex: route_123)
  name: string; // Nome amigável da rota
  description?: string; // Descrição opcional do objetivo da rota
  request: RequestData; // Estrutura da requisição
  response: ResponseData; // Última resposta recebida
}

/**
 * Representação de uma Pasta dentro de uma coleção.
 */
export interface FolderData {
  id: string; // ID único da pasta
  name: string; // Nome da pasta
  description?: string; // Descrição opcional
  items: (RouteData | FolderData)[]; // Itens contidos (pode ser rotas ou subpastas)
}

/**
 * Interface principal de uma Coleção.
 */
export interface CollectionData {
  id: string; // ID único da coleção
  collectionName: string; // Nome da coleção
  description: string; // Descrição do propósito da coleção
  routes: (RouteData | FolderData)[]; // Lista de itens (rotas ou pastas) na raiz
  /**
   * Variáveis de ambiente específicas desta coleção.
   */
  environments: [
    {
      name: string; // Nome da variável
      value: string; // Valor da variável
      enabled: boolean; // Se está ativa
    },
  ];
  lastAppliedEnvironmentId?: string; // ID do ambiente selecionado por último
}

export class CollectionTemplate {
  /**
   * Cria uma nova coleção seguindo o molde padrão
   */
  static createCollection(
    name: string = "Nova Coleção",
    description: string = "",
  ): CollectionData {
    return {
      id: `coll_${Date.now()}`,
      collectionName: name,
      description: description,
      routes: [],
      environments: [{ name: "", value: "", enabled: true }],
    };
  }

  /**
   * Cria uma nova rota com estrutura padrão
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
          mode: "json",
          content: {},
        },
        auth: {
          mode: "none",
          name: "Authorization",
          config: {
            key: "",
            type: "Bearer",
            value: "header",
          },
          a1: {
            pfxPath: "",
            pfxPassword: "",
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
}
