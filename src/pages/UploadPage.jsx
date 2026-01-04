import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Components
import DropZone from "../components/DropZone";
import HistoryList from "../components/history/HistoryList";
import ImportCollectionModal from "../components/modals/ImportCollectionModal";

/**
 * UploadPage (Refatorada)
 * SRP: Focada no carregamento de novos arquivos e visualização do histórico.
 */
function UploadPage() {
  const [history, setHistory] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  // 1. Inicialização e Listeners IPC
  useEffect(() => {
    if (window.electronAPI) {
      // Carrega histórico
      window.electronAPI.getHistory?.().then((data) => setHistory(data || []));

      // Logs de conversão
      const unLog = window.electronAPI.onLog?.((msg) => setLogs((p) => [...p, msg]));

      // Finalização da conversão
      const unFinished = window.electronAPI.onFinished?.((result) => {
        if (result.success && result.results?.length > 0) {
          const data = result.results[0];
          navigate("/", {
            state: {
              telas: data.axios,
              http: data.http,
              collectionName: data.name,
            },
          });
        }
      });

      return () => {
        unLog?.();
        unFinished?.();
      };
    }
  }, [navigate]);

  // 2. Handlers
  const handleLoadHistory = async (item) => {
    if (!window.electronAPI) return;
    const content = await window.electronAPI.loadCollection(item.file);
    if (content) {
      navigate("/", {
        state: {
          id: item.id,
          telas: content.axios,
          http: content.http,
          collectionName: item.collectionName,
        },
      });
    }
  };

  const handleDeleteHistoryItem = async (e, id) => {
    if (window.confirm("Tem certeza que deseja remover este item do histórico?")) {
      await window.electronAPI.deleteHistoryItem(id);
      const updatedHistory = await window.electronAPI.getHistory();
      setHistory(updatedHistory || []);
    }
  };

  const startConversion = (inputPath, isFile) => {
    window.electronAPI?.startConversion({ inputPath, isFile });
  };

  const handleFolderSelect = async () => {
    const path = await window.electronAPI?.selectFile();
    if (path) startConversion(path, true);
  };

  return (
    <div className="d-flex flex-column h-100 position-relative">
      <Container
        fluid
        className="d-flex flex-column justify-center flex-grow-1 p-3 gap-3"
        style={{ overflow: "hidden", maxWidth: "900px" }}
      >
        <h1 className="text-center mb-4">HTTPClient</h1>

        <div className="grid grid-cols-2 h-20 gap-2 mb-4">
          <div 
            className="
              flex w-full h-full py-2 px-4
              rounded items-center justify-center cursor-pointer
              bg-[#1b1b1b] border !border-[#313131]
              hover:bg-[#292929] active:bg-[#1d1d1d]
              transition-colors
              text-gray-300 font-medium
              ">
              Nova Collection
          </div>

          <ImportCollectionModal 
            onImport={(path) => startConversion(path, true)}
            onFolderSelect={handleFolderSelect}
          >
            <div 
              className="
                flex w-full h-full py-2 px-4
                rounded items-center justify-center cursor-pointer
                bg-[#1b1b1b] border !border-[#313131]
                hover:bg-[#292929] active:bg-[#1d1d1d]
                transition-colors
                text-gray-300 font-medium
                ">
                Importar Collection
            </div>
          </ImportCollectionModal>
        </div>

        <HistoryList
          history={history}
          onLoad={handleLoadHistory}
          onDelete={handleDeleteHistoryItem}
        />
      </Container>
      
      <div className="position-absolute bottom-0 end-0 px-2">
        <span className="text-xs text-[#cecece]">v1.0.11</span>
      </div>
    </div>
  );
}

export default UploadPage;
