/**
 * Electron Service
 * Abstrai chamadas para window.electronAPI, fornecendo uma interface segura
 * e evitando erros quando o código roda fora do ambiente Electron (navegador puro).
 */
import { ElectronAPI } from "../../types/electronAPI";

const getElectronAPI = (): Partial<ElectronAPI> => {
  if (typeof window !== "undefined" && window.electronAPI) {
    return window.electronAPI;
  }

  // Fallback para desenvolvimento em navegador/mock
  return {
    isDev: false,
    selectFile: async () => null,
    selectSaveLocation: async () => null,
    copy: () => {},
    cut: () => {},
    paste: () => {},
    toggleDevTools: () => {},
  };
};

const electronAPI = getElectronAPI();

export const electronService = {
  isDev: electronAPI.isDev,

  /**
   * Abre caixa de diálogo para seleção de arquivos
   */
  async selectFile(filters: any[] = []): Promise<string[] | null> {
    if (!electronAPI.selectFile) return null;
    try {
      return await electronAPI.selectFile(filters);
    } catch (error) {
      console.error("[ElectronService] Erro ao selecionar arquivo:", error);
      return null;
    }
  },

  /**
   * Abre caixa de diálogo para salvar arquivo
   */
  async selectSaveLocation(): Promise<string | null> {
    if (!electronAPI.selectSaveLocation) return null;
    try {
      return await electronAPI.selectSaveLocation();
    } catch (error) {
      console.error(
        "[ElectronService] Erro ao selecionar local para salvar:",
        error,
      );
      return null;
    }
  },

  /**
   * Operações de Clipboard via Electron
   */
  copy: (): void => electronAPI.copy?.(),
  cut: (): void => electronAPI.cut?.(),
  paste: (): void => electronAPI.paste?.(),

  /**
   * DevTools
   */
  toggleDevTools: (): void => electronAPI.toggleDevTools?.(),
};

export default electronService;
