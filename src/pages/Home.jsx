import React, { useEffect } from "react";

import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";

// Components
import Sidebar from "../components/layout/Sidebar";
import TabBar from "../components/layout/TabBar";
import TabEditor from "../components/layout/TabEditor";

// Store
import useTabStore from "../store/useTabStore";
import useInterfaceStore from "../store/useInterfaceStore";

// Hooks
import { useQuickExit } from "../hooks/useQuickExit";
import useDialogStore from "../store/useDialogStore";

// Modals
import NovaCollectionModal from "../components/modals/NovaCollectionModal";
import ExportModal from "../components/modals/ExportModal";

/**
 * Home Page (Refatorada com Sistema de Abas)
 * Novo layout: Sidebar (esquerda) + TabBar + TabEditor (direita)
 * Gerenciamento de estado via Zustand
 */
export default function Home() {
  // const location = useLocation();

  const showDialog = useDialogStore((state) => state.showDialog);

  // const loadCollection = useTabStore((state) => state.loadCollection);
  const getCollectionForExport = useTabStore(
    (state) => state.getCollectionForExport,
  );

  const resetTabs = useTabStore((state) => state.resetTabs);

  // 1. Limpeza de estado ao sair da Home (voltar para o início)
  useEffect(() => {
    return () => {
      resetTabs();
    };
  }, [resetTabs]);

  // 4. Auto-save ao sair (Ctrl+Q)
  useQuickExit(async () => {
    const confirmed = await showDialog({
      title: "Salvar coleção",
      description: "Deseja salvar a coleção antes de sair?",
      options: [
        { label: "Não salvar", value: false, variant: "secondary" },
        { label: "Salvar", value: true, variant: "primary" },
      ],
    });
    if (confirmed) {
      const collectionData = getCollectionForExport();
      // Passa o objeto completo e unificado
      window.electronAPI.saveAndQuit(collectionData);
    } else {
      window.electronAPI.forceClose();
    }
  });

  // if (!collection.items.length) return null; // Pode exibir loading ou null se quiser force

  const sideBarIsOpen = useInterfaceStore((state) => state.sideBarIsOpen);
  const setResponseIsOpen = useInterfaceStore((state) => state.setResponseIsOpen);
  const setCodeSnipersIsOpen = useInterfaceStore((state) => state.setCodeSnipersIsOpen);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <PanelGroup orientation="horizontal">
        {/* Sidebar Esquerda */}
        {sideBarIsOpen && (
          <Panel defaultSize="20%" maxSize="35%" minSize="15%">
            <Sidebar />
          </Panel>
        )}

        <PanelResizeHandle className="h-full position-relative group/resize">
          <div className="h-full position-absolute left-0 w-[0.1rem]! display-none group-hover/resize:display-block group-hover/resize:bg-yellow-600/50 group-hover/resize:w-1"></div>
          <div className="h-full position-absolute right-0 w-[0.2rem]! display-none group-hover/resize:display-block group-hover/resize:bg-yellow-600/50 group-hover/resize:w-1"></div>
        </PanelResizeHandle>

        {/* Área Principal (Abas + Editor) */}
        <Panel className="flex-1 flex flex-col h-full">
          <TabBar />
          <TabEditor />
        </Panel>
      </PanelGroup>
      <div className="w-full flex justify-between text-[0.5rem] font-semibold text-zinc-400 bg-zinc-800/20 p-1 px-3">
        <div className="flex items-center align-center gap-2 p-0.5">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-center justify-center align-center items-center">
            online
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setResponseIsOpen()} className="hover:text-zinc-200">RESPONSE</button>
          <div className="w-[0.1rem] h-full bg-zinc-600"></div>
          <button onClick={() => setCodeSnipersIsOpen()} className="hover:text-zinc-200">CODE SNIPPETS</button>
        </div>
      </div>
      <NovaCollectionModal />
      <ExportModal />
    </div>
  );
}
