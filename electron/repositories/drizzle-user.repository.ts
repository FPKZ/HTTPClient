import { eq, inArray } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { IUserRepository } from "../interfaces/user-repository.interface";
import { User } from "../interfaces/user-service.interface";

export class DrizzleUserRepository implements IUserRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }

  async deleteProfile(id: string): Promise<boolean> {
    this.db.transaction((tx) => {
      // 1. Encontrar todos os workspaces do usuário (membro ou dono)
      const userWorkspaces = tx
        .select({ workspaceId: schema.workspaceMembers.workspaceId })
        .from(schema.workspaceMembers)
        .where(eq(schema.workspaceMembers.userId, id))
        .all();

      const wsIds = userWorkspaces.map((w) => w.workspaceId);

      if (wsIds.length > 0) {
        // 2. Buscar coleções associadas a esses workspaces
        const cols = tx
          .select({ id: schema.collections.id })
          .from(schema.collections)
          .where(inArray(schema.collections.workspaceId, wsIds))
          .all();

        const colIds = cols.map((c) => c.id);

        if (colIds.length > 0) {
          // Desconecta a referência de activeEnv nas coleções para evitar trava de Foreign Key
          tx.update(schema.collections).set({ activeEnv: null }).where(inArray(schema.collections.id, colIds)).run();

          // Deleta ambientes, requests e folders associados a essas coleções
          tx.delete(schema.environments).where(inArray(schema.environments.collectionsId, colIds)).run();
          tx.delete(schema.requests).where(inArray(schema.requests.collectionId, colIds)).run();
          tx.delete(schema.folders).where(inArray(schema.folders.collectionId, colIds)).run();
          // Deleta as coleções
          tx.delete(schema.collections).where(inArray(schema.collections.id, colIds)).run();
        }

        // 3. Deleta membros dos workspaces
        tx.delete(schema.workspaceMembers).where(inArray(schema.workspaceMembers.workspaceId, wsIds)).run();

        // 4. Deleta os workspaces
        tx.delete(schema.workspaces).where(inArray(schema.workspaces.id, wsIds)).run();
      }

      // 5. Deleta o perfil do usuário
      tx.delete(schema.profiles).where(eq(schema.profiles.id, id)).run();
    });
    return true;
  }

  async updateProfile(id: string, updates: Partial<User>): Promise<boolean> {
    await this.db
      .update(schema.profiles)
      .set(updates)
      .where(eq(schema.profiles.id, id))
      .run();
    return true;
  }

  async upsertProfile(user: User): Promise<boolean> {
    await this.db
      .insert(schema.profiles)
      .values(user)
      .onConflictDoUpdate({
        target: schema.profiles.id,
        set: user,
      })
      .run();
    return true;
  }
}
