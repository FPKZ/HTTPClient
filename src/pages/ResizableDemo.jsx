import React, { useEffect, useState, useRef } from "react";
import { Terminal } from "lucide-react";

export default function ResizableDemo() {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    window.electronAPI.startActionLogger();
    // Escuta novos logs vindos do processo principal
    const removeListener = window.electronAPI.ipcRenderer.on(
      "new-action-log",
      (logLine) => {
        setLogs((prevLogs) => [...prevLogs, logLine]);
      }
    );

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll sempre que um novo log chega
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleResize = ({ startX, startY }, direction) => {
      const startBounds = {
          x: window.screenX,
          y: window.screenY,
          width: window.outerWidth,
          height: window.outerHeight
      };

      const handleMouseMove = (e) => {
          const deltaX = e.screenX - startX;
          const deltaY = e.screenY - startY;
          
          const newBounds = { ...startBounds };

          if (direction.includes('e')) newBounds.width += deltaX;
          if (direction.includes('s')) newBounds.height += deltaY;
          if (direction.includes('w')) {
              newBounds.width -= deltaX;
              newBounds.x += deltaX;
          }
          if (direction.includes('n')) {
              newBounds.height -= deltaY;
              newBounds.y += deltaY;
          }

          window.electronAPI.resizeWindow(newBounds);
      };

      const handleMouseUp = () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="h-screen w-full bg-[#111111] text-zinc-300 font-mono text-xs flex flex-col overflow-hidden rounded-xl border border-zinc-700/50! shadow-2xl">
      {/* Header estilo Terminal */}
      <div className="titlebar titlebar-drag-region bg-[#212121] px-4 py-2 flex items-center gap-2 border-b border-[#1e1e1e] select-none sticky top-0 z-10 shadow-md">
        <Terminal size={14} className="text-green-500" />
        <span className="font-semibold text-zinc-100">Action Logger</span>
        <div className="ml-auto flex gap-2 no-drag">
          <span 
            onClick={() => setLogs([])}
            title="Limpar Logs"
            className="w-4 h-4 rounded-full bg-green-500 hover:bg-green-600 border border-green-600/40! hover:border-green-500! cursor-pointer transition-colors ease-in-out"
          ></span>
          <span 
            onClick={() => window.electronAPI.startActionLogger()}
            title="Retomar Logs" 
            className="w-4 h-4 rounded-full bg-yellow-500 hover:bg-yellow-600 border border-yellow-600/40! hover:border-yellow-500! cursor-pointer transition-colors ease-in-out"
          ></span>
          <span 
            onClick={() => {window.electronAPI.stopActionLogger(), window.electronAPI.close()}} 
            title="Pausar Logs"
            className="w-4 h-4 rounded-full bg-red-500/70 hover:bg-red-600 border border-red-600/40! hover:border-red-500! cursor-pointer transition-colors ease-in-out"
          ></span>
        </div>
      </div>

      {/* Área de Logs */}
      <div className="permitirSelect flex-1 overflow-y-auto p-2 space-y-1 cursor-text no-drag relative z-10">
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic mt-4 text-center">
            Aguardando logs do sistema...
          </div>
        ) : (
          logs.map((log, index) => {
             // Tenta extrair timestamp e mensagem para colorir diferente (se o formato for [DATA] MSG)
             const parts = log.match(/^(\[.*?\])(.*)/);
             
             if(parts) {
                 return (
                    <div key={index} className="break-words leading-relaxed hover:bg-white/5 px-1 rounded transition-colors">
                      <span className="text-green-400 font-semibold opacity-75">{parts[1]}</span>
                      <span className="text-zinc-300">{parts[2]}</span>
                    </div>
                 )
             }
             
             return (
                <div key={index} className="break-words leading-relaxed hover:bg-white/5 px-1 rounded transition-colors">
                  {log}
                </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Resize Handles - All Directions */}
      <ResizeHandle direction="e" cursor="e-resize" onResize={(d) => handleResize(d, 'e')} />
      <ResizeHandle direction="w" cursor="w-resize" onResize={(d) => handleResize(d, 'w')} />
      <ResizeHandle direction="s" cursor="s-resize" onResize={(d) => handleResize(d, 's')} />
      <ResizeHandle direction="n" cursor="n-resize" onResize={(d) => handleResize(d, 'n')} />
      <ResizeHandle direction="se" cursor="se-resize" onResize={(d) => handleResize(d, 'se')} />
      <ResizeHandle direction="sw" cursor="sw-resize" onResize={(d) => handleResize(d, 'sw')} />
      <ResizeHandle direction="ne" cursor="ne-resize" onResize={(d) => handleResize(d, 'ne')} />
      <ResizeHandle direction="nw" cursor="nw-resize" onResize={(d) => handleResize(d, 'nw')} />
    </div>
  );
}

function ResizeHandle({ direction, cursor, onResize }) {
    const classes = {
        n: "top-0 left-0 right-0 h-1",
        s: "bottom-0 left-0 right-0 h-1",
        e: "top-0 right-0 bottom-0 w-1",
        w: "top-0 left-0 bottom-0 w-1",
        ne: "top-0 right-0 w-3 h-3 z-50",
        nw: "top-0 left-0 w-3 h-3 z-50",
        se: "bottom-0 right-0 w-3 h-3 z-50",
        sw: "bottom-0 left-0 w-3 h-3 z-50"
    };

    return (
        <div 
            style={{ cursor: cursor }}
            className={`absolute ${classes[direction]} no-drag hover:bg-yellow-500/50 transition-colors bg-transparent`}
            onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.screenX;
                const startY = e.screenY;
                onResize({ startX, startY });
            }}
        />
    )
}

function useResizeLogic() {
    // Helper para calcular bounds. Implementação simplificada no componente principal para acessar window
}
