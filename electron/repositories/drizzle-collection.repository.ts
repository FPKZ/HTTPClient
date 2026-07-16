import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { ICollectionRepository } from "../interfaces/collection-repository.interface";

export class DrizzleCollectionRepository implements ICollectionRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }

  async createFolder(collectionId: string, parentId: string | null, name: string): Promise<any> {
    const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
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
  }

  async renameFolder(id: string, name: string): Promise<boolean> {
    await this.db.update(schema.folders)
      .set({
        name,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.folders.id, id))
      .run();
    return true;
  }

  async renameRequest(id: string, name: string): Promise<boolean> {
    await this.db.update(schema.requests)
      .set({
        name,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.requests.id, id))
      .run();
    return true;
  }

  async deleteFolder(id: string): Promise<boolean> {
    await this.db.delete(schema.folders)
      .where(eq(schema.folders.id, id))
      .run();
    return true;
  }

  async createRequest(collectionId: string, folderId: string | null, name: string, protocol: string): Promise<any> {
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
  }

  async findRequestById(id: string): Promise<any> {
    return this.db.query.requests.findFirst({
      where: eq(schema.requests.id, id),
    });
  }

  async insertRequest(requestData: any): Promise<boolean> {
    await this.db.insert(schema.requests).values(requestData).run();
    return true;
  }

  async deleteRequest(id: string): Promise<boolean> {
    await this.db.delete(schema.requests)
      .where(eq(schema.requests.id, id))
      .run();
    return true;
  }

  async updateFolderParentAndOrder(id: string, parentId: string | null, orderIndex: number): Promise<boolean> {
    await this.db.update(schema.folders)
      .set({
        parentId: parentId || null,
        orderIndex,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.folders.id, id))
      .run();
    return true;
  }

  async updateRequestParentAndOrder(id: string, folderId: string | null, orderIndex: number): Promise<boolean> {
    await this.db.update(schema.requests)
      .set({
        folderId: folderId || null,
        orderIndex,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.requests.id, id))
      .run();
    return true;
  }
}
