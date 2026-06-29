import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModalUser from "./ui/ModalUser";
import Workspaces from "./modals/Workspaces";
import Icons from "@/assets/Icons";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { MenuItem } from "./DropdownMenu";
import { Bell, ChevronDown, User } from "lucide-react";

import { useMenuGeral } from "@/core/hooks/useMenuGeral";
import useDialogStore from "@/core/store/useDialogStore";
import useUserStore from "@/core/store/useUserStore";
import useTabStore from "@/core/store/useTabStore";
import useCollectionStore from "@/core/store/useCollectionStore";
import useInterfaceStore from "@/core/store/useInterfaceStore";

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
    <div className="window-controls flex no-drag h-full">
      <button
        onClick={handleMinimize}
        className="btn-control h-full text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
        title="Minimizar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect fill="currentColor" width="10" height="1.5" x="1" y="6"></rect>
        </svg>
      </button>
      <button
        onClick={handleMaximize}
        className="btn-control h-full text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
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
            strokeWidth="1.5"
          ></rect>
        </svg>
      </button>
      <button
        onClick={handleClose}
        className="btn-control h-full text-zinc-400 hover:text-zinc-100 hover:bg-red-500 transition-colors duration-200"
        title="Fechar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M2 2l8 8M10 2l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          ></path>
        </svg>
      </button>
    </div>
  );
}

function TitleBarContent() {
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const activeTab = useTabStore((state) => state.getActiveTab());
  const collectionName = useCollectionStore((state) => state.collection.name);

  const { fileMenu, isDev, viewMenu } = useMenuGeral();

  // Controla qual menu está aberto (menubar behavior)
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  const menu = {
    File: fileMenu,
    // "Edit": [],
    View: viewMenu,
    // "History": [],
    // "Settings": [],
  };

  const pathsName = ["/home", "/workspaces", "/"];

  return (
    // Alterado de 'flex' para 'grid grid-cols-3' e adicionado 'w-full' (o correto no Tailwind é w-full e não w-100)
    <div className="grid grid-cols-3 w-full items-center mx-2 px-0">
      {/* 1. LADO ESQUERDO: Alinhado à esquerda por padrão */}
      <div className="flex items-center justify-start gap-4">
        <div>
          <ul className="flex items-center p-0 m-0 text-[0.8rem] font-[system-ui] no-drag">
            {Object.entries(menu).map(([key, value]) => (
              <Dropdown.Root
                key={key}
                open={openMenu === key}
                onOpenChange={(isOpen) => setOpenMenu(isOpen ? key : null)}
                modal={false}
              >
                <Dropdown.Trigger asChild>
                  <li
                    className="
                      py-1 px-2
                      cursor-pointer 
                      text-zinc-400 hover:text-white data-[state=open]:text-white!
                      hover:bg-[#2c2c2c] data-[state=open]:bg-[#2c2c2c]
                      rounded 
                      transition-all duration-200
                    "
                    onPointerDown={() => {
                      // onPointerDown dispara ANTES do Radix interceptar o evento,
                      // garantindo a troca imediata entre menus ao clicar
                      if (openMenu !== null && openMenu !== key) {
                        setOpenMenu(key);
                      }
                    }}
                    onMouseEnter={() => {
                      // Troca ao passar o mouse quando qualquer menu está aberto
                      if (openMenu !== null && openMenu !== key) {
                        setOpenMenu(key);
                      }
                    }}
                  >
                    {key}
                  </li>
                </Dropdown.Trigger>
                <Dropdown.Content
                  align="start" // "start" | "center" | "end" → alinhamento horizontal em relação ao trigger
                  side="bottom" // "top" | "right" | "bottom" | "left" → lado onde abre
                  sideOffset={0} // px de distância do trigger
                  alignOffset={0} // px de deslocamento no eixo de alinhamento
                  avoidCollisions // (boolean) evita sair da viewport
                  collisionPadding={8} // margem de segurança com as bordas da tela
                  className="min-w-55 bg-zinc-800 shadow-[0_0_0.5rem_rgba(0,0,0,0.1)] p-1 rounded-sm z-60!"
                >
                  {value?.map((item, index) => (
                    <MenuItem
                      item={item}
                      index={index}
                      size="md"
                      variant="default"
                      classNames={{
                        item: "text-[0.7rem]! bg-zinc-800 shadow-[0_0_0.5rem_rgba(0,0,0,0.2)] border-0",
                        subTrigger:
                          "text-[0.7rem]! bg-zinc-800 shadow-[0_0_0.5rem_rgba(0,0,0,0.2)] border-0",
                        subContent:
                          "text-[0.7rem]! bg-zinc-800 shadow-[0_0_0.5rem_rgba(0,0,0,0.2)] border-0",
                      }}
                    />
                  ))}
                </Dropdown.Content>
              </Dropdown.Root>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. CENTRO: justify-self-center garante o alinhamento perfeito no meio do pai */}
      <div className="justify-self-center max-w-full text-zinc-400 text-center text-[0.7rem] m-0 truncate tracking-wider">
        {pathsName.includes(location.pathname)
          ? collectionName &&
            `${collectionName}${location.pathname === "/home" ? `${activeTab?.title ? " - " + activeTab.title : ""}` : ""}`
          : ""}
      </div>

      {/* 3. LADO DIREITO: justify-self-end joga todo o bloco para a extremidade direita */}
      <div className="justify-self-end">
        <div className="flex items-center gap-2">
          {collectionName && (
            <Workspaces>
              <div
                className="
                  px-2 py-1 flex items-center justify-center 
                  border
                  rounded-full
                  text-zinc-400 text-xs font-semibold
                  no-drag
                "
              >
                <span className="m-0 truncate max-w-60">
                  Workspace: {collectionName}
                </span>
              </div>
            </Workspaces>
          )}
          <div className="h-5 w-0.5 bg-zinc-700" />
          {/* <Settings /> */}
          {user && <Bell fill="white" size={18} />}
          <ModalUser>
            <div className="h-full flex items-center px-1 py-1 gap-0.5 hover:bg-zinc-800 rounded transition-all duration-300 cursor-pointer no-drag">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#ffc107]">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-[0.6rem] font-extrabold">
                    {user?.name ? (
                      user.name.substring(0, 2).toUpperCase()
                    ) : (
                      <User size={14} strokeWidth={3} />
                    )}
                  </span>
                )}
              </div>
              <ChevronDown size={14} strokeWidth={2} />
            </div>
          </ModalUser>
        </div>
      </div>
    </div>
  );
}

export default function TitleBar() {
  // const { templete, devTemplete, isDev } = useMenuGeral();
  const { fullLogo } = Icons();
  const location = useLocation();
  const navigate = useNavigate();

  const deleteActiveTab = useTabStore((state) => state.deleteActiveTab);
  const getCollectionForExport = useCollectionStore(
    (state) => state.getCollectionForExport,
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
    // if (location.pathname !== "/" && location.pathname !== "/home") {
    //   deleteActiveTab();
    // }
    if (
      (window as any).electronAPI &&
      (window as any).electronAPI.onMenuAction
    ) {
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
      className="titlebar titlebar-drag-region flex justify-between items-center"
      style={{ backgroundColor: "#1e1e1e", height: "35px", color: "white" }}
    >
      <div
        className="titlebar-left flex items-center gap-2 ml-2 no-drag cursor-pointer"
        onClick={() => navigate("/")}
      >
        {/* <img src={icon} alt="Icon" style={{ width: "20px", height: "20px" }} /> */}
        {/* <span className="fw-bold">HTTPClient</span> */}
        {fullLogo({ width: "78", height: "50" })}
      </div>

      <TitleBarContent />

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
