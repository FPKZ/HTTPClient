import React, { useEffect } from "react";
import { Container, Button, Tab, Nav, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useTabStore from "../store/useTabStore";

// Components
import DropZone from "../components/DropZone";
import HistoryList from "../components/history/HistoryList";
import ImportCollectionModal from "../components/modals/ImportCollectionModal";
import NovaCollectionModal from "../components/modals/NovaCollectionModal";
// import icons from "../assets/icons";
import { LogOut } from "lucide-react";

// Hooks
import { useQuickExit } from "../hooks/useQuickExit";
import { useHistory } from "../hooks/useHistory";

/**
 * UploadPage (Refatorada)
 * SRP: Focada no carregamento de novos arquivos e visualização do histórico.
 */
function UploadPage() {

  const navigate = useNavigate();

  const {
    history,
    handleLoadHistory,
    handleDeleteHistoryItem,
    handleDeleteAllHistory,
  } = useHistory();

  // const { fullLogo } = icons();

  // 1. Inicialização e Listeners IPC
  useQuickExit();

  useEffect(() => {
    if (window.electronAPI) {

      // Finalização da conversão
      const unFinished = window.electronAPI.onFinished?.((result) => {
        if (result.success && result.results?.length > 0) {
          const data = result.results[0];
          // Carrega diretamente no store
          window.electronAPI.logAction("Carregando coleção: " + data.raw.name);
          useTabStore.getState().loadCollection(data.raw);
          navigate("/");
        }
      });

      return () => {
        unFinished?.();
      };
    }
  }, [navigate]);

  const startConversion = (inputPath, isFile) => {
    window.electronAPI?.startConversion({ inputPath, isFile });
  };

  const handleFolderSelect = async () => {
    const path = await window.electronAPI?.selectFile();
    window.electronAPI.logAction("Importando coleção: " + path);
    if (path) startConversion(path, true);
  };

  return (
    <div className="d-flex h-100 position-relative overflow-hidden">

      <div className="flex flex-col align-center w-[25%] mb-4 border-r border-[#313131] position-relative">
        <div className="flex flex-col items-center justify-center my-4 gap-2">
          {/* {fullLogo()} */}
          <div className="w-30 h-30 rounded-full flex items-center justify-center bg-[#ffc107] overflow-hidden">
            <span className="text-[3rem] font-extrabold">LF</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[1rem] font-extrabold">Luis Felipe</span>
            <span className="text-[0.8rem] text-zinc-500">luisfelipe@prefeitura.sp.gov.br</span>
          </div>
        </div>

        <div className="flex flex-col px-3 gap-2.5">
          <NovaCollectionModal>
            <div className="flex w-full h-full py-2 px-4 rounded items-center justify-center cursor-pointer bg-[#1b1b1b] border border-[#313131]! hover:bg-[#292929] active:bg-[#1d1d1d] transition-colors text-gray-300 font-bold">
              Nova Coleção
            </div>
          </NovaCollectionModal>
          <ImportCollectionModal
            onImport={(path) => startConversion(path, true)}
            onFolderSelect={handleFolderSelect}
          >
            <div className="flex w-full h-full py-2 px-4 rounded items-center justify-center cursor-pointer bg-[#1b1b1b] border border-[#313131]! hover:bg-[#292929] active:bg-[#1d1d1d] transition-colors text-gray-300 font-bold">
              Importar Coleção
            </div>
          </ImportCollectionModal>
        </div>

        <div className="flex justify-center position-absolute bottom-0 w-full px-4">
          <div
            className="
              p-1 mt-2 w-full flex items-center justify-center gap-2
              text-[1rem] font-bold text-[#cecece]
              bg-red-500/90 hover:bg-red-500/80 active:bg-red-500/70 transition-colors
              rounded cursor-pointer outline-none
              group
            "
            onClick={() => navigate("/login")}
          >
            <span className="pt-0.5">Sair</span>
            <LogOut size={15} className="stroke-3" />
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full h-full p-4 justify-center">
        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
          <div className="flex w-full justify-center text-xs">
            <Nav variant="underline" className="flex custom-tabs">
              <Nav.Item>
                <Nav.Link eventKey="first">Histórico</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="second">Configurações</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
          <div className="flex w-full h-full px-12 py-4 justify-center">
            <Tab.Content className="flex w-full h-full justify-center">
              <Tab.Pane
                eventKey="first"
                className="flex w-full h-full justify-center"
              >
                <div className="flex-1 min-h-0">
                  <HistoryList
                    history={history}
                    onLoad={handleLoadHistory}
                    onDelete={handleDeleteHistoryItem}
                    onAllDelete={handleDeleteAllHistory}
                  />
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="second">s{/* <Sonnet /> */}</Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </div>

      {/* <Container
        fluid
        className="d-flex flex-col p-3 h-full mb-4"
        style={{ overflow: "hidden", maxWidth: "900px" }}
      >
        <div className="my-auto w-full flex flex-col min-h-0 max-h-full">
          <div className="flex shrink-0 flex-col justify-center gap-2">

            <div className="flex justify-center mb-4">
              {fullLogo()}
            </div>

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
              onAllDelete={handleDeleteAllHistory}
            />
          </div>
        </div>
      </Container> */}

      <div className="position-absolute bottom-0 end-0 px-2">
        <span
          className="text-xs text-[#cecece]"
          onClick={() => navigate("/login")}
        >
          {import.meta.env.VITE_APP_VERSION}
        </span>
      </div>
    </div>
  );
}

export default UploadPage;
