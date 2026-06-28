import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCollectionStore from "@/core/store/useCollectionStore";
import useDialogStore from "@/core/store/useDialogStore";

export function useHistory(fetchOnMount = true) {
  const [history, setHistory] = useState<any[]>([]);
  const navigate = useNavigate();
  const showDialog = useDialogStore((state) => state.showDialog);

  useEffect(() => {
    if (!fetchOnMount) return;

    const getHistory = async () => {
      if (!window.electronAPI) return;
      const history = await window.electronAPI.getHistory();
      setHistory(history || []);
    };
    getHistory();
  }, [fetchOnMount]);

  const handleLoadHistory = async (item: any) => {
    if (!window.electronAPI) return;

    const content = await window.electronAPI.getCollectionById({
      id: item.id,
      source: item.sourceType || "local"
    });

    if (content) {
      window.electronAPI.logAction(
        "Carregando coleção salva no historico: " + item.name
      );
      useCollectionStore.getState().loadCollection(content);
      navigate("/home");
    }
  };

  const handleDeleteHistoryItem = async (name: string, id: string) => {
    const confirmed = await showDialog({
      title: "Deletar item do histórico",
      description: "Tem certeza que deseja remover este item do histórico?",
      options: [
        { label: "Cancelar", value: false, variant: "secondary" },
        { label: "Confirmar", value: true, variant: "danger" },
      ],
    });
    if (confirmed) {
      if (window.electronAPI) {
        window.electronAPI.logAction("Deletando item do historico: " + name);
        await window.electronAPI.deleteHistoryItem(id);
        const updatedHistory = await window.electronAPI.getHistory();
        setHistory(updatedHistory || []);
      }
    }
  };

  const handleSaveCollection = async (confirmed: boolean) => {
    if (!window.electronAPI) return;
    if (confirmed) {
      const collection = useCollectionStore.getState().collection;
      window.electronAPI.logAction(
        "Salvando coleção no historico: " + collection.name
      );
      await window.electronAPI.saveHistory(collection);
    }
  };

  const handleDeleteAllHistory = async () => {
    const confirmed = await showDialog({
      title: "Deletar todo o histórico",
      description: "Tem certeza que deseja remover todo o histórico?",
      options: [
        { label: "Cancelar", value: false, variant: "secondary" },
        { label: "Confirmar", value: true, variant: "danger" },
      ],
    });
    if (confirmed) {
      if (window.electronAPI) {
        window.electronAPI.logAction("Deletando todo o historico");
        await window.electronAPI.deleteAllHistory();
        setHistory([]);
      }
    }
  };

  return {
    history,
    handleLoadHistory,
    handleDeleteHistoryItem,
    handleSaveCollection,
    handleDeleteAllHistory,
  };
}

export default useHistory;
