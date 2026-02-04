import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  // const location = useLocation();

  const showDialog = useDialogStore((state) => state.showDialog);

  // const loadCollection = useTabStore((state) => state.loadCollection);
  const getCollectionForExport = useTabStore(
    (state) => state.getCollectionForExport,
  );

  const collection = useTabStore((state) => state.collection);
  const resetTabs = useTabStore((state) => state.resetTabs);

  // 1. Validação de Segurança
  // Se não houver itens na coleção, volta para upload
  useEffect(() => {
    if (!collection.items || collection.items.length === 0) {
      // Opcional: só redirecionar se realmente vazio e não for intencional
      // Por enquanto, mantemos a lógica de "se chegou aqui sem nada, volta"
      // Mas cuidado: se o usuário der F5, o persist deve manter os dados
      // Se persist falhar, volta pro upload
      // navigate("/upload");
    }

    // Limpa o estado no localStorage quando "sai" da Home
    return () => {
      resetTabs();
    };
  }, [collection.items, navigate, resetTabs]);


  // 4. Auto-save ao sair (Ctrl+Q)
  useQuickExit(async () => {
    const confirmed = await showDialog({
      title: "Salvar coleção",
      description: "Deseja salvar a coleção antes de sair?",
      options: [
        { label: "Cancelar", value: false, variant: "secondary" },
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
      <PanelGroup>
        {/* Sidebar Esquerda */}
        <Panel defaultSize={"20%"} maxSize={"35%"} minSize={"15%"}>
            <Sidebar />
        </Panel>
        
        <PanelResizeHandle className="h-full position-relative">
          <div className="h-full position-absolute right-0 w-1 display-none hover:display-block hover:bg-yellow-600/50 hover:w-1">
          </div>
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

