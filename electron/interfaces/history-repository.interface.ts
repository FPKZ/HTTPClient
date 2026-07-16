export interface IHistoryRepository {
  getCollectionsResumed(): Promise<any[]>;
  getCollectionBase(id: string): Promise<any>;
  getCollectionHierarchy(id: string): Promise<{ folders: any[]; requests: any[] }>;
  getCollectionEnvironments(id: string): Promise<any[]>;
  saveCollectionTransaction(params: {
    collectionId: string;
    name: string;
    workspaceId: string | null;
    activeEnvironmentId: string | null;
    flatFolders: any[];
    flatRequests: any[];
    environments: any[];
  }): Promise<boolean>;
  deleteCollection(id: string): Promise<boolean>;
  deleteAllCollections(): Promise<boolean>;
  findRequestById(id: string): Promise<any>;
  updateRequestDetails(id: string, updateData: any): Promise<boolean>;
}
