export interface IWorkspaceService {
  getWorkspaces(userId: string): Promise<any[]>;
  getWorkspaceDetails(id: string): Promise<any>;
  createWorkspace(params: { name: string; ownerId: string; icon?: string; description?: string }): Promise<any>;
  updateWorkspace(workspace: any): Promise<boolean>;
  deleteWorkspace(id: string): Promise<boolean>;
  linkCollection(workspaceId: string, collectionId: string): Promise<boolean>;
  unlinkCollection(collectionId: string): Promise<boolean>;
  inviteMember(workspaceId: string, email: string, role?: 'viewer' | 'editor' | 'admin'): Promise<boolean>;
  removeMember(workspaceId: string, userId: string): Promise<boolean>;
}
