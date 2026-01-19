import React, { useEffect, useRef } from "react";

export default function ResultRequestLog({ logs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const formatLog = (log) => {
    if (!log || typeof log !== "object" || !log.status) {
      return <div className="text-zinc-500">{String(log)}</div>;
    }

    const { status, statusText, headers, data, isError, isImage, contentType } =
      log;
    const statusColor = isError ? "text-red-500" : "text-green-400";
    const mimeType = contentType
      ? contentType.split(";")[0].trim()
      : "text/plain";

    return (
      <div className="mb-0 font-mono text-xs">
        {/* Status Line */}
        <div className={`${statusColor} font-bold mb-1`}>
          HTTP/1.1 {status} {statusText}
        </div>

        {/* Headers */}
        <div className="text-zinc-400 mb-2">
          {Object.entries(headers).map(([key, value]) => (
            <div key={key}>
              <span className="text-zinc-500">{key}:</span> {value}
            </div>
          ))}
        </div>

        {/* Body */}
        {isImage ? (
          <div className="mt-2 bg-zinc-900/50 p-2 rounded d-flex flex-column align-items-center gap-2">
            <img
              src={`data:${mimeType};base64,${data}`}
              alt="Response"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "contain",
              }}
              className="rounded shadow-sm border border-zinc-800"
            />
            <span className="text-[10px] text-zinc-500 uppercase font-bold">
              {mimeType} ({Math.round((data.length * 0.75) / 1024)} KB)
            </span>
          </div>
        ) : (
          <pre
            className="permitirSelect text-gray-300 bg-zinc-900/50 p-2 rounded overflow-x-auto"
            style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
          >
            {typeof data === "object"
              ? JSON.stringify(data, null, 2)
              : String(data)}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div
      className="w-100 min-h-full bg-black rounded p-4 mb-6"
      style={{
        fontFamily: "'Fira Code', monospace",
      }}
    >
      {logs && logs.length > 0 ? (
        logs.map((log, i) => <div key={i}>{formatLog(log)}</div>)
      ) : (
        <div className="text-zinc-700 italic">Aguardando requisição...</div>
      )}
      <div ref={bottomRef} className="pb-4" />
    </div>
  );
}
