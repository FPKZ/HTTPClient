import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useHistory() {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getHistory = async () => {
            if (!window.electronAPI) return;
            const history = await window.electronAPI.getHistory();
            setHistory(history || []);
        };
        getHistory();
    }, []);

    const handleLoadHistory = async (item) => {
    if (!window.electronAPI) return;
    const content = await window.electronAPI.loadCollection(item.file);
    if (content) {
      navigate("/", {
        state: {
          id: item.id,
          telas: content.axios,
          http: content.http,
          collectionName: item.collectionName,
        },
      });
    }
  };

  const handleDeleteHistoryItem = async (e, id) => {
    if (
      window.confirm("Tem certeza que deseja remover este item do histórico?")
    ) {
      await window.electronAPI.deleteHistoryItem(id);
      const updatedHistory = await window.electronAPI.getHistory();
      setHistory(updatedHistory || []);
    }
  };

  return {
    history,
    handleLoadHistory,
    handleDeleteHistoryItem,
  };
}