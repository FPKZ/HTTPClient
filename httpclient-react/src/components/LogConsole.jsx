import React, { useEffect, useRef } from 'react';

const LogConsole = ({ logs }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="log-container flex-grow-1 bg-black border border-secondary rounded p-2 overflow-auto" style={{ fontFamily: 'monospace', fontSize: '12px', minHeight: '100px', maxHeight: '300px' }}>
      {logs.length === 0 && <div className="text-secondary">Aguardando arquivos...</div>}
      {logs.map((log, index) => (
        <div key={index} className="log-entry border-bottom border-secondary pb-1 mb-1 text-break">
          {log}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default LogConsole;
