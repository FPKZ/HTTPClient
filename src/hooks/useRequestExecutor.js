import { useState } from "react";

/**
 * useRequestExecutor
 * Gerencia a execução de requisições e armazenamento de logs.
 * SRP: Cuida apenas do ciclo de vida das requisições HTTP.
 */
export function useRequestExecutor() {
  const [logsPorTela, setLogsPorTela] = useState({});

  const handleExecuteRequest = async (screenKey, requestData) => {
    if (!window.electronAPI) return;
    
    try {
      const response = await window.electronAPI.request({
        url: requestData.url,
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
      });

      setLogsPorTela((prev) => ({
        ...prev,
        [screenKey]: [response],
      }));
    } catch (error) {
      setLogsPorTela((prev) => ({
        ...prev,
        [screenKey]: [
          {
            status: 500,
            statusText: "Error",
            data: error.message,
            isError: true,
            headers: {},
          },
        ],
      }));
    }
  };

  return {
    logsPorTela,
    handleExecuteRequest,
  };
}
