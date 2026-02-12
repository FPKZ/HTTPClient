import React from "react";

/**
 * Hook para gerenciar a persistência de layout de painéis resizable.
 * @param {string} activeTabId - ID da aba ativa para isolamento.
 * @param {Object} initialSizes - { vertical: string, horizontal: string }
 * @param {Function} updateTabUiState - Função do store para salvar o estado.
 */
export function usePanelPersistence(
  activeTabId,
  initialSizes,
  updateTabUiState,
) {
  const [canSave, setCanSave] = React.useState(false);
  const verticalPanelRef = React.useRef(null);
  const horizontalPanelRef = React.useRef(null);

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
  }, [activeTabId]);

  const onVerticalLayoutChanged = (layout) => {
    if (!canSave) return;
    const size = layout[`response-panel-container-${activeTabId}`];
    if (size !== undefined) {
      updateTabUiState(activeTabId, {
        panelVerticalSize: String(Math.round(size)),
      });
    }
  };

  const onHorizontalLayoutChanged = (layout) => {
    if (!canSave) return;
    const size = layout[`snippets-panel-${activeTabId}`];
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
