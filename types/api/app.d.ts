export interface AppAPI {
    isDev: boolean;
    getFilePath: (file: any) => string;

    ipcRenderer: {
        on: (channel: string, func: (...args: any[]) => void) => () => void;
        send: (channel: string, ...args: any[]) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
    };

    teste: () => void;

    // --- Ações de Janela ---
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    closeAll: () => void;
    forceClose: () => void;
    toggleDevTools: () => void;

    // --- Action Logger ---
    logAction: (action: string, user?: any) => Promise<any>;
    startActionLogger: () => void;
    stopActionLogger: () => void;
    resizeWindow: (bounds: any) => void;
    openActionLogger: () => void;

    // --- Clipboard (Native) ---
    copy: () => void;
    cut: () => void;
    paste: () => void;
    selectAll: () => void;

    // --- Rede ---
    conect: () => Promise<any>;
    onNetworkStatus: (callback: (status: any) => void) => () => void;

    // --- Menu (Native) ---
    openMenu: () => void;
    onMenuAction: (callback: (value: any) => void) => () => void;
}