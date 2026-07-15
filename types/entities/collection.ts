
export type ApiProtocol = "http" | "sse" | "websocket";

export interface RequestData {
  protocol?: ApiProtocol;
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
  protocol?: ApiProtocol;
  description?: string;
  request: RequestData;
  response?: ResponseData;
}

export interface TreeRouteNode {
  id: string;
  type: "route";
  name: string;
  protocol?: ApiProtocol;
  description?: string;
  method: string;
}

export interface TreeFolderNode {
  id: string;
  type: "folder";
  name: string;
  description?: string;
  items: CollectionItem[];
}

export type CollectionItem = TreeRouteNode | TreeFolderNode;

export interface CollectionData {
  id: string;
  collectionName: string;
  description: string;
  items: CollectionItem[];
}

