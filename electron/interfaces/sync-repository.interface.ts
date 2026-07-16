export interface ISyncRepository {
  getDirtyRequests(): Promise<any[]>;
  clearDirtyRequests(ids: string[]): Promise<boolean>;
}
