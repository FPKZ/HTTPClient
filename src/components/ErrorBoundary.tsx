import React, { ErrorInfo } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("React Error Boundary catched:", error, errorInfo);

    // Tenta avisar o Electron sobre o erro se a API estiver disponível
    if ((window as any).electronAPI && (window as any).electronAPI.ipcRenderer) {
      (window as any).electronAPI.ipcRenderer.send("log-error", {
        message: error.message,
        stack: error.stack,
        info: errorInfo?.componentStack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-[#1e1e1e] text-white p-8 overflow-auto">
          <div className="max-w-2xl w-full bg-[#2d2d2d] border border-red-900/50! rounded-lg p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-500">
                  Ocorreu um erro de renderização
                </h1>
                <p className="text-zinc-400 text-sm">
                  O aplicativo encontrou um problema inesperado e não pôde
                  continuar.
                </p>
              </div>
            </div>

            <div className="bg-black/40 rounded p-4 mb-6 overflow-auto max-h-[300px] border border-zinc-800!">
              <p className="text-red-400 font-mono text-sm mb-2 font-bold">
                {this.state.error?.toString()}
              </p>
              <pre className="text-zinc-500 font-mono text-[11px] leading-relaxed">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-semibold transition-colors"
              >
                <RefreshCcw size={16} />
                Recarregar App
              </button>

              <button
                onClick={() => {
                  if ((window as any).electronAPI) (window as any).electronAPI.forceClose();
                }}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-500/30! rounded text-sm font-semibold transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
