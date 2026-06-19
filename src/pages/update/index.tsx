import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import icons from "@/assets/icons";

export default function UpdatePage() {
  const [status, setStatus] = useState("checking"); // checking, available, downloading, ready
  const [progress, setProgress] = useState(0);

  const { roundIcon } = icons();

  useEffect(() => {
    // Escutando eventos do Main Process
    // Registra os ouvintes e guarda a função de limpeza
    const removeAvailable = (window as any).electronAPI.ipcRenderer.on(
      "update-available",
      () => {
        setStatus("available");
      }
    );

    const removeProgress = (window as any).electronAPI.ipcRenderer.on(
      "download-progress",
      (percent: number) => {
        setStatus("downloading");
        setProgress(percent);
      }
    );

    const removeDownloaded = (window as any).electronAPI.ipcRenderer.on(
      "update-downloaded",
      () => {
        setStatus("ready");
      }
    );

    // Limpeza ao desmontar o componente
    return () => {
      if (removeAvailable) removeAvailable();
      if (removeProgress) removeProgress();
      if (removeDownloaded) removeDownloaded();
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-full bg-[#1e1e1e]">
      <div
        className="relative flex justify-center items-center mb-4"
        style={{ width: "120px", height: "120px" }}
      >
        {status === "downloading" && (
          <div
            className="absolute inset-0 border-[5px] border-white border-t-transparent rounded-full animate-spin opacity-50"
            style={{ animationDuration: "2s" }}
          />
        )}
        <div className="animate-pulse">
          {roundIcon()}
        </div>
      </div>

      {status === "downloading" && (
        <div className="w-full max-w-50">
          <Progress
            value={progress}
            className="h-1"
            progressColor="bg-[#f1f1f1]"
          />
          <small className="text-zinc-500 mt-2 block text-center">
            Atualizando... {Math.round(progress)}%
          </small>
        </div>
      )}
    </div>
  );
}
