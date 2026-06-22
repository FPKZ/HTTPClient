import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTabStore from "@/core/store/useTabStore";
import useUserStore from "@/core/store/useUserStore";

// Components
import HistoryList from "@/pages/(sistem)/(protected)/home/components/history/HistoryList";
import ImportCollectionModal from "@/components/modals/ImportCollectionModal";
import NovaCollectionModal from "@/components/modals/NovaCollectionModal";
import { ArrowRight, LogOut } from "lucide-react";

// Hooks
import { useQuickExit } from "@/core/hooks/useQuickExit";
import { useHistory } from "@/core/hooks/useHistory";

// import img from "../assets/icon1.png";

/**
 * UploadPage (Refatorada)
 * SRP: Focada no carregamento de novos arquivos e visualização do histórico.
 * Removido react-bootstrap (Tab, Nav, Row, Col) — substituído por abas nativas + grid Tailwind.
 */
function UploadPage() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"history" | "settings">("history");

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
    <div className="flex w-full h-full relative overflow-hidden">
      {/* Grid de 2 colunas: sidebar esquerda + área central */}
      <div className="flex w-full h-full">

        {/* Coluna Esquerda — Sidebar */}
        {/* <div className="w-[30%] max-w-[280px] min-w-[200px] flex flex-col h-full border-r border-[#313131] relative transition-all duration-300">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col">
              <div className="flex flex-col items-center justify-center my-4 gap-2"> 
                {user ? (
                  <>
                    <div
                      className={`w-30 h-30 rounded-full flex items-center justify-center ${!user.avatarUrl && "bg-[#ffc107]"} overflow-hidden cursor-pointer`}
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
                          bg-[#ffb117]/90 hover:bg-zinc-900
                          border border-[#ffb117]/90 hover:border-zinc-700/60
                          rounded 
                          font-bold hover:text-zinc-200
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
                  <div className="flex w-full h-full py-2 px-4 rounded items-center justify-center cursor-pointer bg-[#1b1b1b] border border-[#313131] hover:bg-[#292929] active:bg-[#1d1d1d] transition-colors text-gray-300 font-bold">
                    Nova Coleção
                  </div>
                </NovaCollectionModal>
                <ImportCollectionModal
                  onImport={(path) => startConversion(path, true)}
                  onFolderSelect={handleFolderSelect}
                >
                  <div className="flex w-full h-full py-2 px-4 rounded items-center justify-center cursor-pointer bg-[#1b1b1b] border border-[#313131] hover:bg-[#292929] active:bg-[#1d1d1d] transition-colors text-gray-300 font-bold">
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
        </div> */}

        {/* Coluna Direita — Conteúdo Principal com Abas */}
        <div className="flex flex-col flex-1 p-4 justify-center">
          {/* Abas (nativas — sem Bootstrap) */}
          {user && (
            <div className="flex w-full justify-center text-xs mb-2">
              <div className="flex custom-tabs">
                {(["history", "settings"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-4 py-2 font-bold border-b-2 transition-all duration-200 cursor-pointer bg-transparent border-x-0 border-t-0
                      ${activeTab === tab
                        ? "text-white border-b-[#ffc107]"
                        : "text-zinc-400 border-b-transparent hover:text-zinc-200"
                      }
                    `}
                  >
                    {tab === "history" ? "Dispositivo" : "Onedrive"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conteúdo das Abas */}
          <div className="flex w-full h-full px-12 py-4 justify-center">
            <div className="flex w-full h-full justify-center">
              {/* Aba: Dispositivo (history) */}
              <div className={`flex w-full h-full justify-center ${activeTab === "history" ? "block" : "hidden"}`}>
                <div className="flex-1 min-h-0">
                  <HistoryList
                    history={history}
                    onLoad={handleLoadHistory}
                    onDelete={handleDeleteHistoryItem}
                    onAllDelete={handleDeleteAllHistory}
                  />
                </div>
              </div>

              {/* Aba: Onedrive (settings) */}
              <div className={`flex w-full h-full justify-center ${activeTab === "settings" ? "block" : "hidden"}`}>
                s{/* <Sonnet /> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Versão no canto inferior direito */}
      <div className="absolute bottom-0 right-0 px-2">
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
