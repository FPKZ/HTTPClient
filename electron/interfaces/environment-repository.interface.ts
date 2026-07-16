export interface IEnvironmentRepository {
  create(collectionId: string, name: string): Promise<any>;
  update(id: string, updates: { name?: string; variables?: any[] }): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  getByCollectionId(collectionId: string): Promise<any[]>;
}
