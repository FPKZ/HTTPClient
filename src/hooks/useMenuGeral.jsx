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
  const getCollectionForExport = useTabStore(
    (state) => state.getCollectionForExport,
  );
  const isDev = window.electronAPI?.isDev;

  const handleExportCollection = () => {
    const collection = getCollectionForExport();
    window.electronAPI.saveFile({ content: collection });
  };

  const handleExportHttp = () => {
    const collection = getCollectionForExport();
    window.electronAPI.exportHttp({ content: collection });
  };

  const iconJSON = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width="16px"
      height="16px"
      viewBox="0 0 24 24"
    >
      <path
        fill="#92AA5D"
        data-iconcolor="JSON"
        d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19M12,15A1,1 0 0,1 13,16A1,1 0 0,1 12,17A1,1 0 0,1 11,16A1,1 0 0,1 12,15M8,15A1,1 0 0,1 9,16A1,1 0 0,1 8,17A1,1 0 0,1 7,16A1,1 0 0,1 8,15M16,15A1,1 0 0,1 17,16A1,1 0 0,1 16,17A1,1 0 0,1 15,16A1,1 0 0,1 16,15Z"
      />
    </svg>
  );

  const iconHTTP = (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 512 512"
      width="16px"
      height="16px"
      xmlSpace="preserve"
    >
      <g fill="#29B6F6" data-iconcolor="HTTP">
        <path d="M467,73.56H45c-24.813,0-45,20.187-45,45v274.881c0,24.813,20.187,45,45,45h422c24.813,0,45-20.187,45-45V118.56 C512,93.746,491.813,73.56,467,73.56z M482,393.441c0,8.271-6.729,15-15,15H45c-8.271,0-15-6.729-15-15V177.965h452V393.441z M482,147.965H30V118.56c0-8.271,6.729-15,15-15h422c8.271,0,15,6.729,15,15V147.965z" />
        <path d="M171.741,217.264c-26.749,0-48.512,21.763-48.512,48.512v65.461c0,8.284,6.716,15,15,15s15-6.716,15-15v-28.435h37.023 v28.435c0,8.284,6.716,15,15,15s15-6.716,15-15v-65.461C220.253,239.027,198.49,217.264,171.741,217.264z M190.253,272.803H153.23 v-7.026h-0.001c0-10.208,8.305-18.512,18.512-18.512c10.207,0,18.512,8.304,18.512,18.512V272.803z" />
        <path
          d="M295.255,217.264H256c-8.284,0-15,6.716-15,15v98.973c0,8.284,6.716,15,15,15s15-6.716,15-15v-28.435h24.255
          c23.583,0,42.77-19.187,42.77-42.77C338.025,236.45,318.838,217.264,295.255,217.264z M295.255,272.803H271v-25.538h24.255
          c7.041,0,12.77,5.729,12.77,12.77C308.025,267.077,302.296,272.803,295.255,272.803z"
        />
        <path
          d="M373.771,217.264c-8.284,0-15,6.716-15,15v98.973c0,8.284,6.716,15,15,15s15-6.716,15-15v-98.973
          C388.771,223.98,382.055,217.264,373.771,217.264z"
        />
      </g>
    </svg>
  );

  const templete = [
    {
      icon: <Plus size={14} />,
      label: "Nova Coleção",
      shortcut: "Ctrl+N",
      onClick: () => triggerNewCollection(),
    },
    // {
    //   icon: <FileDown size={14} />,
    //   label: "Exportar Coleção",
    //   shortcut: "Ctrl+S",
    //   onClick: () => handleExportCollection(),
    // },
    {
      icon: <FileDown size={14} />,
      label: "Exportar Como",
      subMenu: [
        {
          icon: iconJSON,
          label: "Exportar como JSON",
          onClick: () => handleExportCollection(),
        },
        {
          icon: iconHTTP,
          label: "Exportar como HTTP",
          onClick: () => handleExportHttp(),
        },
      ],
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
    isDev,
  };
}
