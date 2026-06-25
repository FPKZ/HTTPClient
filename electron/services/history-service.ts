import { eq, and, notInArray, desc } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { TreeParser } from "../utils/tree-parser";
import { IUserService } from "../interfaces/user-service.interface";
import { IHistoryService, HistoryItem } from "../interfaces/history-service.interface";

/**
 * HistoryService
 * Orquestra a persistência do histórico e coleções usando Drizzle ORM.
 * Segue princípios SOLID, desacoplando a lógica de mapeamento (TreeParser)
 * e utilizando Injeção de Dependência para o banco de dados.
 */

export class HistoryService implements IHistoryService {
  private db: BetterSQLite3Database<typeof schema>;
  private userService: IUserService;

  constructor(db: BetterSQLite3Database<typeof schema>, userService: IUserService) {
    this.db = db;
    this.userService = userService;
  }

  /**
   * Retorna a lista resumida de coleções para o histórico da barra lateral.
   */
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const currentUser = this.userService?.getCurrentUser();
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
        updatedAt: col.updatedAt!,
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
  async getCollectionById(id: string): Promise<any> {
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
        this.db.select({
          id: schema.requests.id,
          name: schema.requests.name,
          collectionId: schema.requests.collectionId,
          folderId: schema.requests.folderId,
          method: schema.requests.method,
          url: schema.requests.url,
          orderIndex: schema.requests.orderIndex,
          isDirty: schema.requests.isDirty,
          createdAt: schema.requests.createdAt,
          updatedAt: schema.requests.updatedAt,
        })
        .from(schema.requests)
        .where(eq(schema.requests.collectionId, id))
      ]);

      const items = TreeParser.unflatten(allFolders, allRequests);

      // Busca ambientes
      const envs = await this.db.query.environments.findMany({
        where: eq(schema.environments.collectionsId, id)
      });

      const parsedEnvs = envs.map(e => ({
        ...e,
        variables: typeof e.variables === 'string' ? JSON.parse(e.variables) : (e.variables || [])
      }));

      return {
        ...collection,
        items,
        environments: parsedEnvs
      };
    } catch (error) {
      console.error("[HistoryService] Erro ao buscar coleção:", error);
      return null;
    }
  }

  /**
   * Salva uma coleção inteira desconstruindo-a em tabelas relacionais.
   */
  async saveHistory(collectionData: any): Promise<{ success: boolean }> {
    const { id, name, items, environments, workspaceId } = collectionData;
    const collectionId = id;

    // 1. Achata a árvore
    const { folders: flatFolders, requests: flatRequests } = TreeParser.flatten(collectionId, items);

    try {
      this.db.transaction((tx) => {
        // 2. Upsert Coleção
        tx.insert(schema.collections)
          .values({
            id: collectionId,
            name: name,
            workspaceId: workspaceId || null,
            storageType: 'local',
          })
          .onConflictDoUpdate({
            target: schema.collections.id,
            set: { name, updatedAt: new Date().toISOString() }
          }).run();

        // 3. Gerenciar Pastas (Upsert + Delete órfãos)
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

        // 4. Gerenciar Requests (Upsert + Delete órfãos)
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

        // 5. Ambientes
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

      return { success: true };
    } catch (error) {
      console.error("[HistoryService] Erro ao salvar histórico:", error);
      throw error;
    }
  }

  async deleteHistoryItem(id: string): Promise<boolean> {
    try {
      this.db.transaction((tx) => {
        // O SQLite com FK Cascade deveria cuidar disso, 
        // mas garantimos deletando a coleção
        tx.delete(schema.collections).where(eq(schema.collections.id, id)).run();
      });
      return true;
    } catch (error) {
      console.error("[HistoryService] Erro ao deletar item:", error);
      return false;
    }
  }

  async deleteAllHistory(): Promise<boolean> {
    try {
      const currentUser = this.userService?.getCurrentUser();
      // Nota: No schema atual as coleções não têm owner_id direto. 
      // Se quiser deletar tudo do usuário, precisaria filtrar por workspace ou adicionar owner_id na coleção.
      await this.db.delete(schema.collections);
      return true;
    } catch (error) {
      console.error("[HistoryService] Erro ao deletar tudo:", error);
      return false;
    }
  }

  async getRequestDetails(id: string): Promise<any> {
    try {
      const req = await this.db.query.requests.findFirst({
        where: eq(schema.requests.id, id),
      });
      if (!req) return null;
      return {
        id: req.id,
        name: req.name,
        collectionId: req.collectionId,
        folderId: req.folderId,
        method: req.method,
        url: req.url,
        params: typeof req.params === 'string' ? JSON.parse(req.params) : (req.params || []),
        headers: typeof req.headers === 'string' ? JSON.parse(req.headers) : (req.headers || []),
        body: typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || { mode: "none", content: "" }),
        auth: typeof req.auth === 'string' ? JSON.parse(req.auth) : (req.auth || { name: "none", config: { key: "", type: "Bearer", value: "header" }, enabled: false }),
        orderIndex: req.orderIndex,
        isDirty: req.isDirty,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt
      };
    } catch (error) {
      console.error("[HistoryService] Erro ao buscar detalhes da requisição:", error);
      return null;
    }
  }

  async saveRequestDetails(id: string, data: any): Promise<boolean> {
    try {
      const paramsValue = typeof data.params === 'object' ? JSON.stringify(data.params) : data.params;
      const headersValue = typeof data.headers === 'object' ? JSON.stringify(data.headers) : data.headers;
      const bodyValue = typeof data.body === 'object' ? JSON.stringify(data.body) : data.body;
      const authValue = typeof data.auth === 'object' ? JSON.stringify(data.auth) : data.auth;

      await this.db.update(schema.requests)
        .set({
          method: data.method,
          url: data.url,
          name: data.name,
          params: paramsValue,
          headers: headersValue,
          body: bodyValue,
          auth: authValue,
          isDirty: data.isDirty !== undefined ? data.isDirty : true,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.requests.id, id))
        .run();
      return true;
    } catch (error) {
      console.error("[HistoryService] Erro ao salvar detalhes da requisição:", error);
      return false;
    }
  }

  async getCollectionForExport(id: string): Promise<any> {
    try {
      const collection = await this.db.query.collections.findFirst({
        where: eq(schema.collections.id, id),
      });

      if (!collection) return null;

      const [allFolders, allRequests] = await Promise.all([
        this.db.select().from(schema.folders).where(eq(schema.folders.collectionId, id)),
        this.db.select().from(schema.requests).where(eq(schema.requests.collectionId, id))
      ]);

      const items = TreeParser.unflatten(allFolders, allRequests, { lean: false });

      // Busca ambientes
      const envs = await this.db.query.environments.findMany({
        where: eq(schema.environments.collectionsId, id)
      });

      const parsedEnvs = envs.map(e => ({
        ...e,
        variables: typeof e.variables === 'string' ? JSON.parse(e.variables) : (e.variables || [])
      }));

      return {
        ...collection,
        items,
        environments: parsedEnvs
      };
    } catch (error) {
      console.error("[HistoryService] Erro ao buscar coleção para exportar:", error);
      return null;
    }
  }
}

export default HistoryService;
