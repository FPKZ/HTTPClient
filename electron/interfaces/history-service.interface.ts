export interface HistoryItem {
  id: string;
  name: string;
  updatedAt: string;
  sourceType: string;
  file: string;
}

export interface IHistoryService {
  getHistory(): Promise<HistoryItem[]>;
  getCollectionById(id: string): Promise<any>;
  saveHistory(collectionData: any): Promise<{ success: boolean }>;
  deleteHistoryItem(id: string): Promise<boolean>;
  deleteAllHistory(): Promise<boolean>;
}
