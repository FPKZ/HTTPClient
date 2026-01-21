/**
 * collectionUtils.js
 * Utilitários para manipulação de árvores de coleções (rotas e pastas).
 * Centraliza a lógica recursiva para manter o store limpo.
 */

/**
 * Normaliza recursivamente os itens de uma coleção importada.
 * Garante que cada item tenha ID e tipo corretos.
 */
export const normalizeItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const isFolder = item.type === "folder" || !!item.items || !!item.routes;
    const type = item.type || (isFolder ? "folder" : "route");
    const children = item.items || item.routes || [];

    if (item.id && item.type) {
      return {
        ...item,
        items: isFolder ? normalizeItems(children) : undefined,
      };
    }

    const normalizedItem = {
      id:
        item.id ||
        `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: item.name || "Sem Nome",
      type,
      ...(type === "route" && {
        request: item.request || { method: "GET", url: "" },
        response: item.response || null,
      }),
      ...(type === "folder" && {
        items: normalizeItems(children),
      }),
    };

    return normalizedItem;
  });
};

/**
 * Busca recursivamente uma pasta ou item pelo ID.
 */
export const findItemById = (items, id) => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.items) {
      const found = findItemById(item.items, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Retorna o caminho (índices) de um item na árvore.
 */
export const findItemPath = (items, id, path = []) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return [...path, i];
    if (items[i].items) {
      const res = findItemPath(items[i].items, id, [...path, i]);
      if (res) return res;
    }
  }
  return null;
};

/**
 * Adiciona um item a uma pasta específica na árvore.
 */
export const addItemToTree = (items, targetId, newItem) => {
  if (!targetId) return [...items, newItem];

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

/**
 * Remove recursivamente um item da árvore.
 */
export const removeItemFromTree = (items, targetId) => {
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

/**
 * Atualiza um item específico na árvore.
 */
export const updateItemInTree = (items, id, updates) => {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    if (item.type === "folder" && item.items) {
      return {
        ...item,
        items: updateItemInTree(item.items, id, updates),
      };
    }
    return item;
  });
};

/**
 * Coleta todos os IDs de rotas dentro de um item (útil para fechar abas ao deletar pasta).
 */
export const collectRouteIds = (item) => {
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

/**
 * Helper para pegar item pelo caminho de índices.
 */
export const getItemByPath = (items, path) => {
  let curr = items;
  for (let i = 0; i < path.length - 1; i++) {
    curr = curr[path[i]].items;
  }
  return curr[path[path.length - 1]];
};

/**
 * Helper para remover item pelo caminho.
 */
export const removeItemByPath = (items, path) => {
  const newItems = JSON.parse(JSON.stringify(items));
  let curr = newItems;
  for (let i = 0; i < path.length - 1; i++) {
    curr = curr[path[i]].items;
  }
  curr.splice(path[path.length - 1], 1);
  return newItems;
};

/**
 * Helper para inserir item pelo caminho.
 */
export const insertItemByPath = (items, path, item) => {
  const newItems = JSON.parse(JSON.stringify(items));
  let curr = newItems;
  for (let i = 0; i < path.length - 1; i++) {
    curr = curr[path[i]].items;
  }
  curr.splice(path[path.length - 1], 0, item);
  return newItems;
};

/**
 * Substitui ocorrências de {{variable}} por seus valores correspondentes nos ambientes.
 * Suporta strings, arrays e objetos aninhados.
 */
export const applyVariables = (data, environments = []) => {
  if (!data) return data;
  if (!Array.isArray(environments) || environments.length === 0) return data;

  // Cria um mapa de variáveis ativas para busca rápida
  const envMap = environments.reduce((acc, env) => {
    if (env.enabled && env.name) {
      acc[env.name] = env.value;
    }
    return acc;
  }, {});

  const regex = /\{\{(.+?)\}\}/g;

  const processString = (str) => {
    return str.replace(regex, (match, varName) => {
      const trimmedName = varName.trim();
      return envMap[trimmedName] !== undefined ? envMap[trimmedName] : match;
    });
  };

  const processAny = (val) => {
    if (typeof val === "string") {
      return processString(val);
    }
    if (Array.isArray(val)) {
      return val.map(processAny);
    }
    if (typeof val === "object" && val !== null) {
      const newObj = {};
      for (const [key, value] of Object.entries(val)) {
        newObj[key] = processAny(value);
      }
      return newObj;
    }
    return val;
  };

  return processAny(data);
};
