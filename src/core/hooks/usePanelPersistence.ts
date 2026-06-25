import React from "react";

/**
 * Hook para gerenciar a persistência de layout de painéis resizable.
 * @param {string} activeTabId - ID da aba ativa para isolamento.
 * @param {Object} initialSizes - { vertical: number, horizontal: number }
 * @param {Function} updateTabUiState - Função do store para salvar o estado.
 */

interface InitialSizes {
  vertical: number | string;
  horizontal: number | string;
}

export function usePanelPersistence(
  activeTabId: string,
  initialSizes: InitialSizes,
  updateTabUiState: (tabId: string, uiState: any) => void
) {
  const [canSave, setCanSave] = React.useState(false);
  const verticalPanelRef = React.useRef<any>(null);
  const horizontalPanelRef = React.useRef<any>(null);

  // Efeito de estabilização ao trocar de aba
  React.useEffect(() => {
    setCanSave(false);

    const timer = setTimeout(() => {
      if (verticalPanelRef.current) {
        verticalPanelRef.current.resize(initialSizes.vertical);
      }
      if (horizontalPanelRef.current) {
        horizontalPanelRef.current.resize(initialSizes.horizontal);
      }
      setCanSave(true);
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId]);

  const onVerticalLayoutChanged = (layout: any) => {
    if (!canSave) return;
    const size = Array.isArray(layout) 
      ? layout[1] !== undefined ? layout[1] : layout[0] 
      : layout["response-panel-container-global"];
    
    if (size !== undefined) {
      updateTabUiState(activeTabId, {
        panelVerticalSize: String(Math.round(size)),
      });
    }
  };

  const onHorizontalLayoutChanged = (layout: any) => {
    if (!canSave) return;
    const size = Array.isArray(layout)
      ? layout[1] !== undefined ? layout[1] : layout[0]
      : layout["snippets-panel-global"];
      
    if (size !== undefined) {
      updateTabUiState(activeTabId, {
        panelHorizontalSize: String(Math.round(size)),
      });
    }
  };

  return {
    verticalPanelRef,
    horizontalPanelRef,
    onVerticalLayoutChanged,
    onHorizontalLayoutChanged,
    canSave,
  };
}
