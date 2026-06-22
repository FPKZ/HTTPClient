import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator
} from "react-resizable-panels";

import { ArrowRight, File, Folder, FolderOpen, FolderTree, LogOut, Settings } from "lucide-react";
import NovaCollectionModal from "@/components/modals/NovaCollectionModal";
import ImportCollectionModal from "@/components/modals/ImportCollectionModal";
import Sidebar from "@/pages/(sistem)/(protected)/home/components/layout/Sidebar";


import { useQuickExit } from "@/core/hooks/useQuickExit";
import useHistory from "@/core/hooks/useHistory";
import useTabStore from "@/core/store/useTabStore";
import useUserStore from "@/core/store/useUserStore";

export default function LayoutHomeTabs() {

    const collection = useTabStore((state) => state.collection.id)


    return (
        <div className="flex w-full h-full">
            <SideBarButtons />
            <PanelGroup orientation="horizontal" >
                <Panel defaultSize={"20%" as any} maxSize={"80%" as any} minSize={"0%" as any} >
                    { !collection ? 
                        <UserSiderBar />
                        :
                        <Sidebar />
                    }
                </Panel>
                {/* <Separator /> */}
                <Panel minSize={"50%" as any} >
                    {/* <Collections /> */}
                    <Outlet />
                </Panel>
            </PanelGroup>
        </div>
    );
}

function SideBarButtons() {

    const [tab, setTab] = useState<string>()

    const location = useLocation()

    const navigate = useNavigate()

    const mocap = [
        {
            icon: () => <FolderTree strokeWidth={2.5} size={20} />,
            title: "home",
            func: () => setTab("Colecao")
        },
        {
            icon: (active: boolean) => active ? <FolderOpen strokeWidth={2.5} size={20} /> : <Folder strokeWidth={2.5} size={20} />,
            title: "Colecoes",
            func: () => navigate("/")
        }
    ]

    return (
        <div className="grid flex-col w-13 bg-zinc-900/60 text-zinc-400">
                <div className="w-full">
                    <div className="grid grid-cols-1 justify-start items-center w-full">
                        {mocap.map((button) => (
                            <button
                                className={`flex items-center justify-center w-full py-3.5 cursor-pointer relative ${location.pathname.includes(button.title) ? "text-yellow-500" : ""} hover:text-yellow-400`}
                                onClick={button.func}
                            >
                                {location.pathname.includes(button.title) && (
                                    <div className="absolute left-0 h-full w-0.5 bg-yellow-500">

                                    </div>
                                )}
                                {button.icon(location.pathname.includes(button.title))}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col justify-self-end justify-end items-center p-2 gap-2">
                    <button
                        className="p-1.5 cursor-pointer group"
                    >
                        <Settings strokeWidth={2.5} size={20} className="group-hover:text-white" />
                    </button>
                </div>
            </div>
    )
}

function UserSiderBar() {

    const user = useUserStore((state) => state.user);
    const navigate = useNavigate()

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
    
    return(
        <div className="w-full flex flex-col h-full border-r border-[#313131] relative transition-all duration-300">
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
        </div>
    )
}