/**
 * Utilitário de Tratamento de Erros Globais
 * Centraliza a lógica de captura e filtragem de erros do Renderer.
 */

export function setupGlobalErrorHandlers() {
  // Global error handling for Renderer
  window.onerror = (message, source, lineno, colno, error) => {
    // Ignorar erros inofensivos de ResizeObserver que ocorrem em layouts complexos
    if (
      message ===
        "ResizeObserver loop completed with undelivered notifications." ||
      message === "ResizeObserver loop limit exceeded"
    ) {
      return;
    }

    console.error("Global Error (Caught):", {
      message,
      source,
      lineno,
      colno,
      error,
    });

    if (window.electronAPI?.ipcRenderer) {
      window.electronAPI.ipcRenderer.send("log-error", {
        type: "window.onerror",
        message,
        stack: error?.stack,
      });
    }
  };

  window.onunhandledrejection = (event) => {
    const reason = event.reason?.message || String(event.reason);

    // Ignorar erros inofensivos de ResizeObserver em promessas se ocorrerem
    if (
      reason.includes(
        "ResizeObserver loop completed with undelivered notifications",
      ) ||
      reason.includes("ResizeObserver loop limit exceeded")
    ) {
      return;
    }

    console.error("Unhandled Rejection (Caught):", event.reason);

    if (window.electronAPI?.ipcRenderer) {
      window.electronAPI.ipcRenderer.send("log-error", {
        type: "unhandledrejection",
        message: reason,
        stack: event.reason?.stack,
      });
    }
  };
}
