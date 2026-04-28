import type { InferInsertModel } from 'drizzle-orm';
import { folders, requests } from '../db/schema';

type NewFolder = InferInsertModel<typeof folders>;
type NewRequest = InferInsertModel<typeof requests>;

/**
 * Utilitário para converter entre a estrutura de árvore (Zustand/JSON)
 * e a estrutura plana (Relacional/Drizzle).
 */
export const TreeParser = {
  /**
   * "Achata" uma coleção aninhada em listas planas para o banco de dados.
   */
  flatten(collectionId: string, items: any[], parentId: string | null = null) {
    const flattenedFolders: NewFolder[] = [];
    const flattenedRequests: NewRequest[] = [];

    items.forEach((item, index) => {
      if (item.type === 'folder') {
        flattenedFolders.push({
          id: item.id,
          name: item.name,
          collectionId: collectionId,
          parentId: parentId,
          orderIndex: index,
          description: item.description || '',
        });

        if (item.items && Array.isArray(item.items)) {
          const { folders: subFolders, requests: subRequests } = this.flatten(
            collectionId,
            item.items,
            item.id
          );
          flattenedFolders.push(...subFolders);
          flattenedRequests.push(...subRequests);
        }
      } else if (item.type === 'route') {
        flattenedRequests.push({
          id: item.id,
          collectionId: collectionId,
          folderId: parentId,
          name: item.name,
          method: item.request?.method || 'GET',
          url: item.request?.url || '',
          params: item.request?.params || [],
          headers: item.request?.headers || [],
          body: item.request?.body || { mode: 'none', content: '' },
          auth: item.request?.auth || { name: 'none', config: {} },
          isDirty: true,
        });
      }
    });

    return { folders: flattenedFolders, requests: flattenedRequests };
  },

  /**
   * Reconstrói a estrutura de árvore a partir dos dados planos do banco.
   */
  unflatten(folders: any[], requests: any[]) {
    const itemsMap = new Map<string, any>();
    const rootItems: any[] = [];

    // 1. Cria os nós de folders no mapa
    folders.forEach((f) => {
      itemsMap.set(f.id, {
        id: f.id,
        type: 'folder',
        name: f.name,
        description: f.description,
        items: [],
      });
    });

    // 2. Adiciona as requisições aos folders ou à raiz
    requests.forEach((r) => {
      const routeNode = {
        id: r.id,
        type: 'route',
        name: r.name,
        request: {
          method: r.method,
          url: r.url,
          params: r.params || [],
          headers: r.headers || [],
          body: r.body || { mode: 'none', content: '' },
          auth: r.auth || { name: 'none', config: {} },
        },
        isDirty: r.isDirty,
      };

      if (r.folderId && itemsMap.has(r.folderId)) {
        itemsMap.get(r.folderId).items.push(routeNode);
      } else {
        rootItems.push(routeNode);
      }
    });

    // 3. Organiza a hierarquia de folders
    folders.forEach((f) => {
      const folderNode = itemsMap.get(f.id);
      if (f.parentId && itemsMap.has(f.parentId)) {
        itemsMap.get(f.parentId).items.push(folderNode);
      } else {
        rootItems.push(folderNode);
      }
    });

    return rootItems;
  },
};
