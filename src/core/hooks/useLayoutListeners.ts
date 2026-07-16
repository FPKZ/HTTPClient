import { useEffect } from "react";
import useTabStore from "@/core/store/useTabStore";
import useInterfaceStore from "@/core/store/useInterfaceStore";

/**
 * useLayoutListeners
 * Hook para centralizar efeitos colaterais de subscrição IPC globais do layout principal.
 * Garante que a lógica esteja desacoplada do componente visual.
 */
export default function useLayoutListeners(collection: any) {
  useEffect(() => {
    // Se o aplicativo iniciar e tiver uma coleção carregada,
    // garante que a sidebar esteja aberta e exibindo as coleções
    if (collection) {
      useInterfaceStore.setState({
        sideBarIsOpen: true,
        activeSidebar: "collections",
      });
    }

    const unsubscribeMethods: (() => void)[] = [];

    if ((window as any).electronAPI) {
      const api = (window as any).electronAPI;

      // WebSocket Status Listener
      if (api.onWsStatus) {
        const unsub = api.onWsStatus((data: any) => {
          const tabStore = useTabStore.getState();
          tabStore.updateTabConnectionStatus(data.requestId, data.status);
          
          let logMsg = "";
          if (data.status === "connected") {
            logMsg = `--- Conectado com sucesso ---`;
          } else if (data.status === "connecting") {
            logMsg = `--- Conectando... ---`;
          } else if (data.status === "disconnected") {
            logMsg = `--- Desconectado ${data.error ? `(Erro: ${data.error})` : (data.reason ? `(Razão: ${data.reason})` : "")} ---`;
          }

          tabStore.appendTabLog(data.requestId, {
            status: "INFO",
            statusText: data.status,
            data: logMsg,
            isError: !!data.error,
            headers: {},
            responseTime: 0,
            responseSize: 0,
            contentType: "text/plain",
          });
        });
        unsubscribeMethods.push(unsub);
      }

      // WebSocket Message Listener
      if (api.onWsMessage) {
        const unsub = api.onWsMessage((msg: any) => {
          const tabStore = useTabStore.getState();
          tabStore.appendTabLog(msg.requestId, {
            status: msg.type === "incoming" ? "RECV" : "SEND",
            statusText: msg.type.toUpperCase(),
            data: msg.data,
            headers: {},
            responseTime: 0,
            responseSize: typeof msg.data === "string" ? msg.data.length : 0,
            contentType: "application/json",
          });
        });
        unsubscribeMethods.push(unsub);
      }

      // SSE Status Listener
      if (api.onSseStatus) {
        const unsub = api.onSseStatus((data: any) => {
          const tabStore = useTabStore.getState();
          tabStore.updateTabConnectionStatus(data.requestId, data.status);
          
          let logMsg = "";
          if (data.status === "connected") {
            logMsg = `--- Stream SSE Aberto ---`;
          } else if (data.status === "connecting") {
            logMsg = `--- Abrindo conexão SSE... ---`;
          } else if (data.status === "disconnected") {
            logMsg = `--- Stream SSE Fechado ${data.error ? `(Erro: ${data.error})` : ""} ---`;
          }

          tabStore.appendTabLog(data.requestId, {
            status: "INFO",
            statusText: data.status,
            data: logMsg,
            isError: !!data.error,
            headers: {},
            responseTime: 0,
            responseSize: 0,
            contentType: "text/plain",
          });
        });
        unsubscribeMethods.push(unsub);
      }

      // SSE Message Listener
      if (api.onSseMessage) {
        const unsub = api.onSseMessage((event: any) => {
          const tabStore = useTabStore.getState();
          tabStore.appendTabLog(event.requestId, {
            status: `SSE: ${event.event}`,
            statusText: "EVENT",
            data: event.data,
            headers: { id: event.id || "" },
            responseTime: 0,
            responseSize: event.data?.length || 0,
            contentType: "text/plain",
          });
        });
        unsubscribeMethods.push(unsub);
      }

      // HTTP Streaming Incremental (onLog)
      if (api.onLog) {
        const unsub = api.onLog((data: any) => {
          if (data && data.status === "downloading") return;

          const tabStore = useTabStore.getState();
          if (data && data.isIncremental) {
            tabStore.appendTabLog(data.requestId, data);
          }
        });
        unsubscribeMethods.push(unsub);
      }
    }

    return () => {
      unsubscribeMethods.forEach((unsub) => unsub());
    };
  }, [collection]);
}
