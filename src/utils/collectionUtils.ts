import { translate } from "./translate";
import { RouteData, FolderData } from "../../types";

export { translate };

export type CollectionItem = RouteData | FolderData;

/**
 * Retorna a cor correspondente ao método HTTP.
 */
export const getMethodColor = (method?: string): string => {
  const colors: Record<string, string> = {
    GET: "text-green-400",
    POST: "text-yellow-400",
    PUT: "text-blue-400",
    DELETE: "text-red-400",
    PATCH: "text-purple-400",
  };
  return colors[(method || "").toUpperCase()] || "text-gray-400";
};

/**
 * Normaliza recursivamente os itens de uma coleção importada.
 */
export const normalizeItems = (items: any[]): CollectionItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const isFolder = item.type === "folder" || !!item.items || !!item.routes;
    const type = item.type || (isFolder ? "folder" : "route");
    const children = item.items || item.routes || [];

    if (item.id && item.type) {
      return {
        ...item,
        items: isFolder ? normalizeItems(children) : undefined,
      } as CollectionItem;
    }

    const normalizedItem: any = {
      id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    return normalizedItem as CollectionItem;
  });
};

/**
 * Busca recursivamente uma pasta ou item pelo ID.
 */
export const findItemById = (items: CollectionItem[], id: string): CollectionItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    const folder = item as FolderData;
    if (folder.items) {
      const found = findItemById(folder.items, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Retorna o caminho (índices) de um item na árvore.
 */
export const findItemPath = (items: CollectionItem[], id: string, path: number[] = []): number[] | null => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return [...path, i];
    const folder = items[i] as FolderData;
    if (folder.items) {
      const res = findItemPath(folder.items, id, [...path, i]);
      if (res) return res;
    }
  }
  return null;
};

/**
 * Adiciona um item a uma pasta específica na árvore.
 */
export const addItemToTree = (items: CollectionItem[], targetId: string | null, newItem: CollectionItem, shouldLog = true): CollectionItem[] => {
  if (!targetId) {
    if (shouldLog) {
      window.electronAPI.logAction(
        `Adicionando ${translate(newItem.type)} na raiz, com nome: ${newItem.name}`,
      );
    }
    return [...items, newItem];
  }

  return items.map((item) => {
    if (item.id === targetId && item.type === "folder") {
      if (shouldLog) {
        window.electronAPI.logAction(
          `Adicionando ${translate(newItem.type)} a ${translate(item.type)}: ${item.name}, com nome: ${newItem.name}`,
        );
      }
      const folder = item as FolderData;
      return {
        ...folder,
        items: [...(folder.items || []), newItem],
      };
    }
    const folder = item as FolderData;
    if (folder.type === "folder" && folder.items) {
      return {
        ...folder,
        items: addItemToTree(folder.items, targetId, newItem, shouldLog),
      };
    }
    return item;
  });
};

/**
 * Remove recursivamente um item da árvore.
 */
export const removeItemFromTree = (items: CollectionItem[], targetId: string, parentName = "Raiz"): CollectionItem[] => {
  return items
    .filter((item) => {
      if (item.id === targetId) {
        window.electronAPI.logAction(
          `Removendo ${translate(item.type)}: ${item.name}, da ${translate(parentName)}: ${parentName}`,
        );
        return false;
      }
      return true;
    })
    .map((item) => {
      const folder = item as FolderData;
      if (folder.type === "folder" && folder.items) {
        return {
          ...folder,
          items: removeItemFromTree(folder.items, targetId, folder.name),
        };
      }
      return item;
    });
};

/**
 * Atualiza um item específico na árvore.
 */
export const updateItemInTree = (items: CollectionItem[], id: string, updates: Partial<CollectionItem>): CollectionItem[] => {
  return items.map((item) => {
    if (item.id === id) {
      if (updates.name) {
        window.electronAPI.logAction(
          `Alterando o nome da ${translate(item.type)}: ${item.name}, para: ${updates.name}`,
        );
      }
      return { ...item, ...updates } as CollectionItem;
    }
    const folder = item as FolderData;
    if (folder.type === "folder" && folder.items) {
      return {
        ...folder,
        items: updateItemInTree(folder.items, id, updates),
      };
    }
    return item;
  });
};

/**
 * Coleta todos os IDs de rotas dentro de um item.
 */
export const collectRouteIds = (item: CollectionItem): string[] => {
  let ids: string[] = [];
  if (item.type === "route") {
    ids.push(item.id);
  } else {
    const folder = item as FolderData;
    if (folder.items) {
      folder.items.forEach((child) => {
        ids = [...ids, ...collectRouteIds(child)];
      });
    }
  }
  return ids;
};

/**
 * Helper para pegar item pelo caminho de índices.
 */
export const getItemByPath = (items: CollectionItem[], path: number[]): CollectionItem => {
  let curr: any = items;
  for (let i = 0; i < path.length - 1; i++) {
    curr = curr[path[i]].items;
  }
  return curr[path[path.length - 1]];
};

/**
 * Helper para remover item pelo caminho.
 */
export const removeItemByPath = (items: CollectionItem[], path: number[]): CollectionItem[] => {
  const newItems: CollectionItem[] = JSON.parse(JSON.stringify(items));
  let curr: any = newItems;
  for (let i = 0; i < path.length - 1; i++) {
    curr = curr[path[i]].items;
  }
  curr.splice(path[path.length - 1], 1);
  return newItems;
};

/**
 * Helper para inserir item pelo caminho.
 */
export const insertItemByPath = (items: CollectionItem[], path: number[], item: CollectionItem): CollectionItem[] => {
  const newItems: CollectionItem[] = JSON.parse(JSON.stringify(items));
  let curr: any = newItems;
  for (let i = 0; i < path.length - 1; i++) {
    curr = curr[path[i]].items;
  }
  curr.splice(path[path.length - 1], 0, item);
  return newItems;
};

/**
 * Substitui ocorrências de {{variable}} por seus valores correspondentes.
 */
export const applyVariables = (data: any, variables: any[] = []): any => {
  if (!data) return data;
  if (!Array.isArray(variables) || variables.length === 0) return data;

  const envMap = variables.reduce((acc: any, v) => {
    const key = v.key || v.name;
    const value =
      v.currentValue !== undefined && v.currentValue !== null && v.currentValue !== ""
        ? v.currentValue
        : v.initialValue !== undefined
          ? v.initialValue
          : v.value;

    if (v.enabled && key) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const regex = /\{\{(.+?)\}\}/g;

  const processString = (str: string): string => {
    return str.replace(regex, (match, varName) => {
      const trimmedName = varName.trim();
      return envMap[trimmedName] !== undefined ? envMap[trimmedName] : match;
    });
  };

  const processAny = (val: any): any => {
    if (typeof val === "string") {
      return processString(val);
    }
    if (Array.isArray(val)) {
      return val.map(processAny);
    }
    if (typeof val === "object" && val !== null) {
      const newObj: any = {};
      for (const [key, value] of Object.entries(val)) {
        newObj[key] = processAny(value);
      }
      return newObj;
    }
    return val;
  };

  return processAny(data);
};

/**
 * Helper para converter lista [{key, value, enabled, type}] em objeto {key: value}
 */
export const listToObj = (list: any[]): Record<string, any> => {
  if (!Array.isArray(list)) return {};
  return list.reduce((acc, curr) => {
    if (curr.enabled && curr.key) {
      if (curr.type === "file") {
        acc[curr.key] = { src: curr.value, type: "file" };
      } else {
        acc[curr.key] = curr.value;
      }
    }
    return acc;
  }, {});
};

/**
 * Constrói o objeto de requisição final.
 */
export const buildFinalRequest = (
  requestOrigin: any,
  variables: any[] = [],
  options = { useValues: true },
): any => {
  const activeVars = options.useValues ? variables : [];
  const requestData = applyVariables(requestOrigin, activeVars);

  const headers = listToObj(requestData.headers);
  const queryParams = listToObj(requestData.params);
  const queryString = new URLSearchParams(queryParams).toString();
  const finalUrl = queryString
    ? `${requestData.url}${requestData.url.includes("?") ? "&" : "?"}${queryString}`
    : requestData.url;

  let authBodyInjection: any = {};
  if (
    requestData.auth &&
    requestData.auth.name &&
    requestData.auth.name !== "none"
  ) {
    const { key, value, type } = requestData.auth.config || {};
    const fieldName = requestData.auth.name;

    if (fieldName && key) {
      const authString = type ? `${type} ${key}` : key;
      if (value === "header") {
        headers[fieldName] = authString;
      } else if (value === "body") {
        authBodyInjection[fieldName] = authString;
      }
    }
  }

  let bodyToExecute = null;
  const mode = requestData.body?.mode || "none";

  if (mode === "inputs" || mode === "formdata" || mode === "urlencoded") {
    bodyToExecute = {
      ...listToObj(requestData.body.content),
      ...authBodyInjection,
    };
  } else if (mode === "json") {
    try {
      const content =
        typeof requestData.body.content === "string"
          ? requestData.body.content
          : JSON.stringify(requestData.body.content);

      if (!content || !content.trim()) {
        bodyToExecute = {};
      } else {
        const parsed = JSON.parse(content);
        bodyToExecute = { ...parsed, ...authBodyInjection };
      }
    } catch {
      bodyToExecute = requestData.body.content;
    }
  } else if (mode === "binary") {
    bodyToExecute = requestData.body.content;
  } else if (Object.keys(authBodyInjection).length > 0) {
    bodyToExecute = authBodyInjection;
  }

  return {
    method: requestData.method,
    url: finalUrl,
    headers,
    body: mode === "stream" ? null : bodyToExecute,
    bodyMode: mode,
    auth: requestData.auth,
    timeout: requestData.timeout,
    streamPath: mode === "stream" ? requestData.body.content : null,
  };
};

/**
 * Regera recursivamente os IDs de um item e seus filhos.
 */
export const regenerateIds = (item: CollectionItem): CollectionItem => {
  const newItem = { ...item } as any;

  if (newItem.type === "folder" || newItem.items) {
    newItem.id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    if (newItem.items) {
      newItem.items = newItem.items.map((child: CollectionItem) => regenerateIds(child));
    }
  } else {
    newItem.id = `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  return newItem as CollectionItem;
};
