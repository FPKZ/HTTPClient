import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css"; // Imported here to avoid CSS order issues
import App from "./App.jsx";
import "./index.css";
import { HashRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

// Global error handling for Renderer
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global Error:", { message, source, lineno, colno, error });
  if (window.electronAPI?.ipcRenderer) {
    window.electronAPI.ipcRenderer.send("log-error", {
      type: "window.onerror",
      message,
      stack: error?.stack,
    });
  }
};

window.onunhandledrejection = (event) => {
  console.error("Unhandled Rejection:", event.reason);
  if (window.electronAPI?.ipcRenderer) {
    window.electronAPI.ipcRenderer.send("log-error", {
      type: "unhandledrejection",
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
    });
  }
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
