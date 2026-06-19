import React, { useEffect, useRef } from 'react';

interface LogConsoleProps {
  logs: string[];
}

const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="log-container grow bg-black border border-zinc-600 rounded p-2 overflow-auto" style={{ fontFamily: 'monospace', fontSize: '12px', minHeight: '100px', maxHeight: '300px' }}>
      {logs.length === 0 && <div className="text-zinc-500">Aguardando arquivos...</div>}
      {logs.map((log, index) => (
        <div key={index} className="log-entry border-b border-zinc-700 pb-1 mb-1 break-words">
          {log}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default LogConsole;
