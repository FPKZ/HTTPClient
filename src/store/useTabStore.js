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
        items: [], // Array de FolderData ou RouteData
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
          title: routeData.name || screenKey,
          method: routeData.request?.method || "GET",
          url: routeData.request?.url || "",
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
      addBlankTab: (nome = "Nova Requisição") => {
        const title =
          typeof nome === "string"
            ? !nome
              ? "Nova Requisição"
              : nome
            : "Nova Requisição";
        const newTab = {
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          screenKey: null, // Não vinculada a rota existente
          title,
          method: "GET",
          url: "",
          data: {
            type: "route",
            request: {
              method: "GET",
              url: "",
              headers: [],
              params: [],
              body: {
                mode: "inputs",
                content: [{ key: "", value: "", enabled: true }],
              },
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
              // Se for um objeto (como auth), atualizamos a propriedade específica
              const section = updatedRequest[sectionKey] || {};
              updatedRequest[sectionKey] = {
                ...section,
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

        const updateInTree = (items) => {
          return items.map((item) => {
            if (item.id === tab.screenKey) {
              return { ...item, ...tab.data, id: item.id, name: tab.title };
            }
            if (item.type === "folder" && item.items) {
              return { ...item, items: updateInTree(item.items) };
            }
            return item;
          });
        };

        const updatedItems = updateInTree(collection.items);

        // Se não encontrou (ex: aba em branco), cria nova na raiz por padrão ou o usuário decide no futuro
        const findRoute = (items, key) => {
          for (const item of items) {
            if (item.id === key) return item;
            if (item.type === "folder" && item.items) {
              const found = findRoute(item.items, key);
              if (found) return found;
            }
          }
          return null;
        };

        const routeExists = findRoute(collection.items, tab.screenKey);

        if (!routeExists) {
          const newRoute = {
            ...tab.data,
            type: "route",
            id: tab.screenKey || `route_${Date.now()}`,
            name: tab.title,
          };
          set({
            collection: {
              ...collection,
              items: [...collection.items, newRoute],
            },
            tabs: tabs.map((t) =>
              t.id === id ? { ...t, screenKey: newRoute.id, isDirty: false } : t
            ),
          });
          return;
        }

        set({
          collection: {
            ...collection,
            items: updatedItems,
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
        // Normaliza rotas para o novo formato se necessário (compatibilidade)
        let items = data?.content?.routes || data?.routes || data?.items || [];

        // Se as rotas vierem como array plano sem 'type', marcamos como route
        items = items.map((item) => ({
          ...item,
          type: item.type || (item.items ? "folder" : "route"),
        }));

        set({
          collection: {
            id: data?.id || null,
            name: data?.collectionName || data?.name || "Collection",
            description: data?.description || "",
            items,
          },
          // Limpar abas ao carregar nova coleção
          tabs: [],
          activeTabId: null,
        });
      },

      /**
       * Adiciona nova rota à coleção
       * @param {string|null} parentId - ID da pasta pai
       * @param {string} name - Nome da rota
       */
      addRoute: (parentId = null, name = "Nova Rota") => {
        const routeName =
          typeof name === "string" ? (!name ? "Nova Rota" : name) : "Nova Rota";

        const { collection } = get();
        const newRoute = {
          id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: "route",
          name: routeName,
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

        const addItemToTree = (items, targetId, newItem) => {
          return items.map((item) => {
            if (item.id === targetId && item.type === "folder") {
              return {
                ...item,
                items: [...(item.items || []), newItem],
              };
            }
            if (item.type === "folder" && item.items) {
              return {
                ...item,
                items: addItemToTree(item.items, targetId, newItem),
              };
            }
            return item;
          });
        };

        if (!parentId) {
          set({
            collection: {
              ...collection,
              items: [...collection.items, newRoute],
            },
          });
        } else {
          set({
            collection: {
              ...collection,
              items: addItemToTree(collection.items, parentId, newRoute),
            },
          });
        }

        // Abre aba automaticamente para a nova rota
        get().addTab(newRoute.id, newRoute);
      },

      /**
       * Adiciona nova pasta à coleção
       * @param {string|null} parentId - ID da pasta pai
       * @param {string} name - Nome da pasta
       */
      addFolder: (parentId = null, name = "Nova Pasta") => {
        const folderName =
          typeof name === "string"
            ? !name
              ? "Nova Pasta"
              : name
            : "Nova Pasta";

        const { collection } = get();
        const newFolder = {
          id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: "folder",
          name: folderName,
          items: [],
        };

        const addItemToTree = (items, targetId, newItem) => {
          return items.map((item) => {
            if (item.id === targetId && item.type === "folder") {
              return {
                ...item,
                items: [...(item.items || []), newItem],
              };
            }
            if (item.type === "folder" && item.items) {
              return {
                ...item,
                items: addItemToTree(item.items, targetId, newItem),
              };
            }
            return item;
          });
        };

        if (!parentId) {
          set({
            collection: {
              ...collection,
              items: [...collection.items, newFolder],
            },
          });
        } else {
          set({
            collection: {
              ...collection,
              items: addItemToTree(collection.items, parentId, newFolder),
            },
          });
        }
      },

      /**
       * Remove item (rota ou pasta) da coleção
       * @param {string} id - ID do item
       */
      deleteItem: (id) => {
        const { collection, tabs } = get();

        const removeItemFromTree = (items, targetId) => {
          return items
            .filter((item) => item.id !== targetId)
            .map((item) => {
              if (item.type === "folder" && item.items) {
                return {
                  ...item,
                  items: removeItemFromTree(item.items, targetId),
                };
              }
              return item;
            });
        };

        const collectRouteIds = (item) => {
          let ids = [];
          if (item.type === "route") {
            ids.push(item.id);
          } else if (item.items) {
            item.items.forEach((child) => {
              ids = [...ids, ...collectRouteIds(child)];
            });
          }
          return ids;
        };

        // Encontrar o item para saber quais tabs fechar
        const findItem = (items, targetId) => {
          for (const item of items) {
            if (item.id === targetId) return item;
            if (item.type === "folder" && item.items) {
              const found = findItem(item.items, targetId);
              if (found) return found;
            }
          }
          return null;
        };

        const itemToDelete = findItem(collection.items, id);
        const idsToClose = itemToDelete ? collectRouteIds(itemToDelete) : [id];

        set({
          collection: {
            ...collection,
            items: removeItemFromTree(collection.items, id),
          },
          // Fechar abas se estiverem abertas
          tabs: tabs.filter((tab) => !idsToClose.includes(tab.screenKey)),
        });
      },

      /**
       * Inicia a renomeação de um item (pasta ou rota)
       * @param {string} id - ID do item
       * @param {string} newName - Novo nome
       */
      renameItem: (id, newName) => {
        const { collection, tabs } = get();

        const updateNameInTree = (items) => {
          return items.map((item) => {
            if (item.id === id) {
              return { ...item, name: newName };
            }
            if (item.type === "folder" && item.items) {
              return { ...item, items: updateNameInTree(item.items) };
            }
            return item;
          });
        };

        const updatedItems = updateNameInTree(collection.items);

        set({
          collection: {
            ...collection,
            items: updatedItems,
          },
          // Sincroniza automaticamente com o título da aba, se estiver aberta
          tabs: tabs.map((tab) =>
            tab.screenKey === id ? { ...tab, title: newName } : tab
          ),
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
            name: name !== undefined ? name : state.collection.name,
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
            items: collection.items,
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
