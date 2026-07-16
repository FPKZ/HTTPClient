import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, ChevronDown, Copy, Check, ArrowDown } from "lucide-react";
import CodeViewer from "./CodeViewer";

/**
 * Helper para formatar o tamanho da resposta de forma amigável (B, KB, MB)
 */
const formatSize = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface LogEntryData {
  status: number | string;
  headers: Record<string, string>;
  data: any;
  isImage?: boolean;
  isPDF?: boolean;
  isAudio?: boolean;
  isVideo?: boolean;
  contentType?: string;
  responseSize?: number;
}

interface LogEntryProps {
  log: LogEntryData | string | any;
  activeView: "json" | "headers" | "preview" | string;
}

/**
 * LogEntry
 * Renderiza uma única entrada de log com seletor de abas próprio.
 */
const LogEntry = React.memo(function LogEntry({ log, activeView }: LogEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

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
  } = log as LogEntryData;

  const isWsOrSseLog = 
    log.status === "SEND" || 
    log.status === "RECV" || 
    log.status === "INFO" || 
    (typeof log.status === "string" && log.status.startsWith("SSE:"));

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isWsOrSseLog) {
    const timestamp = log.timestamp 
      ? new Date(log.timestamp).toLocaleTimeString()
      : new Date().toLocaleTimeString();

    let statusBg = "bg-zinc-800 text-zinc-400 border-zinc-800/50";
    let borderStyle = "border-zinc-800/50";
    let direction = "←";
    let isSystem = false;
    
    if (log.status === "SEND") {
      statusBg = "bg-purple-500/5 text-purple-400 border-purple-500/20";
      borderStyle = "border-purple-500/20";
      direction = "→ SENT";
    } else if (log.status === "RECV") {
      statusBg = "bg-emerald-500/5 text-emerald-400 border-emerald-500/20";
      borderStyle = "border-emerald-500/20";
      direction = "← RECEIVED";
    } else if (log.status === "INFO") {
      statusBg = "bg-zinc-900/30 text-zinc-500 border-zinc-800/40 italic";
      borderStyle = "border-zinc-800/40";
      direction = "ℹ SYSTEM";
      isSystem = true;
    } else if (typeof log.status === "string" && log.status.startsWith("SSE:")) {
      statusBg = "bg-blue-500/5 text-blue-400 border-blue-500/20";
      borderStyle = "border-blue-500/20";
      direction = `⚡ SSE [${log.status.substring(4)}]`;
    }

    if (isSystem) {
      return (
        <div className={`p-2.5 mx-3 my-1 rounded border ${borderStyle} ${statusBg} font-mono text-[0.75rem] flex flex-col gap-1 transition-all duration-150 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wider opacity-60">
            <span>{direction}</span>
            <span>{timestamp}</span>
          </div>
          <div className="wrap-break-word mt-1 select-text whitespace-pre-wrap text-zinc-400">
            {typeof data === "object" ? JSON.stringify(data, null, 2) : String(data)}
          </div>
        </div>
      );
    }

    // Tenta decodificar/identificar se é JSON
    let isJson = false;
    let prettyValue = "";
    try {
      if (typeof data === "object" && data !== null) {
        prettyValue = JSON.stringify(data, null, 2);
        isJson = true;
      } else if (typeof data === "string") {
        const trimmed = data.trim();
        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
          const parsed = JSON.parse(data);
          prettyValue = JSON.stringify(parsed, null, 2);
          isJson = true;
        } else {
          prettyValue = data;
        }
      } else {
        prettyValue = String(data);
      }
    } catch (e) {
      prettyValue = String(data);
    }

    const inlineValue = typeof data === "object"
      ? JSON.stringify(data)
      : String(data).replace(/\s+/g, " ");

    const lineCount = prettyValue.split("\n").length;
    const calculatedHeight = Math.max(120, lineCount * 16 + 12);

    return (
      <div 
        className={`mx-3 my-1 rounded border ${borderStyle} ${statusBg} font-mono text-[0.75rem] flex flex-col transition-all duration-150 hover:bg-zinc-800/25 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-250`}
      >
        {/* Header e linha de texto compactada (clicaveis para expandir/minimizar) */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer select-none"
        >
          {/* Header do card de log */}
          <div className="flex justify-between items-center px-2.5 py-1.5 bg-zinc-950/20">
            <div className="flex items-center gap-1.5 font-bold tracking-wider">
              <span className="text-zinc-500">
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
              <span className="text-[10px]">{direction}</span>
            </div>
            <span className="text-[10px] opacity-60">{timestamp}</span>
          </div>

          {/* Visualização fechada: linha compactada */}
          {!isExpanded && (
            <div className="px-2.5 py-2 break-all text-zinc-300 truncate max-w-full">
              {inlineValue}
            </div>
          )}
        </div>

        {/* Visualização expandida rica */}
        {isExpanded && (
          <div 
            onClick={(e) => e.stopPropagation()} // Impede o clique de propagar e fechar o log
            className="flex flex-col border-t border-zinc-800/30 cursor-default"
          >
            {/* Toolbar do visualizador */}
            <div className="flex justify-between items-center px-2.5 py-1 bg-zinc-950/40 border-b border-zinc-800/20 text-[10px] select-none text-zinc-500 font-bold uppercase tracking-wider">
              <span>{isJson ? "JSON" : "Text"}</span>
              <button
                onClick={(e) => handleCopy(e, prettyValue)}
                className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={11} className="text-green-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    Copiar
                  </>
                )}
              </button>
            </div>
            {/* Editor Monaco adaptativo sem scroll vertical interno */}
            <div style={{ height: `${calculatedHeight}px` }} className="w-full bg-zinc-950/10 p-1">
              <CodeViewer 
                value={prettyValue} 
                language={isJson ? "json" : "text"} 
                lineNumbers="on" 
                config={{ 
                  renderLineHighlight: "all",
                  fontSize: 11,
                  lineHeight: 16,
                  scrollbar: { vertical: "hidden", horizontal: "visible", alwaysConsumeMouseWheel: false },
                  padding: { top: 4, bottom: 4 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const mimeType = contentType
    ? contentType.split(";")[0].trim()
    : "text/plain";

  const renderTabContent = () => {
    switch (activeView) {
      case "json":
        return (
          <div className="h-full w-full">
            <CodeViewer 
              value={data} 
              language="json" 
              lineNumbers="off" 
              config={{ renderLineHighlight: "none" }}
            />
          </div>
        );

      case "headers":
        return (
          <div className="text-zinc-400 font-mono text-[0.7rem] p-3">
            {headers && Object.entries(headers).map(([key, value]) => (
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
                onLoad={(e) => URL.revokeObjectURL((e.target as any).src)}
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
                onLoadedData={(e) => URL.revokeObjectURL((e.target as any).src)}
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
                onLoad={(e) => URL.revokeObjectURL((e.target as any).src)}
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
});

interface ResultRequestLogProps {
  logs: any[];
  activeView: string;
}

export default function ResultRequestLog({ logs, activeView }: ResultRequestLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<any>(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const isAutoScrollActive = useRef(true);

  useEffect(() => {
    if (isAutoScrollActive.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [logs]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (scrollTimeoutRef.current) return;

    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      
      const atBottom = scrollHeight - scrollTop - clientHeight <= 45;
      isAutoScrollActive.current = atBottom;
      
      setShowScrollBottomBtn((prev) => {
        const next = !atBottom;
        return prev !== next ? next : prev;
      });
    }, 100);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    isAutoScrollActive.current = true;
    setShowScrollBottomBtn(false);
  };

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full p-2 m-0 overflow-y-auto"
        style={{
          fontFamily: "'Fira Code', monospace",
        }}
      >
        {logs && logs.length > 0 ? (
          logs.map((log, i) => (
            <LogEntry key={log.id || i} log={log} activeView={activeView} />
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
        <div ref={bottomRef} />
      </div>

      {showScrollBottomBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-full border border-zinc-700/60 text-[10px] font-bold tracking-wider flex items-center gap-1.5 shadow-xl transition-all duration-200 z-50 uppercase cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <ArrowDown size={11} />
          Mais mensagens
        </button>
      )}
    </div>
  );
}
