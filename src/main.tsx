import { Buffer } from "buffer";
import process from "process";

(window as any).Buffer = Buffer;
(window as any).process = process;

import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";
import "@/index.css";
import { HashRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";

import { setupGlobalErrorHandlers } from "@/utils/error-handler";

// Inicializa o tratamento global de erros e filtros de ResizeObserver
setupGlobalErrorHandlers();

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <App />
        </HashRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
