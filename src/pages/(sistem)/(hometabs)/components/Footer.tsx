import { useEffect, useState } from "react";

export default function Footer() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof (window as any).electronAPI?.conect === "function") {
        try {
          const online = await (window as any).electronAPI.conect();
          setIsOnline(online);
        } catch (error) {
          console.error("Erro ao verificar conexão:", error);
          setIsOnline(false);
        }
      }
    };

    checkConnection();

    // Listener para atualizações em tempo real (push do Main)
    let removeListener: (() => void) | undefined;
    if (typeof (window as any).electronAPI?.onNetworkStatus === "function") {
      removeListener = (window as any).electronAPI.onNetworkStatus(
        (status: boolean) => {
          setIsOnline(status);
        },
      );
    }

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  return (
    <div className="w-full flex justify-between text-[0.5rem] font-semibold text-zinc-400 bg-zinc-950/70 p-1 px-3">
      <div className="flex items-center align-center gap-2 p-0.5">
        <span
          className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"} `}
        ></span>
        <span className="text-zinc-500 font-bold uppercase tracking-wider text-center justify-center align-center items-center">
          {isOnline ? "online" : "offline"}
        </span>
      </div>
      <div className="text-xs text-[#cecece]">
        {import.meta.env.VITE_APP_VERSION}
      </div>
    </div>
  );
}