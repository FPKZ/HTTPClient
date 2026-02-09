import { useCallback } from "react";
import { useHistory } from "./useHistory";
import useModalStore from "../store/useModalStore";

/**
 * useNewCollection
 * Hook para disparar a criação de uma nova coleção.
 * Garante que a coleção atual seja salva/confirmada antes de abrir o modal.
 */
export function useNewCollection() {
  const { handleSaveCollection } = useHistory();
  const setNovaCollectionOpen = useModalStore(
    (state) => state.setNovaCollectionOpen,
  );

  const createTestRoute = (method) => ({
    id: `route_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 5)}_${method.toLowerCase()}`,
    type: "route",
    name: `Test Route`,
    request: {
      method: method,
      url: `https://jsonplaceholder.typicode.com/posts/${method === "GET" || method === "DELETE" ? "" : "1"}`,
      headers: [
        { key: "Content-Type", value: "application/json", enabled: true },
      ],
      params: [],
      body: {
        mode: method === "GET" || method === "DELETE" ? "none" : "json",
        content:
          method === "GET" || method === "DELETE"
            ? ""
            : JSON.stringify({ title: "foo", body: "bar", userId: 1 }, null, 2),
      },
      auth: {
        name: "none",
        config: { key: "", type: "Bearer", value: "header" },
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
  });

  const newCollection = (name = "Nova Coleção", desc = "", routes = []) => {
    if (!name) {
      name = "Nova Coleção";
    }
    if (!desc) {
      desc = "";
    }
    if (!routes) {
      routes = [];
    }
    const testRoutes = [
      createTestRoute("GET"),
      createTestRoute("POST"),
      createTestRoute("PUT"),
      createTestRoute("DELETE"),
      createTestRoute("PATCH"),
    ];
    window.electronAPI.logAction("Criando nova coleção: " + name);
   return {
      id: `coll_${Date.now()}`,
      name: name,
      description: desc,
      items: routes.length > 0 ? routes.map(createTestRoute) : testRoutes, // Adiciona as 5 rotas teste
      environments: [],
    }; 
  }

  const triggerNewCollection = useCallback(async () => {
    try {
      // Tenta salvar a coleção atual antes de prosseguir
      await handleSaveCollection();
    } catch (error) {
      console.error("Erro ao salvar coleção antes de criar nova:", error);
    } finally {
      // Abre o modal de nova coleção
      setNovaCollectionOpen(true);
    }
  }, [handleSaveCollection, setNovaCollectionOpen]);

  return { triggerNewCollection, createTestRoute, newCollection };
}
