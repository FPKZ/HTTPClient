export interface StorageAPI {
    // --- Dialogos e Sistema de Arquivos ---
    selectFolder: () => Promise<string | null>;
    selectFile: (filters?: any) => Promise<string[] | null>;
    selectSaveLocation: () => Promise<string | null>;
    saveFile: (data: any) => Promise<any>;
    readJsonFile: (path: string) => Promise<any>;
    exportHttp: (data: any) => Promise<any>;
    confirm: (message: string) => Promise<boolean>;
    newFile: () => void;

    // --- Histórico e Coleções ---
    getHistory: () => Promise<any[]>;
    saveHistory: (data: any) => Promise<any>;
    getCollectionById: (params: { id: string, source: string }) => Promise<CollectionData>;
    deleteHistoryItem: (id: string) => Promise<any>;
    deleteAllHistory: () => Promise<any>;
    getRequestDetails: (id: string) => Promise<any>;
    saveRequestDetails: (id: string, data: any) => Promise<boolean>;
    getCollectionForExport: (id: string) => Promise<any>;
    onRequestSaveSession: (callback: () => void) => () => void;
    saveAndQuit: (data: any) => void;

    // --- Coleções Granulares (CollectionService) ---
    createFolder: (params: { collectionId: string, parentId: string | null, name: string }) => Promise<any>;
    renameItem: (params: { id: string, type: 'folder' | 'route', name: string }) => Promise<boolean>;
    deleteFolder: (params: { id: string }) => Promise<boolean>;
    createRequest: (params: { collectionId: string, folderId: string | null, name: string }) => Promise<any>;
    duplicateRequest: (params: { id: string, newId: string, name: string }) => Promise<any>;
    deleteRequest: (params: { id: string }) => Promise<boolean>;
    moveOrReorderItem: (params: { id: string, type: 'folder' | 'route', targetFolderId: string | null, orderIndex: number }) => Promise<boolean>;

    // --- Workspaces ---
    getWorkspaces: (userId: string) => Promise<any[]>;
    getWorkspaceDetails: (id: string) => Promise<any>;
    createWorkspace: (params: { name: string; ownerId: string; icon?: string; description?: string }) => Promise<any>;
    updateWorkspace: (workspace: any) => Promise<boolean>;
    deleteWorkspace: (id: string) => Promise<boolean>;
    linkCollection: (params: { workspaceId: string; collectionId: string }) => Promise<boolean>;
    unlinkCollection: (collectionId: string) => Promise<boolean>;
    inviteMember: (params: { workspaceId: string; email: string; role?: 'viewer' | 'editor' | 'admin' }) => Promise<boolean>;
    removeMember: (params: { workspaceId: string; userId: string }) => Promise<boolean>;
}