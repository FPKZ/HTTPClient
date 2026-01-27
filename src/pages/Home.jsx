import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  }, [collection.items, navigate]);


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
    <div className="row m-0 p-0 flex h-full bg-zinc-950">
      <NovaCollectionModal />

      {/* Sidebar Esquerda */}
      <div className="col-4 col-md-3 col-lg-3 col-xl-3 m-0 p-0 h-full">
        <Sidebar />
      </div>

      {/* Área Principal (Abas + Editor) */}
      <div className="col flex-1 flex flex-col min-w-0 min-h-0 m-0 p-0 h-full">
        <TabBar />
        <TabEditor />
      </div>
    </div>
  );
}
