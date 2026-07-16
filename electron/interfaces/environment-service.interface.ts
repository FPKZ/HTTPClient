export interface IEnvironmentService {
  createEnvironment(collectionId: string, name: string): Promise<any>;
  updateEnvironment(id: string, updates: { name?: string; variables?: any[] }): Promise<boolean>;
  deleteEnvironment(id: string): Promise<boolean>;
}
