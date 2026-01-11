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
        descricao: "",
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
                mode: "json",
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
        // Função recursiva para limpar e normalizar itens
        const normalizeItems = (items) => {
          if (!Array.isArray(items)) return [];
          
          return items.map((item) => {
            // Determina se é pasta ou rota
            const isFolder = item.type === "folder" || !!item.items || !!item.routes;
            const type = item.type || (isFolder ? "folder" : "route");
            
            // Normaliza filhos (suporta items ou routes)
            const children = item.items || item.routes || [];
            
            // Constroi objeto limpo para evitar poluição do estado
            const normalizedItem = {
              id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: item.name || "Sem Nome",
              type,
              // Propriedades de Rota
              ...(type === "route" && {
                request: item.request || { method: "GET", url: "" },
                response: item.response || null,
              }),
              // Propriedades de Pasta
              ...(type === "folder" && {
                items: normalizeItems(children),
              }),
            };

            return normalizedItem;
          });
        };

        const rawItems = data?.items || data?.content?.items || data?.routes || data?.content?.routes || [];
        const cleanItems = normalizeItems(rawItems);

        set({
          collection: {
            id: data?.id || null,
            name: data?.name || data?.collectionName || "Collection",
            descricao: data?.descricao || data?.description || "",
            items: cleanItems,
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
              mode: "json",
              content: "",
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

        const findTargetFolder = (items, targetId) => {
          if (!targetId) return null;
          for (const item of items) {
            if (item.id === targetId) {
              return item.type === "folder" ? item.id : null;
            }
            if (item.type === "folder" && item.items) {
              const child = item.items.find((i) => i.id === targetId);
              if (child) {
                return child.type === "folder" ? child.id : item.id;
              }
              const nested = findTargetFolder(item.items, targetId);
              if (nested) return nested;
            }
          }
          return null;
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

        const effectiveParentId = findTargetFolder(collection.items, parentId);

        if (!effectiveParentId) {
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
              items: addItemToTree(collection.items, effectiveParentId, newRoute),
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

        const findTargetFolder = (items, targetId) => {
          if (!targetId) return null;
          for (const item of items) {
            if (item.id === targetId) {
              return item.type === "folder" ? item.id : null;
            }
            if (item.type === "folder" && item.items) {
              const child = item.items.find((i) => i.id === targetId);
              if (child) {
                return child.type === "folder" ? child.id : item.id;
              }
              const nested = findTargetFolder(item.items, targetId);
              if (nested) return nested;
            }
          }
          return null;
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

        const effectiveParentId = findTargetFolder(collection.items, parentId);

        if (!effectiveParentId) {
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
              items: addItemToTree(collection.items, effectiveParentId, newFolder),
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

      isDraggingDisabled: false,
      setDraggingDisabled: (disabled) => set({ isDraggingDisabled: disabled }),

      /**
       * Move um item para dentro de uma pasta
       * @param {string} activeId - ID do item a ser movido
       * @param {string} folderId - ID da pasta de destino
       */
      moveItemToFolder: (activeId, folderId) => {
        const { collection } = get();
        if (activeId === folderId) return;

        const findItemPath = (items, id, path = []) => {
          for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) return [...path, i];
            if (items[i].items) {
              const res = findItemPath(items[i].items, id, [...path, i]);
              if (res) return res;
            }
          }
          return null;
        };

        const getItemByPath = (items, path) => {
          let curr = items;
          for (let i = 0; i < path.length - 1; i++) {
            curr = curr[path[i]].items;
          }
          return curr[path[path.length - 1]];
        };

        const removeItemByPath = (items, path) => {
          const newItems = JSON.parse(JSON.stringify(items)); // Deep copy to avoid mutations
          let curr = newItems;
          for (let i = 0; i < path.length - 1; i++) {
            curr = curr[path[i]].items;
          }
          curr.splice(path[path.length - 1], 1);
          return newItems;
        };

        const activePath = findItemPath(collection.items, activeId);
        if (!activePath) return;

        const itemToMove = getItemByPath(collection.items, activePath);
        let updatedItems = removeItemByPath(collection.items, activePath);

        const addItemToFolder = (items, targetFolderId, item) => {
          return items.map((f) => {
            if (f.id === targetFolderId && f.type === "folder") {
              return { ...f, items: [...(f.items || []), item] };
            }
            if (f.items) {
              return { ...f, items: addItemToFolder(f.items, targetFolderId, item) };
            }
            return f;
          });
        };

        updatedItems = addItemToFolder(updatedItems, folderId, itemToMove);

        set({
          collection: { ...collection, items: updatedItems }
        });
      },

      /**
       * Reordena itens na coleção (Drag and Drop)
       * @param {string} activeId - ID do item sendo arrastado
       * @param {string|null} overId - ID do item sobre o qual foi solto
       */
      reorderItems: (activeId, overId) => {
        if (activeId === overId) return;
        const { collection } = get();

        const findItemPath = (items, id, path = []) => {
          for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) return [...path, i];
            if (items[i].type === "folder" && items[i].items) {
              const res = findItemPath(items[i].items, id, [...path, i]);
              if (res) return res;
            }
          }
          return null;
        };

        const getItemByPath = (items, path) => {
          let curr = items;
          for (let i = 0; i < path.length - 1; i++) {
            curr = curr[path[i]].items;
          }
          return curr[path[path.length - 1]];
        };

        const removeItemByPath = (items, path) => {
          const newItems = [...items];
          let curr = newItems;
          for (let i = 0; i < path.length - 1; i++) {
            curr[path[i]] = {
              ...curr[path[i]],
              items: [...curr[path[i]].items],
            };
            curr = curr[path[i]].items;
          }
          curr.splice(path[path.length - 1], 1);
          return newItems;
        };

        const insertItemByPath = (items, path, item) => {
          const newItems = [...items];
          let curr = newItems;
          for (let i = 0; i < path.length - 1; i++) {
            curr[path[i]] = {
              ...curr[path[i]],
              items: [...curr[path[i]].items],
            };
            curr = curr[path[i]].items;
          }
          curr.splice(path[path.length - 1], 0, item);
          return newItems;
        };

        const activePath = findItemPath(collection.items, activeId);
        const overPath = overId ? findItemPath(collection.items, overId) : [collection.items.length];

        if (!activePath) return;

        const itemToMove = getItemByPath(collection.items, activePath);
        
        let updatedItems = removeItemByPath(collection.items, activePath);
        
        // Inserir o item na nova posição
        // Nota: Removido ajuste de -1 ao arrastar para baixo para evitar bug de "um item acima"
        updatedItems = insertItemByPath(updatedItems, overPath, itemToMove);

        set({
          collection: {
            ...collection,
            items: updatedItems,
          },
        });
      },

      /**
       * Atualiza metadados da coleção (nome e descrição)
       * @param {string} name - Novo nome
       * @param {string} description - Nova descrição
       */
      updateCollectionMeta: (name, descricao) => {
        set((state) => ({
          collection: {
            ...state.collection,
            name: name !== undefined ? name : state.collection.name,
            descricao:
              descricao !== undefined
                ? descricao
                : state.collection.descricao,
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
          name: collection.name,
          descricao: collection.descricao,
          items: collection.items,
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
