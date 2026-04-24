import useTabStore from "../store/useTabStore";
import { buildFinalRequest } from "../utils/collectionUtils";

/**
 * useRequestExecutor
 * Gerencia a execução de requisições e armazenamento de logs.
 * SRP: Cuida apenas do ciclo de vida das requisições HTTP.
 */
export function useRequestExecutor() {
  const updateTabLogs = useTabStore((state) => state.updateTabLogs);
  const setTabExecuting = useTabStore((state) => state.setTabExecuting);

  const environments = useTabStore((state) => state.collection.environments) || [];
  const activeEnvironmentId = useTabStore((state) => state.collection.activeEnvironmentId);
  const globals = useTabStore((state) => state.globals) || [];

  const envVariables = environments.find((env) => env.id === activeEnvironmentId)?.variables || [];

  // Mescla variáveis: globais primeiro, depois ambientes (ambientes têm prioridade)
  const activeVariables = [...globals, ...envVariables];

  const cancelRequest = (requestId: string) => {
    if (window.electronAPI?.cancelRequest) {
      window.electronAPI.logAction("Cancelando requisição");
      window.electronAPI.cancelRequest(requestId);
    }
  };

  const handleExecuteRequest = async (
    tabId: string,
    requestDataOrigin: any,
    tabTitle: string
  ) => {
    if (!window.electronAPI) return;

    // Gera um ID único para esta execução de requisição
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setTabExecuting(tabId, requestId);

    // Constrói o objeto de requisição final (Aplica variáveis, Auth, Body, URL...)
    const requestData = buildFinalRequest(requestDataOrigin, activeVariables);

    try {
      window.electronAPI.logAction("Executando requisição: " + tabTitle);

      const response = await window.electronAPI.request({
        ...requestData,
        requestId,
      });

      updateTabLogs(tabId, [response]);
    } catch (error: any) {
      window.electronAPI.logAction("Erro na requisição: " + tabTitle + " - " + error.message);
      updateTabLogs(tabId, [
        {
          status: 500,
          statusText: "Error",
          data: error.message,
          isError: true,
          headers: {},
        },
      ]);
    } finally {
      setTabExecuting(tabId, false);
    }
  };

  return {
    handleExecuteRequest,
    cancelRequest,
  };
}
