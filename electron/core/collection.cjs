/**
 * Collection Template (Molde Central)
 * Este arquivo define o "esqueleto" que o app utiliza para coleções e rotas.
 * Toda tradução e exibição deve seguir este formato.
 */

class CollectionTemplate {
  /**
   * Retorna um objeto de coleção novo/limpo
   */
  static createCollection(name = "Nova Coleção", description = "") {
    return {
      id: `coll_${Date.now()}`,
      collectionName: name,
      description: description,
      routes: [], // Array de objetos RouteData
    };
  }

  /**
   * Retorna uma estrutura de dados de rota padrão
   * Cada rota agora possui um nome e o body padrão é 'inputs'.
   */
  static createRoute(name = "Nova Rota") {
    return {
      id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name,
      request: {
        method: "GET",
        url: "",
        headers: [
          { key: "Content-Type", value: "application/json", enabled: true },
        ],
        params: [], // Query string: { key, value, enabled }
        body: {
          mode: "inputs", // "inputs" (padrão), "json", "formdata", "none"
          content: [
            { key: "", value: "", enabled: true }, // Padrão "inputs" (lista de chaves/valores)
          ],
        },
        auth: {
          type: "none",
          config: {},
        },
      },
      response: {
        status: null,
        statusText: "",
        body: "", // Resposta vinda do servidor
        headers: [], // Lista de { key, value }
        time: 0,
        size: 0,
        logs: [], // Logs de execução específicos desta rota
      },
    };
  }

  /**
   * Utilitários para campos dinâmicos (Add/Remove) na UI
   */
  static createEmptyHeader() {
    return { key: "", value: "", enabled: true };
  }

  static createEmptyParam() {
    return { key: "", value: "", enabled: true };
  }

  static createEmptyBodyInput() {
    return { key: "", value: "", enabled: true };
  }
}

module.exports = CollectionTemplate;
