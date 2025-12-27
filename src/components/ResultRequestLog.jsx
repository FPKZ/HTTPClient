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
          <div className="mt-2 bg-zinc-900/50 p-2 rounded d-flex justify-content-center">
            <img
              src={`data:${contentType};base64,${data}`}
              alt="Response"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "contain",
              }}
              className="rounded shadow-sm"
            />
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
      className="shrink w-100 h-100 bg-black rounded p-3 overflow-auto"
      style={{
        fontFamily: "'Fira Code', monospace",
      }}
    >
      {logs && logs.length > 0 ? (
        logs.map((log, i) => <div key={i}>{formatLog(log)}</div>)
      ) : (
        <div className="text-zinc-700 italic">Aguardando requisição...</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
