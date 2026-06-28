import { CollectionItem } from "./entities/collection";
/**
 * store.ts
 * Definições de tipos para o estado global (Zustand)
 */

export interface Variable {
  id: string;
  key: string;
  initialValue?: string;
  currentValue?: string;
  value?: string; // Para globais
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: Variable[];
}



export interface Collection {
  id: string | null;
  name: string;
  description: string;
  items: CollectionItem[];
  environments: Environment[];
  activeEnvironmentId: string | null;
}

export interface TabUiState {
  activeSection: string;
  activeResponseView: string;
  panelVerticalSizePrimary?: string;
  panelVerticalSize?: string;
  panelHorizontalSize?: string;
}

export interface Log {
  status: number | string | null;
  statusText: string;
  data?: any;
  body?: any;
  isError?: boolean;
  headers: Record<string, string> | { key: string, value: string }[];
  responseTime?: number;
  responseSize?: number;
  contentType?: string;
  isImage?: boolean;
  isPDF?: boolean;
  isAudio?: boolean;
  isVideo?: boolean;
}

export interface Tab {
  id: string;
  screenKey: string | null;
  title: string;
  method: string;
  url: string;
  data: any; 
  isDirty: boolean;
  uiState: TabUiState;
  logs: Log[];
  isExecuting: boolean | string;
  lastResponse?: any;
}

export interface CollectionSlice {
  collection: Collection;
  globals: Variable[];
  clipboard: CollectionItem | null;
  isDraggingDisabled: boolean;

  setDraggingDisabled: (disabled: boolean) => void;
  loadCollection: (data: any) => void;
  saveTabToCollection: (id: string) => void;
  addRoute: (parentId?: string | null, name?: string) => void;
  duplicateRoute: (id: string) => void;
  copyRoute: (id: string) => void;
  pasteRoute: (targetId: string | null) => void;
  addFolder: (parentId?: string | null, name?: string) => void;
  deleteItem: (id: string) => void;
  renameItem: (id: string, newName: string) => void;
  moveItemToFolder: (activeId: string, folderId: string | null) => void;
  reorderItems: (activeId: string, overId: string | null) => void;
  updateCollectionMeta: (name?: string, description?: string) => void;
  updateEnvironments: (environments: Environment[]) => void;
  setActiveEnvironment: (id: string | null) => void;
  addEnvironment: (name?: string) => string;
  deleteEnvironment: (id: string) => void;
  updateEnvironmentName: (id: string, name: string) => void;
  addVariable: (envId: string) => void;
  updateVariable: (envId: string, varId: string, updates: Partial<Variable>) => void;
  deleteVariable: (envId: string, varId: string) => void;
  addGlobalVariable: () => void;
  updateGlobalVariable: (id: string, updates: Partial<Variable>) => void;
  deleteGlobalVariable: (id: string) => void;
  importEnvironment: (envData: any) => string | undefined;
  importGlobals: (globalsData: any) => void;
  getCollectionForExport: () => Collection;
  resetCollection: () => void;
}

export interface TabSlice {
  tabsByCollection: Record<string, { tabs: Tab[]; activeTabId: string | null }>;
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (screenKey: string, routeData: any) => void;
  addBlankTab: (nome?: string) => void;
  setActiveTab: (id: string | null) => void;
  closeTab: (id: string) => void;
  updateTabData: (id: string, newData: Partial<Tab>) => void;
  updateTabRequest: (id: string, sectionKey: string, fieldKey: string | null, value: any) => void;
  updateTabUiState: (id: string, partialUiState: Partial<TabUiState>) => void;
  updateTabLogs: (id: string, logs: Log[]) => void;
  setTabExecuting: (id: string, isExecuting: boolean | string) => void;
  getActiveTab: () => Tab | null;
  deleteActiveTab: () => void;
  isTabDirty: (id: string) => boolean;
  isRouteDirty: (screenKey: string) => boolean;
  resetTabs: () => void;
  reorderTabs: (oldIndex: number, newIndex: number) => void;
  saveTabsState: (collectionId: string) => void;
  restoreTabsState: (collectionId: string) => void;
}
