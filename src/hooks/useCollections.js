import { useState, useMemo, useEffect } from "react";

/**
 * useCollections
 * Gerencia o estado das coleções de rotas, edição e persistência.
 * SRP: Cuida apenas da lógica de dados das coleções.
 */
export function useCollections(initialTelas, sessionId, collectionName, initialHttp) {
  const [rota, setRota] = useState(initialTelas || []);

  const handleInputChange = (screenIndex, sectionKey, fieldKey, newValue) => {
    setRota((prevRota) => {
      const newRota = [...prevRota];
      const [screenName, screenData] = newRota[screenIndex];

      let updatedSection;
      if (fieldKey === null) {
        updatedSection = newValue;
      } else {
        const currentSection =
          typeof screenData.request[sectionKey] === "object"
            ? screenData.request[sectionKey]
            : {};

        updatedSection = {
          ...currentSection,
          [fieldKey]: newValue,
        };
      }

      const newScreenData = {
        ...screenData,
        request: {
          ...screenData.request,
          [sectionKey]: updatedSection,
        },
      };

      newRota[screenIndex] = [screenName, newScreenData];
      return newRota;
    });
  };

  const handleSelectFile = async ({ index, subKey, fieldKey }) => {
    if (!window.electronAPI) return;
    const filePath = await window.electronAPI.selectFile();
    if (!filePath) return;

    setRota((prevRota) => {
      const newRota = [...prevRota];
      const [screenName, screenData] = newRota[index];
      
      newRota[index] = [
        screenName,
        {
          ...screenData,
          request: {
            ...screenData.request,
            [subKey]: {
              ...screenData.request[subKey],
              [fieldKey]: {
                ...screenData.request[subKey][fieldKey],
                src: filePath,
              },
            },
          },
        },
      ];
      return newRota;
    });
  };

  const handleExportCollection = () => {
    if (window.electronAPI) {
      window.electronAPI.saveFile({ content: rota });
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (window.electronAPI?.onRequestSaveSession) {
      const unsubscribe = window.electronAPI.onRequestSaveSession(() => {
        window.electronAPI.saveAndQuit({
          id: sessionId,
          collectionName: collectionName || "Collection",
          content: {
            axios: Object.fromEntries(rota),
            http: initialHttp || {}
          }
        });
      });
      return () => unsubscribe && unsubscribe();
    }
  }, [rota, sessionId, collectionName, initialHttp]);

  return {
    rota,
    handleInputChange,
    handleSelectFile,
    handleExportCollection,
  };
}
