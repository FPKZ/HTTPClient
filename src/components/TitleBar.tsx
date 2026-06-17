import React from "react";
// import icon from "../assets/icon1.png";
// import { Menu, Plus, Settings, SquareTerminal, FileDown } from "lucide-react";
import { useLocation } from "react-router-dom";
// import { DropdownMenuComponent } from "./DropdownMenu";
import ModalUser from "./ui/ModalUser";
// import { useMenuGeral } from "@/core/hooks/useMenuGeral";
import Workspaces from "./modals/Workspaces";
// import { useKeyboardShortcuts } from "@/core/hooks/useKeyboardShortcuts";
import useTabStore from "@/core/store/useTabStore";
import icons from "../assets/icons";
import useDialogStore from "@/core/store/useDialogStore";
import useUserStore from "@/core/store/useUserStore";

interface ActionButtonsProps {
  handleMinimize: () => void;
  handleMaximize: () => void;
  handleClose: () => void;
}

function ActionButtons({
  handleMinimize,
  handleMaximize,
  handleClose,
}: ActionButtonsProps) {
  return (
    <div className="window-controls d-flex no-drag h-100">
      <button
        onClick={handleMinimize}
        className="btn-control h-100 text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
        title="Minimizar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect fill="currentColor" width="10" height="2" x="1" y="6"></rect>
        </svg>
      </button>
      <button
        onClick={handleMaximize}
        className="btn-control h-100 text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
        title="Maximizar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect
            width="9"
            height="9"
            x="1.5"
            y="1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          ></rect>
        </svg>
      </button>
      <button
        onClick={handleClose}
        className="btn-control h-100 text-zinc-400 hover:text-zinc-100 hover:bg-red-500! transition-colors duration-200"
        title="Fechar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M2 2l8 8M10 2l-8 8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          ></path>
        </svg>
      </button>
    </div>
  );
}


export default function TitleBar() {
  // const { templete, devTemplete, isDev } = useMenuGeral();
  const { fullLogo } = icons();
  const location = useLocation();

  const activeTab = useTabStore((state) => state.getActiveTab());
  const deleteActiveTab = useTabStore((state) => state.deleteActiveTab);
  const getCollectionForExport = useTabStore(
    (state) => state.getCollectionForExport
  );
  const showDialog = useDialogStore((state) => state.showDialog);

  // Registra os atalhos de teclado globais apenas quando o menu geral é visível
  // const menuItems =
  //   (location.pathname === "/" &&
  //     (isDev ? [...templete, ...devTemplete] : templete)) ||
  //   [];
  // useKeyboardShortcuts(menuItems);

  const handleMinimize = () => (window as any).electronAPI.minimize();
  const handleMaximize = () => (window as any).electronAPI.maximize();

  const handleClose = async () => {
    if (location.pathname === "/" || location.pathname === "/home") {
      const result = await showDialog({
        title: "Sair do Sistema",
        description: "Deseja salvar as alterações na coleção antes de sair?",
        options: [
          // { label: "Cancelar", value: "cancel", variant: "secondary" },
          { label: "Não", value: false, variant: "secondary" },
          { label: "Salvar", value: true, variant: "primary" },
        ],
      });

      if (result === true) {
        const collectionData = getCollectionForExport();
        (window as any).electronAPI.saveAndQuit(collectionData);
      } else if (result === false) {
        (window as any).electronAPI.forceClose();
      }
      // Se for "cancel" ou fechar o modal (null), não faz nada (não fecha o app)
    } else {
      (window as any).electronAPI.forceClose();
    }
  };

  React.useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/home") {
      deleteActiveTab();
    }
    if ((window as any).electronAPI && (window as any).electronAPI.onMenuAction) {
      (window as any).electronAPI.onMenuAction((action: string) => {
        if (action === "open-settings") {
          // alert("Configurações abertas via menu nativo!");
          // Aqui você pode adicionar a lógica para abrir um modal ou navegar
        }
      });
    }
  }, [location.pathname, deleteActiveTab]);

  return (
    <div
      className="titlebar titlebar-drag-region d-flex justify-content-between align-items-center"
      style={{ backgroundColor: "#1e1e1e", height: "35px", color: "white" }}
    >
      <div className="titlebar-left d-flex align-items-center gap-2 ms-2">
        {/* <img src={icon} alt="Icon" style={{ width: "20px", height: "20px" }} /> */}
        {/* <span className="fw-bold">HTTPClient</span> */}
        {fullLogo({ width: "78", height: "50" })}
      </div>

      <ActionButtons
        handleMinimize={handleMinimize}
        handleMaximize={handleMaximize}
        handleClose={handleClose}
      />
      <style>{`
        .titlebar {
          -webkit-app-region: drag;
          user-select: none;
        }
        .no-drag {
          -webkit-app-region: no-drag;
        }
        .btn-control {
          background: transparent;
          border: none;
          width: 36px;

          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
