import { Buffer } from "buffer";
import process from "process";

window.Buffer = Buffer;
window.process = process;

import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css"; // Imported here to avoid CSS order issues
import App from "./App.jsx";
import "./index.css";
import { HashRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

import { setupGlobalErrorHandlers } from "./utils/error-handler";

// Inicializa o tratamento global de erros e filtros de ResizeObserver
setupGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
