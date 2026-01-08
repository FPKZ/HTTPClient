import { Spinner } from "react-bootstrap";
import { Progress } from "../components/ui/progress";
import { useEffect, useState } from "react";

export default function UpdatePage() {
  const [status, setStatus] = useState("checking"); // checking, available, downloading, ready
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Escutando eventos do Main Process
    // Registra os ouvintes e guarda a função de limpeza
    const removeAvailable = window.electronAPI.ipcRenderer.on(
      "update-available",
      () => {
        setStatus("available");
      }
    );

    const removeProgress = window.electronAPI.ipcRenderer.on(
      "download-progress",
      (percent) => {
        setStatus("downloading");
        setProgress(percent);
      }
    );

    const removeDownloaded = window.electronAPI.ipcRenderer.on(
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

  // if (status === 'checking') return null;

  return (
    <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-[#1e1e1e]">
      <div
        className="position-relative d-flex justify-content-center align-items-center mb-4"
        style={{ width: "120px", height: "120px" }}
      >
        {status === "downloading" && (
          <Spinner
            animation="border"
            variant="light"
            className="position-absolute"
            style={{
              width: "100%",
              height: "100%",
              borderWidth: "5px",
              borderRadius: "50%",
              opacity: 0.5,
              animationDuration: "2s", // Mais lento e suave
            }}
          />
        )}
        <img
          src="./icon1.png"
          width="90"
          className="position-relative animate-pulse"
        />
      </div>

      {status === "downloading" && (
        <div className="w-full max-w-[200px]">
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
