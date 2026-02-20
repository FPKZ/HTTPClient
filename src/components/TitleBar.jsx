import React from "react";
import icon from "../assets/icon1.png";
import { Menu, Plus, Settings, SquareTerminal, FileDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import DropdownMenuComponent from "./DropdownMenu";
import { useMenuGeral } from "../hooks/useMenuGeral";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import useTabStore from "../store/useTabStore";
import icons from "../assets/icons";
import useDialogStore from "../store/useDialogStore";

export default function TitleBar() {
  const { templete, devTemplete, isDev } = useMenuGeral();
  const { fullLogo } = icons();
  const location = useLocation();

  const activeTab = useTabStore((state) => state.getActiveTab());
  const deleteActiveTab = useTabStore((state) => state.deleteActiveTab);
  const getCollectionForExport = useTabStore(
    (state) => state.getCollectionForExport,
  );
  const showDialog = useDialogStore((state) => state.showDialog);

  // Registra os atalhos de teclado globais apenas quando o menu geral é visível
  const menuItems =
    (location.pathname === "/" &&
      (isDev ? [...templete, ...devTemplete] : templete)) ||
    [];
  useKeyboardShortcuts(menuItems);

  const handleMinimize = () => window.electronAPI.minimize();
  const handleMaximize = () => window.electronAPI.maximize();

  const handleClose = async () => {
    if (location.pathname === "/") {
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
        window.electronAPI.saveAndQuit(collectionData);
      } else if (result === false) {
        window.electronAPI.forceClose();
      }
      // Se for "cancel" ou fechar o modal (null), não faz nada (não fecha o app)
    } else {
      window.electronAPI.forceClose();
    }
  };

  React.useEffect(() => {
    if (location.pathname !== "/") {
      deleteActiveTab();
    }
    if (window.electronAPI && window.electronAPI.onMenuAction) {
      window.electronAPI.onMenuAction((action) => {
        if (action === "open-settings") {
          // alert("Configurações abertas via menu nativo!");
          // Aqui você pode adicionar a lógica para abrir um modal ou navegar
        }
      });
    }
  }, []);

  return (
    <div
      className="titlebar titlebar-drag-region d-flex justify-content-between align-items-center"
      style={{ backgroundColor: "#1e1e1e", height: "35px", color: "white" }}
    >
      <div className="titlebar-left d-flex align-items-center gap-2 ms-2">
        <img src={icon} alt="Icon" style={{ width: "20px", height: "20px" }} />
        <span className="fw-bold">HTTPClient</span>
        {/* {fullLogo({ width: "66", height: "40" })} */}
      </div>

      <div className="flex-1 mx-5 px-5 text-center text-[0.7rem] truncate">
        {activeTab?.title || ""}
      </div>

      <div className="window-controls d-flex no-drag h-100">
        {location.pathname === "/" && (
          <div className="btn-control">
            <DropdownMenuComponent
              buttonContent={
                <Menu
                  size={16}
                  title="Menu"
                  strokeWidth={2}
                  className="text-zinc-100"
                />
              }
              items={menuItems}
            />
          </div>
        )}
        <button
          onClick={handleMinimize}
          className="btn-control h-100"
          title="Minimizar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="btn-control h-100"
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
              strokeWidth="1"
            ></rect>
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="btn-control hover-red h-100"
          title="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M2 2l8 8M10 2l-8 8"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            ></path>
          </svg>
        </button>
      </div>
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
          color: white;
          width: 36px;

          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        .btn-control:hover {
          background: rgba(255,255,255,0.1);
        }
        .hover-red:hover {
          background: #e81123 !important;
        }
      `}</style>
    </div>
  );
}
