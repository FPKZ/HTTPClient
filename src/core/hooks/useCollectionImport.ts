import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCollectionStore from "@/core/store/useCollectionStore";
import useDialogStore from "@/core/store/useDialogStore";

/**
 * useCollectionImport
 *
 * Encapsula toda a lógica de importação de uma coleção via conversão IPC do Electron:
 * - Estado do modal de importação
 * - Disparo da conversão (startConversion)
 * - Seleção de arquivo via diálogo nativo (handleFolderSelect)
 * - Listener do resultado da conversão (onFinished) com feedback de erro
 *
 * Seguindo SRP: cada consumidor apenas chama esse hook sem precisar
 * conhecer os detalhes do IPC ou do store.
 */
export function useCollectionImport() {
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  /**
   * Inicia a conversão de um arquivo de coleção (Postman, HTTPClient, etc.)
   * via IPC do Electron.
   */
  const startConversion = (inputPath: string | string[], isFile: boolean) => {
    window.electronAPI?.startConversion({ inputPath, isFile });
  };

  /**
   * Abre o diálogo nativo de seleção de arquivo e inicia a conversão
   * do arquivo selecionado.
   */
  const handleFolderSelect = async () => {
    const path = await window.electronAPI?.selectFile();
    if (!path) return;
    window.electronAPI.logAction("Importando coleção: " + path);
    startConversion(path, true);
  };

  /**
   * Ouve o evento IPC de finalização da conversão.
   * Em caso de sucesso: carrega a coleção no store e navega para /home.
   * Em caso de falha: exibe diálogo de erro amigável.
   * O listener é removido automaticamente ao desmontar o componente.
   */
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubscribe = window.electronAPI.onFinished?.((result: any) => {
      if (result.success && result.results?.length > 0) {
        const data = result.results[0];
        window.electronAPI.logAction("Carregando coleção: " + data.raw.name);
        useCollectionStore.getState().loadCollection(data.raw);
        navigate("/home");
      } else {
        useDialogStore.getState().showDialog({
          title: "Importação inválida",
          description:
            "O arquivo selecionado não contém uma coleção válida no formato HTTPClient ou Postman.",
          options: [{ label: "OK", value: true, variant: "primary" }],
        });
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [navigate]);

  return {
    /** Estado de abertura do modal de importação */
    isImportModalOpen,
    /** Setter para controlar a abertura do modal de importação */
    setIsImportModalOpen,
    /** Inicia a conversão de um arquivo de coleção */
    startConversion,
    /** Abre o diálogo nativo de arquivo e dispara a conversão */
    handleFolderSelect,
  };
}

export default useCollectionImport;
