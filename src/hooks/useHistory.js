import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTabStore from "../store/useTabStore";
import useDialogStore from "../store/useDialogStore";

export function useHistory(fetchOnMount = true) {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const showDialog = useDialogStore((state) => state.showDialog);

  // const { getCollectionForExport } = useTabStore();

  useEffect(() => {
    if (!fetchOnMount) return;
    
    const getHistory = async () => {
      if (!window.electronAPI) return;
      const history = await window.electronAPI.getHistory();
      setHistory(history || []);
    };
    getHistory();
  }, [fetchOnMount]);

  const handleLoadHistory = async (item) => {
    if (!window.electronAPI) return;
    const content = await window.electronAPI.loadCollection(item.file);
    if (content) {
      // Carrega diretamente no store para evitar passar objeto gigante pelo state do router
      useTabStore.getState().loadCollection(content);
      navigate("/");
    }
  };

  const handleDeleteHistoryItem = async (e, id) => {
    const confirmed = await showDialog({
      title: "Deletar item do histórico",
      description: "Tem certeza que deseja remover este item do histórico?",
      options: [
        { label: "Cancelar", value: false, variant: "secondary" },
        { label: "Confirmar", value: true, variant: "danger" },
      ],
    });
    if (confirmed) {
      await window.electronAPI.deleteHistoryItem(id);
      const updatedHistory = await window.electronAPI.getHistory();
      setHistory(updatedHistory || []);
    }
  };

  const handleSaveCollection = async () => {
    if (!window.electronAPI) return;
    const confirmed = await showDialog({
      title: "Salvar coleção",
      description: "Deseja salvar esta coleção no histórico?",
      options: [
        { label: "Não salvar", value: false, variant: "secondary" },
        { label: "Salvar", value: true, variant: "primary" },
      ],
    });
    if (confirmed) {
      const collection = useTabStore.getState().getCollectionForExport();
      await window.electronAPI.saveHistory(collection);
    }
  };

  return {
    history,
    handleLoadHistory,
    handleDeleteHistoryItem,
    handleSaveCollection,
  };
}
