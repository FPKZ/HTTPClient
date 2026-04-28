import { InferInsertModel, InferModelFromColumns } from "drizzle-orm";
import type { folders, Folders } from "../db/schema/folders.schema.ts";
import type { requests, Requests } from "../db/schema/requests.schema.ts";

type NewFolder = InferInsertModel<typeof folders>;
type NewRequest = InferInsertModel<typeof requests>;


/**
 * 
 * @param collectionId 
 * @param items 
 * @param parentId 
 * @returns 
 */
export function ParserDBItens(
    collectionId: string,
    items: any[],
    parentId: string,
) {
    const foldersInsert: NewFolder[] = [];
    const requestsInsert: NewRequest[] = [];

    items.forEach((item, index) => {
        if (item.type === "folder") {
            foldersInsert.push({
                id: item.id,
                name: item.name,
                collectionId,
                description: item?.description,
                orderIndex: index,
                parentId,
            });

            if (item.items && item.items.length > 0) {
                const nested = ParserDBItens(collectionId, item.items, item.id);
                foldersInsert.push(...nested.foldersInsert);
                requestsInsert.push(...nested.requestsInsert);
            }
        } else if (item.type === "route") {
            requestsInsert.push({
                id: item.id,
                name: item.name,
                collectionId,
                method: item.method,
                url: item.url,
                params: item.params,
                headers: item.headers,
                body: item.body,
                auth: item.auth,
                folderId: parentId,
                isDirty: item.isDirty || false,
            });
        }
    })

    return { foldersInsert, requestsInsert };
}


/**
 * 
 * @param folders 
 * @param requests 
 * @returns 
 */
export function buildTreeFromRelational(
  folders: Folders[], 
  requests: Requests[]
) {
    const itemsMap = new Map();
    const rootItems: any[] = [];

    // 1. Inicia os folders no mapa
    folders.forEach(f => {
        itemsMap.set(f.id, {
        id: f.id,
        type: 'folder',
        name: f.name,
        items: [],
        // se tiver description etc, coloque aqui
        });
    });

    // 2. Coloca os requests dentro dos folders (ou na raiz)
    requests.forEach(r => {
        const routeNode = {
        id: r.id,
        type: 'route',
        name: r.name,
        request: {
            method: r.method,
            url: r.url,
            headers: r.headers || [],
            params: r.params || [],
            body: r.body || { mode: 'none', content: '' },
            auth: r.auth || { name: 'none', config: {} },
        },
        isDirty: r.isDirty
        };
        if (r.folderId && itemsMap.has(r.folderId)) {
        itemsMap.get(r.folderId).items.push(routeNode);
        } else {
        rootItems.push(routeNode);
        }
    });

    // 3. Coloca os folders dentro de seus pais (ou na raiz)
    folders.forEach(f => {
        const folderNode = itemsMap.get(f.id);
        if (f.parentId && itemsMap.has(f.parentId)) {
        itemsMap.get(f.parentId).items.push(folderNode);
        } else {
        rootItems.push(folderNode);
        }
    });

    return rootItems;
}