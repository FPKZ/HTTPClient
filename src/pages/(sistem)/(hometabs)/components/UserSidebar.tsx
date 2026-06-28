import React, { useEffect, useState } from "react";
import useUserStore from "@/core/store/useUserStore";
import { useNavigate } from "react-router-dom";
import { useQuickExit } from "@/core/hooks/useQuickExit";
import useCollectionStore from "@/core/store/useCollectionStore";
import useDialogStore from "@/core/store/useDialogStore";
import NovaCollectionModal from "@/components/modals/NovaCollectionModal";
import ImportCollectionModal from "@/components/modals/ImportCollectionModal";
import { ArrowRight, LogOut } from "lucide-react";

export default function UserSiderBar() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
        } else {
          // Exibe erro amigável se a conversão/importação falhar ou não trouxer resultados
          useDialogStore.getState().showDialog({
            title: "Importação inválida",
            description: "O arquivo selecionado não contém uma coleção válida no formato HTTPClient ou Postman.",
            options: [{ label: "OK", value: true, variant: "primary" }],
          });
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
    <div className="w-full flex flex-col h-full relative transition-all duration-300">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col">
          <div className="flex flex-col items-center justify-center my-4 gap-2">
            {/* {fullLogo()} */}
            {user ? (
              <>
                <div
                  className={`w-30 h-30 rounded-full flex items-center justify-center ${!user.avatarUrl && "bg-[#ffc107]"} overflow-hidden cursor-pointer`}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full" />
                  ) : (
                    <span className="text-[3rem] font-extrabold">
                      {user.name
                        ? user.name.substring(0, 2).toUpperCase()
                        : "US"}
                    </span>
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
              open={isImportModalOpen}
              onOpenChange={setIsImportModalOpen}
              onImport={(path) => {
                setIsImportModalOpen(false);
                startConversion(path, true);
              }}
              onFolderSelect={async () => {
                setIsImportModalOpen(false);
                await handleFolderSelect();
              }}
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
    </div>
  );
}