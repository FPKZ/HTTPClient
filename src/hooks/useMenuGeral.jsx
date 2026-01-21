import React from "react";
import { useNewCollection } from "./useNewCollection";
import useTabStore from "../store/useTabStore"; // Ajustado o caminho e import default
import { Plus, FileDown, LogOut, SquareTerminal } from "lucide-react";

/**
 * useMenuGeral
 * Hook centralizador para as opções de menu da TitleBar.
 */
export function useMenuGeral() {
  const { triggerNewCollection } = useNewCollection();
  const getCollectionForExport = useTabStore((state) => state.getCollectionForExport);
  const isDev = window.electronAPI?.isDev;

  const handleExportCollection = () => {
    const collection = getCollectionForExport();
    window.electronAPI.saveFile({ content: collection });
  };

  const templete = [
    {
      icon: <Plus size={14} />,
      label: "Nova Coleção",
      shortcut: "Ctrl+N",
      onClick: () => triggerNewCollection(),
    },
    {
      icon: <FileDown size={14} />,
      label: "Exportar Coleção",
      shortcut: "Ctrl+S",
      onClick: () => handleExportCollection(),
    },
    {
      separator: true,
    },
    {
      icon: <LogOut size={14} />,
      label: "Sair",
      shortcut: "Ctrl+Q",
      onClick: () => window.electronAPI.close(),
    },
  ];

  const devTemplete = [
    {
      icon: <SquareTerminal size={14} />,
      label: "Desenvolvedor",
      shortcut: "Ctrl+Shift+I",
      onClick: () => window.electronAPI.toggleDevTools(),
    },
  ];

  return {
    templete,
    devTemplete,
    isDev
  };
}