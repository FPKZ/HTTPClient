/**
 * collectionSlice.js
 * Gerenciamento do estado da coleção e sincronização com abas.
 */
import * as utils from "../../utils/collectionUtils";

export const createCollectionSlice = (set, get) => {
  const envUpdateTimeouts = {};
  const envInitialNames = {};
  const varUpdateTimeouts = {};
  const varInitialStates = {};

  /* Helper para log debounce de variáveis (Global e Ambiente) */
  const scheduleVariableLog = (varId, logLabel, getCurrentVarFn) => {
    // Inicializa estado original se não existir
    if (!varInitialStates[varId]) {
      const v = getCurrentVarFn();
      if (v) {
        // Copia propriedades relevantes
        varInitialStates[varId] = {
          key: v.key,
          value: v.value,
          currentValue: v.currentValue,
          initialValue: v.initialValue,
        };
      }
    }

    if (varUpdateTimeouts[varId]) clearTimeout(varUpdateTimeouts[varId]);

    varUpdateTimeouts[varId] = setTimeout(() => {
      const initial = varInitialStates[varId];
      const current = getCurrentVarFn();

      if (initial && current) {
        if (initial.key !== current.key) {
          window.electronAPI.logAction(
            `Alterando o nome da ${logLabel}: ${initial.key}, para: ${current.key}`,
          );
        } else {
          // Alterações de valor (Global usa 'value', Env usa 'currentValue/initialValue')
          if (initial.value !== undefined && initial.value !== current.value) {
            window.electronAPI.logAction(
              `Alterando o valor da ${logLabel}: ${current.key}`,
            );
          }
          if (
            initial.currentValue !== undefined &&
            initial.currentValue !== current.currentValue
          ) {
            window.electronAPI.logAction(
              `Alterando o Valor Atual da ${logLabel}: ${current.key}`,
            );
          }
          if (
            initial.initialValue !== undefined &&
            initial.initialValue !== current.initialValue
          ) {
            window.electronAPI.logAction(
              `Alterando o Valor Inicial da ${logLabel}: ${current.key}`,
            );
          }
        }
      }

      delete varUpdateTimeouts[varId];
      delete varInitialStates[varId];
    }, 1000);
  };

  return {
    collection: {
      id: null,
      name: "",
      description: "",
      items: [],
      environments: [],
      activeEnvironmentId: null,
    },
    globals: [],
    clipboard: null, // Estado para área de transferência
    isDraggingDisabled: false,

    setDraggingDisabled: (disabled) => set({ isDraggingDisabled: disabled }),

    loadCollection: (data) => {
      const rawItems =
        data?.items ||
        data?.content?.items ||
        data?.routes ||
        data?.content?.routes ||
        [];
      const cleanItems = utils.normalizeItems(rawItems);

      let environments = data?.environments || [];
      let activeEnvironmentId = data?.activeEnvironmentId || null;

      // Migração: se environments for o formato antigo (array de variaveis direto)
      if (environments.length > 0 && !environments[0].variables) {
        environments = [
          {
            id: "env_migrated",
            name: "Importado",
            variables: environments.map((v) => ({
              id: `var_${Math.random().toString(36).substr(2, 9)}`,
              key: v.name || "",
              initialValue: v.value || "",
              currentValue: v.value || "",
              enabled: v.enabled !== undefined ? v.enabled : true,
            })),
          },
        ];
        activeEnvironmentId = "env_migrated";
      }

      if (environments.length === 0) {
        environments = [];
        activeEnvironmentId = null;
      }

      window.electronAPI.logAction("Coleção carregada: " + data?.name);
      set({
        collection: {
          id: data?.id || null,
          name: data?.name || data?.collectionName || "Collection",
          description: data?.descricao || data?.description || "",
          items: cleanItems,
          environments,
          activeEnvironmentId,
        },
        tabs: [],
        activeTabId: null,
      });
    },

    saveTabToCollection: (id) => {
      const { tabs, collection } = get();
      const tab = tabs.find((t) => t.id === id);
      if (!tab) return;

      const routeExists = utils.findItemById(collection.items, tab.screenKey);

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
            t.id === id ? { ...t, screenKey: newRoute.id, isDirty: false } : t,
          ),
        });
        return;
      }

      const updatedItems = utils.updateItemInTree(
        collection.items,
        tab.screenKey,
        {
          ...tab.data,
          name: tab.title,
        },
      );
      window.electronAPI.logAction("Salvando alterações na rota: " + tab.title);
      set({
        collection: { ...collection, items: updatedItems },
        tabs: tabs.map((t) => (t.id === id ? { ...t, isDirty: false } : t)),
      });
    },

    addRoute: (parentId = null, name = "Nova Rota") => {
      const { collection } = get();
      const newRoute = {
        id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: "route",
        name: name || "Nova Rota",
        request: {
          method: "GET",
          url: "",
          headers: [
            { key: "Content-Type", value: "application/json", enabled: true },
          ],
          params: [],
          body: { mode: "json", content: "" },
          auth: {
            name: "none",
            config: { key: "", type: "Bearer", value: "header" },
          },
        },
      };

      const updatedItems = utils.addItemToTree(
        collection.items,
        parentId,
        newRoute,
      );
      set({ collection: { ...collection, items: updatedItems } });
      get().addTab(newRoute.id, newRoute);
    },

    duplicateRoute: (id) => {
      const { collection } = get();
      const route = utils.findItemById(collection.items, id);
      if (!route) return;

      const newRoute = {
        ...route,
        name: route.name + " (Cópia)",
        id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      };

      const path = utils.findItemPath(collection.items, id);
      if (path) {
        const insertPath = [...path];
        insertPath[insertPath.length - 1] += 1;

        const updatedItems = utils.insertItemByPath(
          collection.items,
          insertPath,
          newRoute,
        );

        window.electronAPI.logAction("Duplicada a rota: " + route.name);
        set({ collection: { ...collection, items: updatedItems } });
        get().addTab(newRoute.id, newRoute);
      }
    },

    copyRoute: (id) => {
      const { collection } = get();
      const item = utils.findItemById(collection.items, id);
      if (!item) return;

      // Cria uma cópia profunda para o clipboard
      const itemCopy = JSON.parse(JSON.stringify(item));
      set({ clipboard: { ...itemCopy, name: itemCopy.name + " (Cópia)" } });

      window.electronAPI.logAction(
        `Copiado para a área de transferência: ${itemCopy.name}`,
      );
    },

    pasteRoute: (targetId) => {
      const { clipboard, collection } = get();
      if (!clipboard) return;

      // Regera IDs para garantir unicidade
      const newItem = utils.regenerateIds(clipboard);

      let updatedItems;

      if (!targetId) {
        // Colar na raiz (append)
        updatedItems = utils.addItemToTree(collection.items, null, newItem);
      } else {
        const targetItem = utils.findItemById(collection.items, targetId);

        if (targetItem && (targetItem.type === "folder" || targetItem.items)) {
          // Colar dentro da pasta (append no final)
          updatedItems = utils.addItemToTree(
            collection.items,
            targetId,
            newItem,
          );
        } else {
          // Colar como irmão LOGO ABAIXO do target
          const targetPath = utils.findItemPath(collection.items, targetId);
          if (targetPath) {
            const insertPath = [...targetPath];
            insertPath[insertPath.length - 1] += 1; // Incrementa o índice para ser o próximo

            updatedItems = utils.insertItemByPath(
              collection.items,
              insertPath,
              newItem,
            );
          } else {
            // Fallback: Raiz
            updatedItems = utils.addItemToTree(collection.items, null, newItem);
          }
        }
      }

      window.electronAPI.logAction(`Colado: ${newItem.name}`);
      set({ collection: { ...collection, items: updatedItems } });

      // Se for rota, abre aba
      if (newItem.type === "route") {
        get().addTab(newItem.id, newItem);
      }
      set({ clipboard: null });
    },

    addFolder: (parentId = null, name = "Nova Pasta") => {
      const { collection } = get();
      const newFolder = {
        id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: "folder",
        name: name || "Nova Pasta",
        items: [],
      };

      // window.electronAPI.logAction("Adicionando pasta: " + newFolder.name + " - Com o nome: " + newFolder.name);

      const updatedItems = utils.addItemToTree(
        collection.items,
        parentId,
        newFolder,
      );
      set({ collection: { ...collection, items: updatedItems } });
    },

    deleteItem: (id) => {
      const { collection, tabs } = get();
      const itemToDelete = utils.findItemById(collection.items, id);
      if (!itemToDelete) return;

      const idsToClose = utils.collectRouteIds(itemToDelete);
      const updatedItems = utils.removeItemFromTree(collection.items, id);

      set({
        collection: { ...collection, items: updatedItems },
        tabs: tabs.filter((tab) => !idsToClose.includes(tab.screenKey)),
      });
    },

    renameItem: (id, newName) => {
      const { collection, tabs } = get();
      const updatedItems = utils.updateItemInTree(collection.items, id, {
        name: newName,
      });

      set({
        collection: { ...collection, items: updatedItems },
        tabs: tabs.map((tab) =>
          tab.screenKey === id ? { ...tab, title: newName } : tab,
        ),
      });
    },

    moveItemToFolder: (activeId, folderId) => {
      const { collection } = get();
      if (activeId === folderId) return;

      const activePath = utils.findItemPath(collection.items, activeId);
      if (!activePath) return;

      // Identifica origem e destino para log
      let sourceName = "Raiz";
      if (activePath.length > 1) {
        const parentPath = activePath.slice(0, -1);
        const parentItem = utils.getItemByPath(collection.items, parentPath);
        sourceName = parentItem ? parentItem.name : "Raiz";
      }

      let targetName = "Raiz";
      if (folderId) {
        const targetFolder = utils.findItemById(collection.items, folderId);
        targetName = targetFolder ? targetFolder.name : "Raiz";
      }

      const itemToMove = utils.getItemByPath(collection.items, activePath);

      // Log da ação de mover
      window.electronAPI.logAction(
        `Movendo ${utils.translate(itemToMove.type)}: ${itemToMove.name}, de: ${sourceName}, para: ${targetName}`,
      );

      let updatedItems = utils.removeItemByPath(collection.items, activePath);
      // Passa false para suprimir o log padrão de "Adicionando"
      updatedItems = utils.addItemToTree(
        updatedItems,
        folderId,
        itemToMove,
        false,
      );

      set({ collection: { ...collection, items: updatedItems } });
    },

    reorderItems: (activeId, overId) => {
      if (activeId === overId) return;
      const { collection } = get();

      const activePath = utils.findItemPath(collection.items, activeId);
      const overPath = overId
        ? utils.findItemPath(collection.items, overId)
        : [collection.items.length];
      if (!activePath) return;

      // Identifica origem e destino para log (ex: "Raiz", "Pasta X")
      let sourceName = "Raiz";
      if (activePath.length > 1) {
        const parentPath = activePath.slice(0, -1);
        const parentItem = utils.getItemByPath(collection.items, parentPath);
        sourceName = parentItem ? parentItem.name : "Raiz";
      }

      let targetName = "Raiz";
      // overPath aponta para o item onde estamos soltando (ou ao lado dele)
      // Se overPath tem tamanho > 1, significa que estamos soltando DENTRO de algo (ou ao lado de algo que está dentro de algo)
      // O destino real é o "pai" do local onde caiu.
      if (overPath.length > 1) {
        const parentPath = overPath.slice(0, -1);
        const parentItem = utils.getItemByPath(collection.items, parentPath);
        targetName = parentItem ? parentItem.name : "Raiz";
      }

      const itemToMove = utils.getItemByPath(collection.items, activePath);

      // Se mudou de pasta, loga como "Movendo", senão "Reordenando"
      if (sourceName !== targetName) {
        window.electronAPI.logAction(
          `Movendo ${utils.translate(itemToMove.type)}: ${itemToMove.name}, de: ${sourceName}, para: ${targetName}`,
        );
      } else {
        window.electronAPI.logAction(
          `Reordenando ${utils.translate(itemToMove.type)}: ${itemToMove.name}, em: ${sourceName}`,
        );
      }

      let updatedItems = utils.removeItemByPath(collection.items, activePath);
      updatedItems = utils.insertItemByPath(updatedItems, overPath, itemToMove);

      set({ collection: { ...collection, items: updatedItems } });
    },

    updateCollectionMeta: (name, description) => {
      window.electronAPI.logAction(
        `Atualizando coleção: ${get().collection.name}, ${description ? `descrição: ${get().collection.description},` : ""} para: ${name}, ${description ? `descrição: ${description}` : ""}`,
      );
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

    updateEnvironments: (environments) => {
      set((state) => ({
        collection: { ...state.collection, environments },
      }));
    },

    setActiveEnvironment: (id) => {
      const env = get().collection.environments.find((e) => e.id === id);
      window.electronAPI.logAction(`Ativando ambiente: ${env.name}`);
      set((state) => ({
        collection: { ...state.collection, activeEnvironmentId: id },
      }));
    },

    addEnvironment: (name = "Novo Ambiente") => {
      window.electronAPI.logAction(`Adicionando novo ambiente: ${name}`);
      const newEnv = {
        id: `env_${Date.now()}`,
        name: name,
        variables: [],
      };
      set((state) => ({
        collection: {
          ...state.collection,
          environments: [...state.collection.environments, newEnv],
        },
      }));
      return newEnv.id;
    },

    deleteEnvironment: (id) => {
      set((state) => {
        const newEnvs = state.collection.environments.filter((e) => {
          if (e.id === id) {
            window.electronAPI.logAction(`Removendo ambiente: ${e.name}`);
          }
          return e.id !== id;
        });
        let newActiveId = state.collection.activeEnvironmentId;
        if (newActiveId === id) {
          newActiveId = newEnvs.length > 0 ? newEnvs[0].id : null;
        }
        return {
          collection: {
            ...state.collection,
            environments: newEnvs,
            activeEnvironmentId: newActiveId,
          },
        };
      });
    },

    updateEnvironmentName: (id, name) => {
      // Inicializa o nome original se não existir (primeira tecla)
      if (!envInitialNames[id]) {
        const env = get().collection.environments.find((e) => e.id === id);
        envInitialNames[id] = env ? env.name : "";
      }

      // Limpa timeout anterior
      if (envUpdateTimeouts[id]) {
        clearTimeout(envUpdateTimeouts[id]);
      }

      // Agenda novo log
      envUpdateTimeouts[id] = setTimeout(() => {
        const initialName = envInitialNames[id];
        if (initialName !== name) {
          window.electronAPI.logAction(
            `Alterando o nome do ambiente: ${initialName}, para: ${name}`,
          );
        }
        // Limpeza
        delete envUpdateTimeouts[id];
        delete envInitialNames[id];
      }, 1000);

      set((state) => ({
        collection: {
          ...state.collection,
          environments: state.collection.environments.map((e) => {
            return e.id === id ? { ...e, name } : e;
          }),
        },
      }));
    },

    addVariable: (envId) => {
      set((state) => ({
        collection: {
          ...state.collection,
          environments: state.collection.environments.map((e) => {
            if (e.id === envId) {
              window.electronAPI.logAction(
                `Adicionando nova variável: ${e.name}`,
              );
              return {
                ...e,
                variables: [
                  ...e.variables,
                  {
                    id: `var_${Date.now()}`,
                    key: "",
                    initialValue: "",
                    currentValue: "",
                    enabled: true,
                  },
                ],
              };
            }
            return e;
          }),
        },
      }));
    },

    updateVariable: (envId, varId, updates) => {
      // Usa o helper para agendar o log debounce
      scheduleVariableLog(varId, "variável", () => {
        const env = get().collection.environments.find((e) => e.id === envId);
        return env?.variables.find((v) => v.id === varId);
      });

      set((state) => ({
        collection: {
          ...state.collection,
          environments: state.collection.environments.map((e) => {
            if (e.id === envId) {
              return {
                ...e,
                variables: e.variables.map((v) =>
                  v.id === varId ? { ...v, ...updates } : v,
                ),
              };
            }
            return e;
          }),
        },
      }));
    },

    deleteVariable: (envId, varId) => {
      set((state) => ({
        collection: {
          ...state.collection,
          environments: state.collection.environments.map((e) => {
            if (e.id === envId) {
              return {
                ...e,
                variables: e.variables.filter((v) => {
                  if (v.id === varId) {
                    window.electronAPI.logAction(
                      `Deletando variável: ${v.key} do ambiente: ${e.name}`,
                    );
                  }
                  return v.id !== varId;
                }),
              };
            }
            return e;
          }),
        },
      }));
    },

    addGlobalVariable: () => {
      window.electronAPI.logAction("Adicionando nova variável global");
      set((state) => ({
        globals: [
          ...(state.globals || []),
          {
            id: `global_${Date.now()}`,
            key: "",
            value: "",
            enabled: true,
          },
        ],
      }));
    },

    updateGlobalVariable: (id, updates) => {
      // Usa o helper para agendar o log debounce
      scheduleVariableLog(id, "variável global", () => {
        return get().globals.find((v) => v.id === id);
      });

      set((state) => ({
        globals: (state.globals || []).map((v) =>
          v.id === id ? { ...v, ...updates } : v,
        ),
      }));
    },

    deleteGlobalVariable: (id) => {
      set((state) => ({
        globals: (state.globals || []).filter((v) => {
          if (v.id === id) {
            window.electronAPI.logAction(`Deletando variável global: ${v.key}`);
          }
          return v.id !== id;
        }),
      }));
    },

    importEnvironment: (envData) => {
      if (!envData || !envData.variables) return;

      const newEnv = {
        id: `env_${Date.now()}`,
        name: `${envData.name || "Importado"}`,
        variables: envData.variables.map((v) => ({
          ...v,
          id: `var_${Math.random().toString(36).substr(2, 9)}`,
        })),
      };

      window.electronAPI.logAction(`Importando ambiente: ${envData.name}`);

      set((state) => ({
        collection: {
          ...state.collection,
          environments: [...state.collection.environments, newEnv],
        },
      }));
      return newEnv.id;
    },

    importGlobals: (globalsData) => {
      if (!Array.isArray(globalsData)) return;

      const newGlobals = globalsData.map((v) => ({
        ...v,
        id: `global_${Math.random().toString(36).substr(2, 9)}`,
      }));

      window.electronAPI.logAction(
        `Importando variáveis globais: ${globalsData.length}`,
      );

      set((state) => ({
        globals: [...(state.globals || []), ...newGlobals],
      }));
    },

    getCollectionForExport: () => {
      const { collection } = get();
      return { ...collection };
    },
  };
};
