import React, { useEffect, useRef } from "react";
import CodeViewer from "./CodeViewer";

/**
 * Helper para formatar o tamanho da resposta de forma amigável (B, KB, MB)
 */
const formatSize = (bytes) => {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * LogEntry
 * Renderiza uma única entrada de log com seletor de abas próprio.
 */
function LogEntry({ log, activeView }) {
  if (!log || typeof log !== "object" || !log.status) {
    return <div className="text-zinc-500 mb-2">{String(log)}</div>;
  }

  const {
    headers,
    data,
    isImage,
    isPDF,
    isAudio,
    isVideo,
    contentType,
    responseSize,
  } = log;

  const mimeType = contentType
    ? contentType.split(";")[0].trim()
    : "text/plain";

  const renderTabContent = () => {
    switch (activeView) {
      case "json":
        return (
          <div className="h-full w-full">
            <CodeViewer value={data} language="json" lineNumbers="off" config={{ renderLineHighlight: "none" }}/>
          </div>
        );

      case "headers":
        return (
          <div className="text-zinc-400 font-mono text-[0.7rem] p-3">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex gap-2 mb-1">
                <span className="text-zinc-500 font-bold min-w-[150px] shrink-0 uppercase tracking-tighter text-[9px]">
                  {key}:
                </span>
                <span className="text-zinc-300 break-all">{value}</span>
              </div>
            ))}
          </div>
        );

      case "preview":
        if (isImage) {
          return (
            <div className="flex flex-col p-3 items-center justify-center">
              <img
                src={`data:${mimeType};base64,${data}`}
                alt="Response"
                style={{
                  maxWidth: "100%",
                  maxHeight: "20rem",
                  objectFit: "contain",
                }}
                className="shadow-lg"
              />
              <span className="text-[0.7rem]! text-zinc-500 uppercase font-bold tracking-widest">
                {mimeType} • {formatSize(responseSize)}
              </span>
            </div>
          );
        }
        if (isPDF) {
          return (
            <div className="h-full overflow-hidden">
              <iframe
                title="PDF Viewer"
                src={
                  URL.createObjectURL(
                    new Blob(
                      [
                        new Uint8Array(
                          atob(data)
                            .split("")
                            .map((c) => c.charCodeAt(0)),
                        ),
                      ],
                      { type: "application/pdf" },
                    ),
                  ) + "#navpanes=0"
                }
                style={{ width: "100%", height: "100%", border: "none" }}
                onLoad={(e) => URL.revokeObjectURL(e.target.src)}
              />
            </div>
          );
        }
        if (isAudio || isVideo) {
          const Tag = isAudio ? "audio" : "video";
          return (
            <div className="bg-zinc-900/50 p-6 flex flex-col items-center gap-4">
              <Tag
                controls
                className="w-full max-h-[500px]"
                src={URL.createObjectURL(
                  new Blob(
                    [
                      new Uint8Array(
                        atob(data)
                          .split("")
                          .map((c) => c.charCodeAt(0)),
                      ),
                    ],
                    { type: contentType },
                  ),
                )}
                onLoadedData={(e) => URL.revokeObjectURL(e.target.src)}
              />
              <span className="text-[10px] text-zinc-500 uppercase font-bold">
                {contentType} • {formatSize(responseSize)}
              </span>
            </div>
          );
        }
        if (mimeType.includes("text/html")) {
          return (
            <div className="h-full overflow-hidden shadow-inner">
              <iframe
                title="HTML Preview"
                src={URL.createObjectURL(
                  new Blob([data], { type: "text/html" }),
                )}
                style={{ width: "100%", height: "100%", border: "none" }}
                sandbox="allow-scripts"
                onLoad={(e) => URL.revokeObjectURL(e.target.src)}
              />
            </div>
          );
        }
        return (
          <div className="text-zinc-600 italic text-center py-10">
            Pré-visualização não disponível para este tipo de conteúdo.
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 h-full animate-in fade-in zoom-in-95 duration-200">
      {renderTabContent()}
    </div>
  );
}

export default function ResultRequestLog({ logs, activeView }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div
      className="flex-1 w-100 h-full p-0 m-0 overflow-y-auto"
      style={{
        fontFamily: "'Fira Code', monospace",
      }}
    >
      {logs && logs.length > 0 ? (
        logs.map((log, i) => (
          <LogEntry key={i} log={log} activeView={activeView} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-zinc-800 italic gap-2">
          <div className="w-12 h-12 rounded-full border border-zinc-800/30! flex items-center justify-center opacity-20">
            <span className="text-2xl">?</span>
          </div>
          <span className="text-xs! uppercase tracking-widest font-bold">
            Aguardando requisição...
          </span>
        </div>
      )}
      {/* <div ref={bottomRef} className="h-4" /> */}
    </div>
  );
}
