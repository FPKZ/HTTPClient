import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useTabStore from "../store/useTabStore";

// Components
import DropZone from "../components/DropZone";
import HistoryList from "../components/history/HistoryList";
import ImportCollectionModal from "../components/modals/ImportCollectionModal";
import NovaCollectionModal from "../components/modals/NovaCollectionModal";

// Hooks
import { useQuickExit } from "../hooks/useQuickExit";
import { useHistory } from "../hooks/useHistory";

/**
 * UploadPage (Refatorada)
 * SRP: Focada no carregamento de novos arquivos e visualização do histórico.
 */
function UploadPage() {
  // eslint-disable-next-line no-unused-vars
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  const { history, handleLoadHistory, handleDeleteHistoryItem } = useHistory();

  // 1. Inicialização e Listeners IPC
  useQuickExit();

  useEffect(() => {
    if (window.electronAPI) {
      // Logs de conversão
      const unLog = window.electronAPI.onLog?.((msg) =>
        setLogs((p) => [...p, msg]),
      );

      // Finalização da conversão
      const unFinished = window.electronAPI.onFinished?.((result) => {
        if (result.success && result.results?.length > 0) {
          const data = result.results[0];
          // Carrega diretamente no store
          useTabStore.getState().loadCollection(data.raw);
          navigate("/");
        }
      });

      return () => {
        unLog?.();
        unFinished?.();
      };
    }
  }, [navigate]);

  const startConversion = (inputPath, isFile) => {
    window.electronAPI?.startConversion({ inputPath, isFile });
  };

  const handleFolderSelect = async () => {
    const path = await window.electronAPI?.selectFile();
    if (path) startConversion(path, true);
  };

  return (
    <div className="d-flex flex-col h-100 position-relative overflow-hidden">
      <Container
        fluid
        className="d-flex flex-col p-3 h-full mb-4"
        style={{ overflow: "hidden", maxWidth: "900px" }}
      >
        <div className="my-auto w-full flex flex-col min-h-0 max-h-full">
          <div className="flex shrink-0 flex-col justify-center gap-2">
            <h1 className="text-center mb-4">HTTPClient</h1>

            <div className="grid grid-cols-2 h-20 gap-2 mb-4">
              <NovaCollectionModal>
                <div
                  className="
                    flex w-full h-full py-2 px-4
                    rounded items-center justify-center cursor-pointer
                    bg-[#1b1b1b] border border-[#313131]!
                    hover:bg-[#292929] active:bg-[#1d1d1d]
                    transition-colors
                    text-gray-300 font-medium
                    "
                >
                  Nova Coleção
                </div>
              </NovaCollectionModal>

              <ImportCollectionModal
                onImport={(path) => startConversion(path, true)}
                onFolderSelect={handleFolderSelect}
              >
                <div
                  className="
                    flex w-full h-full py-2 px-4
                    rounded items-center justify-center cursor-pointer
                    bg-[#1b1b1b] border border-[#313131]!
                    hover:bg-[#292929] active:bg-[#1d1d1d]
                    transition-colors
                    text-gray-300 font-medium
                    "
                >
                  Importar Coleção
                </div>
              </ImportCollectionModal>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <HistoryList
              history={history}
              onLoad={handleLoadHistory}
              onDelete={handleDeleteHistoryItem}
            />
          </div>
        </div>
      </Container>

      <div className="position-absolute bottom-0 end-0 px-2">
        <span className="text-xs text-[#cecece]">
          {import.meta.env.VITE_APP_VERSION}
        </span>
      </div>
    </div>
  );
}

export default UploadPage;
