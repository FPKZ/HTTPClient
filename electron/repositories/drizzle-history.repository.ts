import { eq, and, notInArray, desc } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { IHistoryRepository } from "../interfaces/history-repository.interface";

export class DrizzleHistoryRepository implements IHistoryRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }

  async getCollectionsResumed(): Promise<any[]> {
    return this.db.query.collections.findMany({
      orderBy: [desc(schema.collections.updatedAt)],
      limit: 15,
    });
  }

  async getCollectionBase(id: string): Promise<any> {
    return this.db.query.collections.findFirst({
      where: eq(schema.collections.id, id),
    });
  }

  async getCollectionHierarchy(id: string): Promise<{ folders: any[]; requests: any[] }> {
    const [folders, requests] = await Promise.all([
      this.db.select().from(schema.folders).where(eq(schema.folders.collectionId, id)),
      this.db.select({
        id: schema.requests.id,
        name: schema.requests.name,
        collectionId: schema.requests.collectionId,
        folderId: schema.requests.folderId,
        method: schema.requests.method,
        url: schema.requests.url,
        params: schema.requests.params,
        headers: schema.requests.headers,
        body: schema.requests.body,
        auth: schema.requests.auth,
        orderIndex: schema.requests.orderIndex,
        isDirty: schema.requests.isDirty,
        createdAt: schema.requests.createdAt,
        updatedAt: schema.requests.updatedAt,
      })
      .from(schema.requests)
      .where(eq(schema.requests.collectionId, id))
    ]);

    return { folders, requests };
  }

  async getCollectionEnvironments(id: string): Promise<any[]> {
    return this.db.query.environments.findMany({
      where: eq(schema.environments.collectionsId, id),
    });
  }

  async saveCollectionTransaction(params: {
    collectionId: string;
    name: string;
    workspaceId: string | null;
    activeEnvironmentId: string | null;
    flatFolders: any[];
    flatRequests: any[];
    environments: any[];
  }): Promise<boolean> {
    const {
      collectionId,
      name,
      workspaceId,
      activeEnvironmentId,
      flatFolders,
      flatRequests,
      environments,
    } = params;

    await this.db.transaction((tx) => {
      // 1. Upsert Coleção
      tx.insert(schema.collections)
        .values({
          id: collectionId,
          name: name,
          workspaceId: workspaceId || null,
          storageType: 'local',
          activeEnv: activeEnvironmentId || null,
        })
        .onConflictDoUpdate({
          target: schema.collections.id,
          set: { 
            name, 
            activeEnv: activeEnvironmentId || null, 
            updatedAt: new Date().toISOString() 
          }
        }).run();

      // 2. Gerenciar Pastas (Upsert + Delete órfãos)
      const folderIds = flatFolders.map(f => f.id);
      if (folderIds.length > 0) {
        tx.delete(schema.folders)
          .where(and(
            eq(schema.folders.collectionId, collectionId),
            notInArray(schema.folders.id, folderIds)
          )).run();
      } else {
        tx.delete(schema.folders).where(eq(schema.folders.collectionId, collectionId)).run();
      }

      for (const folder of flatFolders) {
        tx.insert(schema.folders)
          .values(folder)
          .onConflictDoUpdate({ target: schema.folders.id, set: folder }).run();
      }

      // 3. Gerenciar Requests (Upsert + Delete órfãos)
      const requestIds = flatRequests.map(r => r.id);
      if (requestIds.length > 0) {
        tx.delete(schema.requests)
          .where(and(
            eq(schema.requests.collectionId, collectionId),
            notInArray(schema.requests.id, requestIds)
          )).run();
      } else {
        tx.delete(schema.requests).where(eq(schema.requests.collectionId, collectionId)).run();
      }

      for (const req of flatRequests) {
        tx.insert(schema.requests)
          .values(req)
          .onConflictDoUpdate({
            target: schema.requests.id,
            set: {
              name: req.name,
              method: req.method,
              folderId: req.folderId,
              orderIndex: req.orderIndex,
              updatedAt: new Date().toISOString()
            }
          }).run();
      }

      // 4. Ambientes
      if (environments && Array.isArray(environments)) {
        tx.delete(schema.environments).where(eq(schema.environments.collectionsId, collectionId)).run();
        for (const env of environments) {
          tx.insert(schema.environments).values({
            id: env.id,
            name: env.name,
            collectionsId: collectionId,
            variables: JSON.stringify(env.variables || [])
          } as any).run();
        }
      }
    });

    return true;
  }

  async deleteCollection(id: string): Promise<boolean> {
    await this.db.transaction((tx) => {
      tx.delete(schema.collections).where(eq(schema.collections.id, id)).run();
    });
    return true;
  }

  async deleteAllCollections(): Promise<boolean> {
    await this.db.delete(schema.collections).run();
    return true;
  }

  async findRequestById(id: string): Promise<any> {
    return this.db.query.requests.findFirst({
      where: eq(schema.requests.id, id),
    });
  }

  async updateRequestDetails(id: string, updateData: any): Promise<boolean> {
    await this.db.update(schema.requests)
      .set(updateData)
      .where(eq(schema.requests.id, id))
      .run();
    return true;
  }
}
