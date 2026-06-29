import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCollectionStore from "@/core/store/useCollectionStore";
import useUserStore from "@/core/store/useUserStore";

// Components
import HistoryList from "@/pages/(sistem)/(hometabs)/home/components/history/HistoryList";
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
          useCollectionStore.getState().loadCollection(data.raw);
          navigate("/home");
        }
      });

      return () => {
        unFinished?.();
      };
    }
  }, [navigate]);

  return (
    <div className="flex w-full h-full relative overflow-hidden">
      {/* Grid de 2 colunas: sidebar esquerda + área central */}
      <div className="flex w-full h-full">
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
                      ${
                        activeTab === tab
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
              <div
                className={`flex w-full h-full justify-center ${activeTab === "history" ? "block" : "hidden"}`}
              >
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
              <div
                className={`flex w-full h-full justify-center ${activeTab === "settings" ? "block" : "hidden"}`}
              >
                s{/* <Sonnet /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
