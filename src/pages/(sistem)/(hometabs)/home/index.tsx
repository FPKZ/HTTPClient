import { useEffect } from "react";
// Components
import TabBar from "./components/layout/TabBar";
import TabEditor from "./components/layout/TabEditor";

// Store
import useTabStore from "@/core/store/useTabStore";
import useCollectionStore from "@/core/store/useCollectionStore";

// Hooks
import { useQuickExit } from "@/core/hooks/useQuickExit";
import useDialogStore from "@/core/store/useDialogStore";

// Modals
import NovaCollectionModal from "@/components/modals/NovaCollectionModal";
import ExportModal from "@/components/modals/ExportModal";
import Hub from "./components/layout/Hub";

/**
 * Home Page (Refatorada com Sistema de Abas)
 * Novo layout: Sidebar (esquerda) + TabBar + TabEditor (direita)
 * Gerenciamento de estado via Zustand
 */
export default function Home() {
  const collection = useCollectionStore((state) => state.collection.id)
  const showDialog = useDialogStore((state) => state.showDialog);
  const getCollectionForExport = useCollectionStore(
    (state) => state.getCollectionForExport,
  );
  const resetTabs = useTabStore((state) => state.resetTabs);
  const activeTabId = useTabStore((state) => state.activeTabId);

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

  if(!collection) return <Hub />

  return (
    <div className="flex flex-col w-full h-full">

      {/* Área Principal (Abas + Editor) */}
      <TabBar />
      <TabEditor key={activeTabId} />

      
      <ExportModal />
    </div>
  );
}
