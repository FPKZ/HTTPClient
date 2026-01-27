import { useState } from "react";
import useTabStore from "../store/useTabStore";
import { applyVariables } from "../utils/collectionUtils";

/**
 * useRequestExecutor
 * Gerencia a execução de requisições e armazenamento de logs.
 * SRP: Cuida apenas do ciclo de vida das requisições HTTP.
 */
export function useRequestExecutor() {
  const [logsPorTela, setLogsPorTela] = useState({});
  const [executandoPorTela, setExecutandoPorTela] = useState({});
  const environments = useTabStore(
    (state) => state.collection.environments || [],
  );

  const cancelRequest = (requestId) => {
    if (window.electronAPI?.cancelRequest) {
      window.electronAPI.cancelRequest(requestId);
    }
  };

  const handleExecuteRequest = async (screenKey, requestDataOrigin) => {
    if (!window.electronAPI) return;

    // Gera um ID único para esta execução de requisição
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setExecutandoPorTela((prev) => ({ ...prev, [screenKey]: requestId }));

    // Aplica variáveis em todo o objeto de requisição
    const requestData = applyVariables(requestDataOrigin, environments);

    // Helper para converter lista [{key, value, enabled, type}] em objeto {key: value}
    const listToObj = (list) => {
      if (!Array.isArray(list)) return {};
      return list.reduce((acc, curr) => {
        if (curr.enabled && curr.key) {
          if (curr.type === "file") {
            acc[curr.key] = { src: curr.value, type: "file" };
          } else {
            acc[curr.key] = curr.value;
          }
        }
        return acc;
      }, {});
    };

    try {
      // 1. Headers habilitados
      const headers = listToObj(requestData.headers);

      // 1.5. Injeção de Autenticação (Auth)
      let authBodyInjection = {};
      if (
        requestData.auth &&
        requestData.auth.name &&
        requestData.auth.name !== "none"
      ) {
        const { key, value, type } = requestData.auth.config || {};
        const fieldName = requestData.auth.name;

        if (fieldName && key) {
          const authString = type ? `${type} ${key}` : key;
          if (value === "header") {
            headers[fieldName] = authString;
          } else if (value === "body") {
            authBodyInjection[fieldName] = authString;
          }
        }
      }

      // 2. Query Params habilitados
      const queryParams = listToObj(requestData.params);
      const queryString = new URLSearchParams(queryParams).toString();
      const finalUrl = queryString
        ? `${requestData.url}${requestData.url.includes("?") ? "&" : "?"}${queryString}`
        : requestData.url;

      // 3. Body processado conforme o modo
      let bodyToExecute = null;
      const mode = requestData.body?.mode || "none";

      if (mode === "inputs" || mode === "formdata" || mode === "urlencoded") {
        bodyToExecute = {
          ...listToObj(requestData.body.content),
          ...authBodyInjection,
        };
      } else if (mode === "json") {
        try {
          const content =
            typeof requestData.body.content === "string"
              ? requestData.body.content
              : JSON.stringify(requestData.body.content);

          if (!content || !content.trim()) {
            bodyToExecute = {};
          } else {
            const parsed = JSON.parse(content);
            bodyToExecute = { ...parsed, ...authBodyInjection };
          }
        } catch (e) {
          console.log("JSON parse error in executor:", e);
          bodyToExecute = requestData.body.content;
        }
      } else if (mode === "binary") {
        // Assume que o conteúdo é um path de arquivo ou string bruta
        bodyToExecute = requestData.body.content;
      } else if (Object.keys(authBodyInjection).length > 0) {
        bodyToExecute = authBodyInjection;
      }

      const response = await window.electronAPI.request({
        url: finalUrl,
        method: requestData.method,
        headers,
        body: mode === "stream" ? null : bodyToExecute,
        bodyMode: mode,
        requestId,
        streamPath: mode === "stream" ? requestData.body.content : null,
        timeout: requestData.timeout,
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
    } finally {
      setExecutandoPorTela((prev) => {
        const newState = { ...prev };
        delete newState[screenKey];
        return newState;
      });
    }
  };

  return {
    logsPorTela,
    executandoPorTela,
    handleExecuteRequest,
    cancelRequest,
  };
}
