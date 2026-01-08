import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTabStore from "../store/useTabStore";

export function useHistory(fetchOnMount = true) {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const { getCollectionForExport } = useTabStore();

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
    if (window.confirm("Tem certeza que deseja remover este item do histórico?")) {
      await window.electronAPI.deleteHistoryItem(id);
      const updatedHistory = await window.electronAPI.getHistory();
      setHistory(updatedHistory || []);
    }
  };

  const handleSaveCollection = async () => {
    if (!window.electronAPI) return;
    if (window.confirm("Deseja salvar esta coleção no histórico?")) {
      await window.electronAPI.saveHistory(getCollectionForExport());
    }
  };

  return {
    history,
    handleLoadHistory,
    handleDeleteHistoryItem,
    handleSaveCollection,
  };
}
