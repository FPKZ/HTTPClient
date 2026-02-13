/**
 * Electron Service
 * Abstrai chamadas para window.electronAPI, fornecendo uma interface segura
 * e evitando erros quando o código roda fora do ambiente Electron (navegador puro).
 */

const getElectronAPI = () => {
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
    // Adicione outros métodos conforme necessário
  };
};

const electronAPI = getElectronAPI();

export const electronService = {
  isDev: electronAPI.isDev,

  /**
   * Abre caixa de diálogo para seleção de arquivos
   */
  async selectFile(filters = []) {
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
  async selectSaveLocation() {
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
  copy: () => electronAPI.copy?.(),
  cut: () => electronAPI.cut?.(),
  paste: () => electronAPI.paste?.(),

  /**
   * DevTools
   */
  toggleDevTools: () => electronAPI.toggleDevTools?.(),
};

export default electronService;
