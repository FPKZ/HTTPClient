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
    onRequestSaveSession: (callback: () => void) => () => void;
    saveAndQuit: (data: any) => void;
}