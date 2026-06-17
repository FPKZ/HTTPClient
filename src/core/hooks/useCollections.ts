import { useState } from "react";
import { useQuickExit } from "./useQuickExit";

/**
 * useCollections
 * Gerencia o estado das coleções de rotas, edição e persistência.
 * SRP: Cuida apenas da lógica de dados das coleções.
 */
export function useCollections(
  initialTelas: any[],
  sessionId: string,
  collectionName: string,
  initialHttp: any
) {
  const [rota, setRota] = useState<any[]>(initialTelas || []);

  const handleInputChange = (screenIndex: number, sectionKey: string, fieldKey: string | null, newValue: any) => {
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

  const handleSelectFile = async ({ index, subKey, fieldKey }: { index: number; subKey: string; fieldKey: string }) => {
    if (!window.electronAPI) return;
    const filePath = await window.electronAPI.selectFile([]);
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
                src: filePath[0], // Electron selectFile returns string[]
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
      window.electronAPI.logAction("Exportando coleção: " + collectionName);
      window.electronAPI.saveFile({ content: rota });
    }
  };

  // Auto-save logic
  useQuickExit(() => {
    window.electronAPI.logAction("Salvando coleção no historico: " + collectionName);
    window.electronAPI.saveAndQuit({
      id: sessionId,
      collectionName: collectionName || "Collection",
      content: {
        axios: Object.fromEntries(rota),
        http: initialHttp || {},
      },
    });
  });

  return {
    rota,
    handleInputChange,
    handleSelectFile,
    handleExportCollection,
  };
}
