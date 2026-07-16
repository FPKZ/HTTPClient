import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { IEnvironmentRepository } from "../interfaces/environment-repository.interface";

export class DrizzleEnvironmentRepository implements IEnvironmentRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }

  async create(collectionId: string, name: string): Promise<any> {
    const id = `env_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    try {
      await this.db.insert(schema.environments).values({
        id,
        name: name || "Novo Ambiente",
        collectionsId: collectionId,
        variables: JSON.stringify([]),
      } as any).run();

      return {
        id,
        name: name || "Novo Ambiente",
        collectionsId: collectionId,
        variables: [],
      };
    } catch (error) {
      console.error("[DrizzleEnvironmentRepository] Erro ao criar ambiente no SQLite:", error);
      throw error;
    }
  }

  async update(id: string, updates: { name?: string; variables?: any[] }): Promise<boolean> {
    try {
      const dataToSet: any = {
        updatedAt: new Date().toISOString(),
      };

      if (updates.name !== undefined) {
        dataToSet.name = updates.name;
      }

      if (updates.variables !== undefined) {
        dataToSet.variables = JSON.stringify(updates.variables || []);
      }

      await this.db.update(schema.environments)
        .set(dataToSet)
        .where(eq(schema.environments.id, id))
        .run();

      return true;
    } catch (error) {
      console.error("[DrizzleEnvironmentRepository] Erro ao atualizar ambiente no SQLite:", error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.delete(schema.environments)
        .where(eq(schema.environments.id, id))
        .run();
      return true;
    } catch (error) {
      console.error("[DrizzleEnvironmentRepository] Erro ao deletar ambiente no SQLite:", error);
      return false;
    }
  }

  async getByCollectionId(collectionId: string): Promise<any[]> {
    try {
      const envs = await this.db.query.environments.findMany({
        where: eq(schema.environments.collectionsId, collectionId),
      });

      return envs.map((e) => ({
        ...e,
        variables: typeof e.variables === "string" ? JSON.parse(e.variables) : (e.variables || []),
      }));
    } catch (error) {
      console.error("[DrizzleEnvironmentRepository] Erro ao obter ambientes por collectionId:", error);
      return [];
    }
  }
}
