import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Components
import Sidebar from "../components/layout/Sidebar";
import TabBar from "../components/layout/TabBar";
import TabEditor from "../components/layout/TabEditor";

// Store
import useTabStore from "../store/useTabStore";

// Hooks
import { useQuickExit } from "../hooks/useQuickExit";

/**
 * Home Page (Refatorada com Sistema de Abas)
 * Novo layout: Sidebar (esquerda) + TabBar + TabEditor (direita)
 * Gerenciamento de estado via Zustand
 */
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const loadCollection = useTabStore((state) => state.loadCollection);
  const getCollectionForExport = useTabStore(
    (state) => state.getCollectionForExport
  );

  // 1. Validação de Segurança
  useEffect(() => {
    if (!location.state) {
      navigate("/upload");
    }
  }, [location.state, navigate]);

  // 2. Carregar Coleção no Store
  useEffect(() => {
    if (location.state) {
      loadCollection(location.state);
    }
  }, [location.state, loadCollection]);

  // 3. IPC Menu Action (Exportar Collection)
  useEffect(() => {
    if (window.electronAPI?.onMenuAction) {
      const unsubscribe = window.electronAPI.onMenuAction((action) => {
        if (action === "save-file") {
          const collectionData = getCollectionForExport();
          window.electronAPI.saveFile({
            content: collectionData.content.axios,
          });
        }
      });
      return () => unsubscribe();
    }
  }, [getCollectionForExport]);

  // 4. Auto-save ao sair (Ctrl+Q)
  useQuickExit(() => {
    const collectionData = getCollectionForExport();
    window.electronAPI.saveAndQuit({
      id: collectionData.id,
      collectionName: collectionData.collectionName,
      content: {
        axios: collectionData.content.axios,
        http: location.state?.http || {},
      },
    });
  });

  if (!location.state) return null;

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar Esquerda */}
      <Sidebar />

      {/* Área Principal (Abas + Editor) */}
      <div className="flex-1 flex flex-col">
        <TabBar />
        <TabEditor />
      </div>
    </div>
  );
}
