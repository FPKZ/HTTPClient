import { eq, and, notInArray, desc } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { TreeParser } from "../utils/tree-parser";
import UserService from "./user-service";

/**
 * HistoryService
 * Orquestra a persistência do histórico e coleções usando Drizzle ORM.
 * Segue princípios SOLID, desacoplando a lógica de mapeamento (TreeParser)
 * e utilizando Injeção de Dependência para o banco de dados.
 */

export class HistoryService {
  private db: BetterSQLite3Database<typeof schema>;
  private userService: UserService;

  constructor(db: BetterSQLite3Database<typeof schema>, userService: UserService) {
    this.db = db;
    this.userService = userService;
  }

  /**
   * Retorna a lista resumida de coleções para o histórico da barra lateral.
   */
  async getHistory() {
    try {
      const currentUser = this.userService?.getUser();
      const ownerId = currentUser ? currentUser.id : null;

      // Busca as coleções (atualmente o ownerId está em workspaces ou profiles, 
      // mas na tabela collections atual não temos owner_id direto, usamos o workspace)
      // Nota: Se a coleção for "solta", ela não tem ownerId direto no schema atual,
      // a menos que adicionemos. No schema atual collections.workspaceId é opcional.
      
      const results = await this.db.query.collections.findMany({
        orderBy: [desc(schema.collections.updatedAt)],
        limit: 15,
        // Adicione filtros aqui se necessário
      });

      return results.map(col => ({
        id: col.id,
        name: col.name,
        updatedAt: col.updatedAt,
        sourceType: "native",
        file: `${col.id}.json`, // Compatibilidade com UI antiga
      }));
    } catch (error) {
      console.error("[HistoryService] Erro ao obter histórico:", error);
      return [];
    }
  }

  /**
   * Busca uma coleção completa e reconstrói sua árvore.
   */
  async getCollectionById(id: string) {
    try {
      const collection = await this.db.query.collections.findFirst({
        where: eq(schema.collections.id, id),
        with: {
          requests: true,
          // folders: true // Precisamos garantir que relations estão no schema
        }
      });

      if (!collection) return null;

      // Como o Drizzle relational query pode ser limitado para recursividade infinita,
      // buscamos todos os folders e requests daquela coleção de forma plana.
      const [allFolders, allRequests] = await Promise.all([
        this.db.select().from(schema.folders).where(eq(schema.folders.collectionId, id)),
        this.db.select().from(schema.requests).where(eq(schema.requests.collectionId, id))
      ]);

      const items = TreeParser.unflatten(allFolders, allRequests);

      // Busca ambientes
      const envs = await this.db.query.environments.findMany({
        where: eq(schema.environments.collectionsId, id)
      });

      return {
        ...collection,
        items,
        environments: envs
      };
    } catch (error) {
      console.error("[HistoryService] Erro ao buscar coleção:", error);
      return null;
    }
  }

  /**
   * Salva uma coleção inteira desconstruindo-a em tabelas relacionais.
   */
  async saveHistory(collectionData: any) {
    const { id, name, items, environments, workspaceId } = collectionData;
    const collectionId = id;

    // 1. Achata a árvore
    const { folders: flatFolders, requests: flatRequests } = TreeParser.flatten(collectionId, items);

    try {
      await this.db.transaction(async (tx) => {
        // 2. Upsert Coleção
        await tx.insert(schema.collections)
          .values({
            id: collectionId,
            name: name,
            workspaceId: workspaceId || null,
            storageType: 'local',
          })
          .onConflictDoUpdate({
            target: schema.collections.id,
            set: { name, updatedAt: new Date().toISOString() }
          });

        // 3. Gerenciar Pastas (Upsert + Delete órfãos)
        const folderIds = flatFolders.map(f => f.id);
        if (folderIds.length > 0) {
          await tx.delete(schema.folders)
            .where(and(
              eq(schema.folders.collectionId, collectionId),
              notInArray(schema.folders.id, folderIds)
            ));
        } else {
          await tx.delete(schema.folders).where(eq(schema.folders.collectionId, collectionId));
        }

        for (const folder of flatFolders) {
          await tx.insert(schema.folders)
            .values(folder)
            .onConflictDoUpdate({ target: schema.folders.id, set: folder });
        }

        // 4. Gerenciar Requests (Upsert + Delete órfãos)
        const requestIds = flatRequests.map(r => r.id);
        if (requestIds.length > 0) {
          await tx.delete(schema.requests)
            .where(and(
              eq(schema.requests.collectionId, collectionId),
              notInArray(schema.requests.id, requestIds)
            ));
        } else {
          await tx.delete(schema.requests).where(eq(schema.requests.collectionId, collectionId));
        }

        for (const req of flatRequests) {
          await tx.insert(schema.requests)
            .values(req)
            .onConflictDoUpdate({ target: schema.requests.id, set: req });
        }

        // 5. Ambientes
        if (environments && Array.isArray(environments)) {
          // Limpa ambientes antigos e insere novos (mais simples para ambientes)
          await tx.delete(schema.environments).where(eq(schema.environments.collectionsId, collectionId));
          for (const env of environments) {
            await tx.insert(schema.environments).values({
              id: env.id,
              name: env.name,
              collectionsId: collectionId,
              variables: env.variables || []
            });
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error("[HistoryService] Erro ao salvar histórico:", error);
      throw error;
    }
  }

  async deleteHistoryItem(id: string) {
    try {
      await this.db.transaction(async (tx) => {
        // O SQLite com FK Cascade deveria cuidar disso, 
        // mas garantimos deletando a coleção
        await tx.delete(schema.collections).where(eq(schema.collections.id, id));
      });
      return true;
    } catch (error) {
      console.error("[HistoryService] Erro ao deletar item:", error);
      return false;
    }
  }

  async deleteAllHistory() {
    try {
      const currentUser = this.userService?.getUser();
      // Nota: No schema atual as coleções não têm owner_id direto. 
      // Se quiser deletar tudo do usuário, precisaria filtrar por workspace ou adicionar owner_id na coleção.
      await this.db.delete(schema.collections);
      return true;
    } catch (error) {
      console.error("[HistoryService] Erro ao deletar tudo:", error);
      return false;
    }
  }
}

export default HistoryService;
