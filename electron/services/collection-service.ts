import { ICollectionService } from "../interfaces/collection-service.interface";
import { ICollectionRepository } from "../interfaces/collection-repository.interface";

export class CollectionService implements ICollectionService {
  private repo: ICollectionRepository;

  constructor(repo: ICollectionRepository) {
    this.repo = repo;
  }

  async createFolder(collectionId: string, parentId: string | null, name: string): Promise<any> {
    return this.repo.createFolder(collectionId, parentId, name);
  }

  async renameItem(id: string, type: "folder" | "route", name: string): Promise<boolean> {
    if (type === "folder") {
      return this.repo.renameFolder(id, name);
    } else {
      return this.repo.renameRequest(id, name);
    }
  }

  async deleteFolder(id: string): Promise<boolean> {
    return this.repo.deleteFolder(id);
  }

  async createRequest(collectionId: string, folderId: string | null, name: string, protocol?: string): Promise<any> {
    return this.repo.createRequest(collectionId, folderId, name, protocol || "http");
  }

  async duplicateRequest(id: string, newId: string, name: string): Promise<any> {
    try {
      const source = await this.repo.findRequestById(id);
      if (!source) {
        throw new Error(`Request de origem ${id} não encontrada.`);
      }

      const requestData = {
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
      };

      await this.repo.insertRequest(requestData);

      return {
        id: newId,
        type: "route",
        name: name || `${source.name} (Cópia)`,
        method: source.method,
        folderId: source.folderId || null,
        collectionId: source.collectionId,
      };
    } catch (error) {
      console.error("[CollectionService] Erro ao duplicar request:", error);
      throw error;
    }
  }

  async deleteRequest(id: string): Promise<boolean> {
    return this.repo.deleteRequest(id);
  }

  async moveOrReorderItem(
    id: string,
    type: "folder" | "route",
    targetFolderId: string | null,
    orderIndex: number
  ): Promise<boolean> {
    if (type === "folder") {
      return this.repo.updateFolderParentAndOrder(id, targetFolderId, orderIndex);
    } else {
      return this.repo.updateRequestParentAndOrder(id, targetFolderId, orderIndex);
    }
  }
}
