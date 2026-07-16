export interface ICollectionRepository {
  createFolder(collectionId: string, parentId: string | null, name: string): Promise<any>;
  renameFolder(id: string, name: string): Promise<boolean>;
  renameRequest(id: string, name: string): Promise<boolean>;
  deleteFolder(id: string): Promise<boolean>;
  createRequest(collectionId: string, folderId: string | null, name: string, protocol: string): Promise<any>;
  findRequestById(id: string): Promise<any>;
  insertRequest(requestData: any): Promise<boolean>;
  deleteRequest(id: string): Promise<boolean>;
  updateFolderParentAndOrder(id: string, parentId: string | null, orderIndex: number): Promise<boolean>;
  updateRequestParentAndOrder(id: string, folderId: string | null, orderIndex: number): Promise<boolean>;
}
