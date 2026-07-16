import { TreeParser } from "../utils/tree-parser";
import { IUserService } from "../interfaces/user-service.interface";
import { IHistoryService, HistoryItem } from "../interfaces/history-service.interface";
import { IHistoryRepository } from "../interfaces/history-repository.interface";

export class HistoryService implements IHistoryService {
  private repo: IHistoryRepository;
  private userService: IUserService;

  constructor(repo: IHistoryRepository, userService: IUserService) {
    this.repo = repo;
    this.userService = userService;
  }

  async getHistory(): Promise<HistoryItem[]> {
    try {
      const results = await this.repo.getCollectionsResumed();
      return results.map(col => ({
        id: col.id,
        name: col.name,
        updatedAt: col.updatedAt!,
        sourceType: "native",
        file: `${col.id}.json`,
      }));
    } catch (error) {
      console.error("[HistoryService] Erro ao obter histórico:", error);
      return [];
    }
  }

  async getCollectionById(id: string): Promise<any> {
    try {
      const collection = await this.repo.getCollectionBase(id);
      if (!collection) return null;

      const { folders, requests } = await this.repo.getCollectionHierarchy(id);
      const items = TreeParser.unflatten(folders, requests);

      const envs = await this.repo.getCollectionEnvironments(id);
      const parsedEnvs = envs.map(e => ({
        ...e,
        variables: typeof e.variables === 'string' ? JSON.parse(e.variables) : (e.variables || [])
      }));

      return {
        ...collection,
        items,
        environments: parsedEnvs,
        activeEnvironmentId: collection.activeEnv || null
      };
    } catch (error) {
      console.error("[HistoryService] Erro ao buscar coleção:", error);
      return null;
    }
  }

  async saveHistory(collectionData: any): Promise<{ success: boolean }> {
    const { id, name, items, environments, workspaceId, activeEnvironmentId } = collectionData;
    const collectionId = id;

    const { folders: flatFolders, requests: flatRequests } = TreeParser.flatten(collectionId, items);

    try {
      await this.repo.saveCollectionTransaction({
        collectionId,
        name,
        workspaceId,
        activeEnvironmentId,
        flatFolders,
        flatRequests,
        environments: environments || [],
      });

      return { success: true };
    } catch (error) {
      console.error("[HistoryService] Erro ao salvar histórico:", error);
      throw error;
    }
  }

  async deleteHistoryItem(id: string): Promise<boolean> {
    try {
      return this.repo.deleteCollection(id);
    } catch (error) {
      console.error("[HistoryService] Erro ao deletar item:", error);
      return false;
    }
  }

  async deleteAllHistory(): Promise<boolean> {
    try {
      return this.repo.deleteAllCollections();
    } catch (error) {
      console.error("[HistoryService] Erro ao deletar tudo:", error);
      return false;
    }
  }

  async getRequestDetails(id: string): Promise<any> {
    try {
      const req = await this.repo.findRequestById(id);
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

      const updateData = {
        method: data.method,
        url: data.url,
        name: data.name,
        params: paramsValue,
        headers: headersValue,
        body: bodyValue,
        auth: authValue,
        isDirty: data.isDirty !== undefined ? data.isDirty : true,
        updatedAt: new Date().toISOString()
      };

      return this.repo.updateRequestDetails(id, updateData);
    } catch (error) {
      console.error("[HistoryService] Erro ao salvar detalhes da requisição:", error);
      return false;
    }
  }

  async getCollectionForExport(id: string): Promise<any> {
    try {
      const collection = await this.repo.getCollectionBase(id);
      if (!collection) return null;

      const { folders, requests } = await this.repo.getCollectionHierarchy(id);
      const items = TreeParser.unflatten(folders, requests, { lean: false });

      const envs = await this.repo.getCollectionEnvironments(id);
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
