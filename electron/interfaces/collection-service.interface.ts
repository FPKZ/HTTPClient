export interface ICollectionService {
  createFolder(collectionId: string, parentId: string | null, name: string): Promise<any>;
  renameItem(id: string, type: "folder" | "route", name: string): Promise<boolean>;
  deleteFolder(id: string): Promise<boolean>;
  createRequest(collectionId: string, folderId: string | null, name: string): Promise<any>;
  duplicateRequest(id: string, newId: string, name: string): Promise<any>;
  deleteRequest(id: string): Promise<boolean>;
  moveOrReorderItem(
    id: string,
    type: "folder" | "route",
    targetFolderId: string | null,
    orderIndex: number
  ): Promise<boolean>;
}
