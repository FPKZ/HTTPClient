import { IWorkspaceService } from "../interfaces/workspace-service.interface";
import { IWorkspaceRepository } from "../interfaces/workspace-repository.interface";

export class WorkspaceService implements IWorkspaceService {
  private repo: IWorkspaceRepository;

  constructor(repo: IWorkspaceRepository) {
    this.repo = repo;
  }

  async getWorkspaces(userId: string): Promise<any[]> {
    if (!userId) return [];
    return this.repo.getWorkspaces(userId);
  }

  async getWorkspaceDetails(id: string): Promise<any> {
    return this.repo.getWorkspaceDetails(id);
  }

  async createWorkspace(params: {
    name: string;
    ownerId: string;
    icon?: string;
    description?: string;
  }): Promise<any> {
    console.log("[WorkspaceService] createWorkspace chamado com params:", params);

    if (!params.ownerId) {
      throw new Error("Usuário deve estar autenticado para criar um workspace.");
    }

    return this.repo.createWorkspace(params);
  }

  async updateWorkspace(workspace: any): Promise<boolean> {
    return this.repo.updateWorkspace(workspace);
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    return this.repo.deleteWorkspace(id);
  }

  async linkCollection(workspaceId: string, collectionId: string): Promise<boolean> {
    return this.repo.linkCollection(workspaceId, collectionId);
  }

  async unlinkCollection(collectionId: string): Promise<boolean> {
    return this.repo.unlinkCollection(collectionId);
  }

  async inviteMember(
    workspaceId: string,
    email: string,
    role?: "viewer" | "editor" | "admin"
  ): Promise<boolean> {
    try {
      const user = await this.repo.findUserByEmail(email);
      if (!user) {
        throw new Error(`Usuário com o email "${email}" não encontrado.`);
      }

      return this.repo.upsertMember(workspaceId, user.id, role || "viewer");
    } catch (error) {
      console.error("[WorkspaceService] Erro ao convidar membro:", error);
      throw error;
    }
  }

  async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    return this.repo.removeMember(workspaceId, userId);
  }
}

export default WorkspaceService;
