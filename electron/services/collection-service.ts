import { eq, and } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { ICollectionService } from "../interfaces/collection-service.interface";

export class CollectionService implements ICollectionService {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }

  async createFolder(collectionId: string, parentId: string | null, name: string): Promise<any> {
    const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    try {
      await this.db.insert(schema.folders).values({
        id,
        collectionId,
        parentId: parentId || null,
        name: name || "Nova Pasta",
        orderIndex: 0,
        description: "",
      }).run();

      return {
        id,
        type: "folder",
        name: name || "Nova Pasta",
        items: [],
        description: "",
        parentId: parentId || null,
        collectionId,
      };
    } catch (error) {
      console.error("[CollectionService] Erro ao criar pasta no SQLite:", error);
      throw error;
    }
  }

  async renameItem(id: string, type: "folder" | "route", name: string): Promise<boolean> {
    try {
      if (type === "folder") {
        await this.db.update(schema.folders)
          .set({
            name,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.folders.id, id))
          .run();
      } else {
        await this.db.update(schema.requests)
          .set({
            name,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.requests.id, id))
          .run();
      }
      return true;
    } catch (error) {
      console.error("[CollectionService] Erro ao renomear item no SQLite:", error);
      return false;
    }
  }

  async deleteFolder(id: string): Promise<boolean> {
    try {
      await this.db.delete(schema.folders)
        .where(eq(schema.folders.id, id))
        .run();
      return true;
    } catch (error) {
      console.error("[CollectionService] Erro ao deletar pasta no SQLite:", error);
      return false;
    }
  }

  async createRequest(collectionId: string, folderId: string | null, name: string, protocol?: string): Promise<any> {
    const id = `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const finalProtocol = protocol || "http";
    const method = finalProtocol === "websocket" ? "WS" : "GET";
    
    const initialRequest = {
      method,
      url: "",
      headers: finalProtocol === "websocket" 
        ? [] 
        : [{ key: "Content-Type", value: "application/json", enabled: true }],
      params: [],
      body: { mode: finalProtocol === "websocket" ? "none" : "json", content: "" },
      auth: {
        name: "none",
        config: { key: "", type: "Bearer", value: "header" },
      },
    };

    try {
      await this.db.insert(schema.requests).values({
        id,
        collectionId,
        folderId: folderId || null,
        name: name || "Nova Rota",
        protocol: finalProtocol,
        method,
        url: "",
        params: JSON.stringify(initialRequest.params),
        headers: JSON.stringify(initialRequest.headers),
        body: JSON.stringify(initialRequest.body),
        auth: JSON.stringify(initialRequest.auth),
        orderIndex: 0,
        isDirty: false,
      } as any).run();

      return {
        id,
        type: "route",
        name: name || "Nova Rota",
        protocol: finalProtocol,
        method,
        folderId: folderId || null,
        collectionId,
      };
    } catch (error) {
      console.error("[CollectionService] Erro ao criar request no SQLite:", error);
      throw error;
    }
  }

  async duplicateRequest(id: string, newId: string, name: string): Promise<any> {
    try {
      const source = await this.db.query.requests.findFirst({
        where: eq(schema.requests.id, id),
      });

      if (!source) {
        throw new Error(`Request de origem ${id} não encontrada.`);
      }

      await this.db.insert(schema.requests).values({
        id: newId,
        collectionId: source.collectionId,
        folderId: source.folderId,
        name: name || `${source.name} (Cópia)`,
        method: source.method,
        url: source.url,
        params: typeof source.params === "string" ? source.params : JSON.stringify(source.params || []),
        headers: typeof source.headers === "string" ? source.headers : JSON.stringify(source.headers || []),
        body: typeof source.body === "string" ? source.body : JSON.stringify(source.body || { mode: "none", content: "" }),
        auth: typeof source.auth === "string" ? source.auth : JSON.stringify(source.auth || { name: "none", config: {} }),
        orderIndex: source.orderIndex + 1,
        isDirty: source.isDirty,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any).run();

      return {
        id: newId,
        type: "route",
        name: name || `${source.name} (Cópia)`,
        method: source.method,
        folderId: source.folderId || null,
        collectionId: source.collectionId,
      };
    } catch (error) {
      console.error("[CollectionService] Erro ao duplicar request no SQLite:", error);
      throw error;
    }
  }

  async deleteRequest(id: string): Promise<boolean> {
    try {
      await this.db.delete(schema.requests)
        .where(eq(schema.requests.id, id))
        .run();
      return true;
    } catch (error) {
      console.error("[CollectionService] Erro ao deletar request no SQLite:", error);
      return false;
    }
  }

  async moveOrReorderItem(
    id: string,
    type: "folder" | "route",
    targetFolderId: string | null,
    orderIndex: number
  ): Promise<boolean> {
    try {
      if (type === "folder") {
        await this.db.update(schema.folders)
          .set({
            parentId: targetFolderId || null,
            orderIndex,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.folders.id, id))
          .run();
      } else {
        await this.db.update(schema.requests)
          .set({
            folderId: targetFolderId || null,
            orderIndex,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.requests.id, id))
          .run();
      }
      return true;
    } catch (error) {
      console.error("[CollectionService] Erro ao mover/reordenar item no SQLite:", error);
      return false;
    }
  }
}
