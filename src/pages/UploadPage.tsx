import React, { useEffect } from "react";
import { Tab, Nav, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useTabStore from "../store/useTabStore";
import useUserStore from "../store/useUserStore";

// Components
import HistoryList from "../components/history/HistoryList";
import ImportCollectionModal from "../components/modals/ImportCollectionModal";
import NovaCollectionModal from "../components/modals/NovaCollectionModal";
import { ArrowRight, LogOut } from "lucide-react";

// Hooks
import { useQuickExit } from "../hooks/useQuickExit";
import { useHistory } from "../hooks/useHistory";

// import img from "../assets/icon1.png";

/**
 * UploadPage (Refatorada)
 * SRP: Focada no carregamento de novos arquivos e visualização do histórico.
 */
function UploadPage() {
  const user = useUserStore((state) => state.user);

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
      const unFinished = window.electronAPI.onFinished?.((result: any) => {
        if (result.success && result.results?.length > 0) {
          const data = result.results[0];
          // Carrega diretamente no store
          window.electronAPI.logAction("Carregando coleção: " + data.raw.name);
          useTabStore.getState().loadCollection(data.raw);
          navigate("/home");
        }
      });

      return () => {
        unFinished?.();
      };
    }
  }, [navigate]);

  const startConversion = (inputPath: string | string[], isFile: boolean) => {
    window.electronAPI?.startConversion({ inputPath, isFile });
  };

  const handleFolderSelect = async () => {
    const path = await window.electronAPI?.selectFile();
    window.electronAPI.logAction("Importando coleção: " + path);
    if (path) startConversion(path, true);
  };

  return (
    <div className="d-flex h-100 position-relative overflow-hidden">
      <Row className="w-full m-0 h-100">
        <Col
          xs={5}
          md={4}
          lg={3}
          className="flex flex-col h-100 border-r border-[#313131] position-relative p-0"
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col">
              <div className="flex flex-col items-center justify-center my-4 gap-2">
                {/* {fullLogo()} */}
                {user ? (
                  <>
                    <div
                      className={`w-30 h-30 rounded-full flex items-center justify-center ${!user.avatarUrl && "bg-[#ffc107]"} overflow-hidden cursor-pointer`}
                      onClick={() => navigate("/login")}
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full" />
                      ) : (
                        <span className="text-[3rem] font-extrabold">{user.name ? user.name.substring(0, 2).toUpperCase() : "US"}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[1rem] font-extrabold">
                        {user.name || "Usuário"}
                      </span>
                      <span className="text-[0.8rem] text-zinc-500">
                        {user.email}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="px-3 flex flex-col gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[1rem] font-extrabold">
                        Fazer login!
                      </span>
                      <span className="text-[0.7rem] text-center text-zinc-400">
                        Fazer login para acessar todos os recursos do sistema!
                      </span>
                    </div>
                    <div className="flex w-full px-1">
                      <div
                        className="
                          flex items-center justify-between w-full p-1
                          bg-[#ffb117]/90! hover:bg-zinc-900!
                          border border-[#ffb117]/90! hover:border-zinc-700/60!
                          rounded 
                          font-bold hover:text-zinc-200!
                          cursor-pointer transition-colors duration-200
                        "
                        onClick={() => navigate("/login")}
                      >
                        <div></div>
                        <span>Ir para Login</span>
                        <ArrowRight size={18} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                )}
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
            </div>
          </div>
          {user && (
            <div className="mt-auto w-full py-3 px-4 border-t border-[#313131] shrink-0">
              <div
                className="
                  p-1 w-full flex items-center justify-center gap-2
                  text-[1rem] font-bold text-[#cecece]
                  bg-red-500/90 hover:bg-red-500/80 active:bg-red-500/70 transition-colors
                  rounded cursor-pointer outline-none
                  group
                "
                onClick={async () => {
                  // Realiza o logout; useAuthGuard detecta user → null e redireciona
                  await window.electronAPI.logout();
                  useUserStore.getState().clearUser();
                }}
              >
                <span className="pt-0.5">Sair</span>
                <LogOut size={15} className="stroke-3" />
              </div>
            </div>
          )}
        </Col>

        <Col className="flex flex-col p-4 justify-center">
          <Tab.Container id="left-tabs-example" defaultActiveKey="history">
            <div className="flex w-full justify-center text-xs">
              {user && (
                <Nav variant="underline" className="flex custom-tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="history">Dispositivo</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="settings">Onedrive</Nav.Link>
                  </Nav.Item>
                </Nav>
              )}
            </div>
            <div className="flex w-full h-full px-12 py-4 justify-center">
              <Tab.Content className="flex w-full h-full justify-center">
                <Tab.Pane
                  eventKey="history"
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
                <Tab.Pane eventKey="settings">s{/* <Sonnet /> */}</Tab.Pane>
              </Tab.Content>
            </div>
          </Tab.Container>
        </Col>
      </Row>



      <Row className="w-full position-absolute bottom-0 end-0 px-2">
        <Col className="w-full text-end">
          <span
            className="text-xs text-[#cecece]"
            onClick={() => navigate("/login")}
          >
            {import.meta.env.VITE_APP_VERSION}
          </span>
        </Col>
      </Row>
    </div>
  );
}

export default UploadPage;
