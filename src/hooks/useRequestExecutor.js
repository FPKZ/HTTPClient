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

    // Helper para converter lista [{key, value, enabled}] em objeto {key: value}
    const listToObj = (list) => {
      if (!Array.isArray(list)) return {};
      return list.reduce((acc, curr) => {
        if (curr.enabled && curr.key) {
          acc[curr.key] = curr.value;
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
          // Formata o valor final: Ex: "Bearer <token>"
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
        ? `${requestData.url}${
            requestData.url.includes("?") ? "&" : "?"
          }${queryString}`
        : requestData.url;

      // 3. Body processado conforme o modo
      let bodyToExecute = null;
      if (
        requestData.body?.mode === "inputs" ||
        requestData.body?.mode === "formdata"
      ) {
        // Se for input ou formdata, convertemos a lista para objeto/form
        bodyToExecute = {
          ...listToObj(requestData.body.content),
          ...authBodyInjection,
        };
      } else if (requestData.body?.mode === "json") {
        try {
          const parsed = JSON.parse(requestData.body.content);
          bodyToExecute = { ...parsed, ...authBodyInjection };
        } catch (e) {
          console.log(e);
          bodyToExecute = requestData.body.content; // Se falhar, enviamos bruto (mas auth via body pode falhar aqui)
        }
      } else if (Object.keys(authBodyInjection).length > 0) {
        // Se o modo era none mas tem injeção de auth no body
        bodyToExecute = authBodyInjection;
      }

      const response = await window.electronAPI.request({
        url: finalUrl,
        method: requestData.method,
        headers,
        body: bodyToExecute,
        bodyMode: requestData.body?.mode || "none", // Passamos o modo para o serviço
      });

      console.log("Response received in hook:", {
        status: response.status,
        isImage: response.isImage,
        contentType: response.contentType,
        dataLength: response.data?.length,
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
