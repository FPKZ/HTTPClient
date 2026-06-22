import React, { useEffect, useState } from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";

// Components
import Sidebar from "@/pages/(sistem)/(protected)/home/components/layout/Sidebar";
import TabBar from "@/pages/(sistem)/(protected)/home/components/layout/TabBar";
import TabEditor from "@/pages/(sistem)/(protected)/home/components/layout/TabEditor";

// Store
import useTabStore from "@/core/store/useTabStore";
import useInterfaceStore from "@/core/store/useInterfaceStore";

// Hooks
import { useQuickExit } from "@/core/hooks/useQuickExit";
import useDialogStore from "@/core/store/useDialogStore";

// Modals
import NovaCollectionModal from "@/components/modals/NovaCollectionModal";
import ExportModal from "@/components/modals/ExportModal";
import useUserStore from "@/core/store/useUserStore";

/**
 * Home Page (Refatorada com Sistema de Abas)
 * Novo layout: Sidebar (esquerda) + TabBar + TabEditor (direita)
 * Gerenciamento de estado via Zustand
 */
export default function Home() {
  const showDialog = useDialogStore((state) => state.showDialog);
  const getCollectionForExport = useTabStore(
    (state) => state.getCollectionForExport,
  );
  const resetTabs = useTabStore((state) => state.resetTabs);
  const activeTabId = useTabStore((state) => state.activeTabId);

  const sideBarIsOpen = useInterfaceStore((state) => state.sideBarIsOpen);

  const [isOnline, setIsOnline] = useState(false);

  // 1. Limpeza de estado ao sair da Home (voltar para o início)
  useEffect(() => {
    return () => {
      resetTabs();
    };
  }, [resetTabs]);

  // 4. Auto-save ao sair (Ctrl+Q ou fechamento pelo SO)
  useQuickExit(async () => {
    const result = await showDialog({
      title: "Salvar coleção",
      description:
        "O sistema está sendo fechado. Deseja salvar a coleção antes de sair?",
      options: [
        { label: "Não", value: "no", variant: "secondary" },
        { label: "Salvar", value: "yes", variant: "primary" },
      ],
    });

    if (result === "yes") {
      const collectionData = getCollectionForExport();
      (window as any).electronAPI.saveAndQuit(collectionData);
    } else if (result === "no") {
      (window as any).electronAPI.forceClose();
    }
  });

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof (window as any).electronAPI?.conect === "function") {
        try {
          const online = await (window as any).electronAPI.conect();
          setIsOnline(online);
        } catch (error) {
          console.error("Erro ao verificar conexão:", error);
          setIsOnline(false);
        }
      }
    };

    checkConnection();

    // Listener para atualizações em tempo real (push do Main)
    let removeListener: (() => void) | undefined;
    if (typeof (window as any).electronAPI?.onNetworkStatus === "function") {
      removeListener = (window as any).electronAPI.onNetworkStatus((status: boolean) => {
        setIsOnline(status);
      });
    }

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <PanelGroup orientation="horizontal">
        {/* Sidebar Esquerda */}
        {sideBarIsOpen && (
          <Panel defaultSize={"20%" as any} maxSize={"35%" as any} minSize={"15%" as any}>
            <Sidebar />
          </Panel>
        )}

        <PanelResizeHandle className="h-full relative group/resize">
          <div className="h-full absolute left-0 w-[0.1rem] hidden group-hover/resize:block group-hover/resize:bg-yellow-600/50 group-hover/resize:w-1"></div>
          <div className="h-full absolute right-0 w-[0.2rem] hidden group-hover/resize:block group-hover/resize:bg-yellow-600/50 group-hover/resize:w-1"></div>
        </PanelResizeHandle>

        {/* Área Principal (Abas + Editor) */}
        <Panel className="flex-1 flex flex-col h-full">
          <TabBar />
          <TabEditor key={activeTabId} />
        </Panel>
      </PanelGroup>
      <div className="w-full flex justify-between text-[0.5rem] font-semibold text-zinc-400 bg-zinc-800/20 p-1 px-3">
        <div className="flex items-center align-center gap-2 p-0.5">
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"} `}
          ></span>
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-center justify-center align-center items-center">
            {isOnline ? "online" : "offline"}
          </span>
        </div>
        <div className="text-xs text-[#cecece]">
          {import.meta.env.VITE_APP_VERSION}
        </div>
      </div>
      <NovaCollectionModal />
      <ExportModal />
    </div>
  );
}
