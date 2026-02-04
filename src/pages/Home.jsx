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

  return (
    <div className="flex h-full bg-zinc-950">
      <PanelGroup orientation="horizontal">
        {/* Sidebar Esquerda */}
        <Panel defaultSize="20%" maxSize="35%" minSize="15%">
          <Sidebar />
        </Panel>

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
      <NovaCollectionModal />
      <ExportModal />
    </div>
  );
}
