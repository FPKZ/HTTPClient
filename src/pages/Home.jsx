import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Sidebar from "../components/layout/Sidebar";
import TabBar from "../components/layout/TabBar";
import TabEditor from "../components/layout/TabEditor";

// Store
import useTabStore from "../store/useTabStore";

// Hooks
// import { useQuickExit } from "../hooks/useQuickExit";

/**
 * Home Page (Refatorada com Sistema de Abas)
 * Novo layout: Sidebar (esquerda) + TabBar + TabEditor (direita)
 * Gerenciamento de estado via Zustand
 */
export default function Home() {
  const navigate = useNavigate();
  // const location = useLocation();

  // const loadCollection = useTabStore((state) => state.loadCollection);
  const getCollectionForExport = useTabStore(
    (state) => state.getCollectionForExport
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

  // 2. Carregar Coleção no Store -> REMOVIDO (Agora feito antes de navegar)

  // 3. IPC Menu Action (Exportar Collection)
  useEffect(() => {
    if (window.electronAPI?.onMenuAction) {
      const unsubscribe = window.electronAPI.onMenuAction((action) => {
        if (action === "save-file") {
          const collectionData = getCollectionForExport();
          // Passa o objeto completo e unificado
          window.electronAPI.saveFile({
            content: collectionData,
          });
        }
      });
      return () => unsubscribe();
    }
  }, [getCollectionForExport]);

  // 4. Auto-save ao sair (Ctrl+Q)
  // useQuickExit(() => {
  //   const collectionData = getCollectionForExport();
  //   // Passa o objeto completo e unificado
  //   window.electronAPI.saveAndQuit(collectionData);
  // });

  // if (!collection.items.length) return null; // Pode exibir loading ou null se quiser force


  return (
    <div className="flex h-[calc(100vh-35px)] bg-zinc-950">
      {/* Sidebar Esquerda */}
      <Sidebar />

      {/* Área Principal (Abas + Editor) */}
      <div className="flex-1 flex flex-col min-w-0">
        <TabBar />
        <TabEditor />
      </div>
    </div>
  );
}
