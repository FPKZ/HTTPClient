import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * useTabStore
 * Store centralizado para gerenciamento de abas editáveis e coleção de rotas.
 *
 * Conceito:
 * - `collection`: Fonte da verdade (dados originais da coleção)
 * - `tabs`: Abas abertas (rascunhos editáveis)
 * - Edições nas abas NÃO afetam a collection até chamar `saveTabToCollection`
 */
const useTabStore = create(
  persist(
    (set, get) => ({
      // ==================== ESTADO ====================

      // Array de abas abertas
      tabs: [],

      // ID da aba ativa
      activeTabId: null,

      // Coleção original (fonte da verdade)
      collection: {
        id: null,
        name: "",
        description: "",
        routes: [], // Array de [screenKey, telaData]
      },

      // ==================== AÇÕES - ABAS ====================

      /**
       * Adiciona uma nova aba a partir de uma rota da coleção
       * @param {string} screenKey - Chave da rota
       * @param {object} routeData - Dados da rota
       */
      addTab: (screenKey, routeData) => {
        const { tabs } = get();

        // Verifica se já existe aba para esta rota
        const existingTab = tabs.find((tab) => tab.screenKey === screenKey);
        if (existingTab) {
          set({ activeTabId: existingTab.id });
          return;
        }

        // Cria nova aba
        const newTab = {
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          screenKey,
          title: screenKey,
          method: routeData.request.method || "GET",
          url: routeData.request.url || "",
          data: JSON.parse(JSON.stringify(routeData)), // Deep clone
          isDirty: false, // Indica se foi modificada
        };

        set({
          tabs: [...tabs, newTab],
          activeTabId: newTab.id,
        });
      },

      /**
       * Cria uma aba em branco (nova requisição)
       */
      addBlankTab: () => {
        const newTab = {
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          screenKey: null, // Não vinculada a rota existente
          title: "Nova Requisição",
          method: "GET",
          url: "",
          data: {
            request: {
              method: "GET",
              url: "",
              headers: {},
              body: "",
            },
          },
          isDirty: true,
        };

        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }));
      },

      /**
       * Define a aba ativa
       * @param {string} id - ID da aba
       */
      setActiveTab: (id) => {
        set({ activeTabId: id });
      },

      /**
       * Fecha uma aba
       * @param {string} id - ID da aba
       */
      closeTab: (id) => {
        const { tabs, activeTabId } = get();
        const newTabs = tabs.filter((tab) => tab.id !== id);

        let newActiveId = activeTabId;

        // Se fechou a aba ativa, foca na última ou null
        if (activeTabId === id) {
          newActiveId =
            newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
        }

        set({
          tabs: newTabs,
          activeTabId: newActiveId,
        });
      },

      /**
       * Atualiza dados de uma aba específica
       * @param {string} id - ID da aba
       * @param {object} newData - Novos dados (parcial)
       */
      updateTabData: (id, newData) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, ...newData, isDirty: true } : tab
          ),
        }));
      },

      /**
       * Atualiza campo específico da requisição na aba
       * @param {string} id - ID da aba
       * @param {string} sectionKey - Chave da seção (headers, body, etc)
       * @param {string|null} fieldKey - Chave do campo (ou null para substituir seção inteira)
       * @param {any} value - Novo valor
       */
      updateTabRequest: (id, sectionKey, fieldKey, value) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.id !== id) return tab;

            const updatedRequest = { ...tab.data.request };

            if (fieldKey === null) {
              // Substituir seção inteira
              updatedRequest[sectionKey] = value;
            } else {
              // Atualizar campo específico
              const currentSection =
                typeof updatedRequest[sectionKey] === "object"
                  ? updatedRequest[sectionKey]
                  : {};

              updatedRequest[sectionKey] = {
                ...currentSection,
                [fieldKey]: value,
              };
            }

            return {
              ...tab,
              data: {
                ...tab.data,
                request: updatedRequest,
              },
              // Atualizar também URL e método no nível superior para facilitar acesso
              url: updatedRequest.url || tab.url,
              method: updatedRequest.method || tab.method,
              isDirty: true,
            };
          }),
        }));
      },

      /**
       * Salva as mudanças da aba na coleção original
       * @param {string} id - ID da aba
       */
      saveTabToCollection: (id) => {
        const { tabs, collection } = get();
        const tab = tabs.find((t) => t.id === id);

        if (!tab) return;

        // Se a aba não está vinculada a uma rota, cria nova rota
        if (!tab.screenKey) {
          const newScreenKey =
            tab.title.replace(/\s+/g, "_") || `route_${Date.now()}`;
          const newRoute = [newScreenKey, tab.data];

          set({
            collection: {
              ...collection,
              routes: [...collection.routes, newRoute],
            },
            tabs: tabs.map((t) =>
              t.id === id
                ? { ...t, screenKey: newScreenKey, isDirty: false }
                : t
            ),
          });
          return;
        }

        // Atualiza rota existente
        const updatedRoutes = collection.routes.map(([key, data]) =>
          key === tab.screenKey ? [key, tab.data] : [key, data]
        );

        set({
          collection: {
            ...collection,
            routes: updatedRoutes,
          },
          tabs: tabs.map((t) => (t.id === id ? { ...t, isDirty: false } : t)),
        });
      },

      // ==================== AÇÕES - COLEÇÃO ====================

      /**
       * Carrega uma coleção (geralmente do location.state)
       * @param {object} data - Dados da coleção
       */
      loadCollection: (data) => {
        const routes = data?.telas ? Object.entries(data.telas) : [];

        set({
          collection: {
            id: data?.id || null,
            name: data?.collectionName || "Collection",
            description: data?.description || "",
            routes,
          },
          // Limpar abas ao carregar nova coleção
          tabs: [],
          activeTabId: null,
        });
      },

      /**
       * Adiciona nova rota à coleção
       */
      addRoute: () => {
        const { collection } = get();
        const newKey = `nova_rota_${Date.now()}`;
        const newRoute = [
          newKey,
          {
            request: {
              method: "GET",
              url: "",
              headers: {},
              body: "",
            },
          },
        ];

        set({
          collection: {
            ...collection,
            routes: [...collection.routes, newRoute],
          },
        });

        // Abre aba automaticamente para a nova rota
        get().addTab(newKey, newRoute[1]);
      },

      /**
       * Remove rota da coleção
       * @param {string} screenKey - Chave da rota
       */
      deleteRoute: (screenKey) => {
        const { collection, tabs } = get();

        set({
          collection: {
            ...collection,
            routes: collection.routes.filter(([key]) => key !== screenKey),
          },
          // Fechar aba se estiver aberta
          tabs: tabs.filter((tab) => tab.screenKey !== screenKey),
        });
      },

      /**
       * Atualiza metadados da coleção (nome e descrição)
       * @param {string} name - Novo nome
       * @param {string} description - Nova descrição
       */
      updateCollectionMeta: (name, description) => {
        set((state) => ({
          collection: {
            ...state.collection,
            name: name || state.collection.name,
            description:
              description !== undefined
                ? description
                : state.collection.description,
          },
        }));
      },

      // ==================== GETTERS ====================

      /**
       * Retorna a aba ativa
       */
      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((tab) => tab.id === activeTabId) || null;
      },

      /**
       * Retorna dados da coleção no formato esperado pelo backend
       */
      getCollectionForExport: () => {
        const { collection } = get();
        return {
          id: collection.id,
          collectionName: collection.name,
          content: {
            axios: Object.fromEntries(collection.routes),
          },
        };
      },
    }),
    {
      name: "httpclient-tabs-storage", // Nome da chave no localStorage
      partialize: (state) => ({
        // Persiste apenas abas e activeTabId
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);

export default useTabStore;
