
export interface RequestData {
  method: string;
  url: string;
  headers: { key: string, value: string, enabled: boolean }[];
  params: { key: string, value: string, enabled: boolean }[];
  body: {
    mode: string;
    content: any;
  };
  auth?: {
    type: string;
    config: any;
  };
}

export interface ResponseData {
  status: number | null;
  statusText: string;
  body: any;
  headers: { key: string, value: string }[];
  time: number;
  size: number;
  logs: any[];
}

export interface RouteData {
  id: string;
  type: "route";
  name: string;
  description?: string;
  request: RequestData;
  response?: ResponseData;
}

export interface FolderData {
  id: string;
  type: "folder";
  name: string;
  description?: string;
  items: (RouteData | FolderData)[];
}

export type CollectionItem = RouteData | FolderData;

export interface CollectionData {
  id: string;
  collectionName: string;
  description: string;
  items: CollectionItem[];
}
