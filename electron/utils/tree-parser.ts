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
          // Convertemos objetos para string para o SQLite
          params: JSON.stringify(item.request?.params || []),
          headers: JSON.stringify(item.request?.headers || []),
          body: JSON.stringify(item.request?.body || { mode: 'none', content: '' }),
          auth: JSON.stringify(item.request?.auth || { name: 'none', config: {} }),
          orderIndex: index,
          isDirty: true,
        } as any); // Usamos any aqui para o Drizzle aceitar a string no lugar do objeto tipado
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
      // Função auxiliar para parse seguro
      const safeParse = (data: any, fallback: any) => {
        if (typeof data !== 'string') return data || fallback;
        try { return JSON.parse(data); } catch (e) { return fallback; }
      };

      const routeNode = {
        id: r.id,
        type: 'route',
        name: r.name,
        orderIndex: r.orderIndex, // Mantemos para ordenar
        request: {
          method: r.method,
          url: r.url,
          params: safeParse(r.params, []),
          headers: safeParse(r.headers, []),
          body: safeParse(r.body, { mode: 'none', content: '' }),
          auth: safeParse(r.auth, { name: 'none', config: {} }),
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
      // Adicionamos o orderIndex ao nó para ordenação
      folderNode.orderIndex = f.orderIndex;

      if (f.parentId && itemsMap.has(f.parentId)) {
        itemsMap.get(f.parentId).items.push(folderNode);
      } else {
        rootItems.push(folderNode);
      }
    });

    // 4. Ordenação final por orderIndex
    const sorter = (a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0);

    // Ordena itens da raiz
    rootItems.sort(sorter);

    // Ordena itens dentro de cada pasta
    itemsMap.forEach((folder) => {
      if (folder.items) {
        folder.items.sort(sorter);
      }
    });

    // Removemos o orderIndex dos objetos finais para limpar o JSON se desejar, 
    // mas o Zustand geralmente não se importa.
    
    return rootItems;
  },
};
