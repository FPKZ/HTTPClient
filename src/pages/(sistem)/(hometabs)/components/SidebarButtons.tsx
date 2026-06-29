import { useNavigate, useLocation } from "react-router-dom";
import { FolderTree, FolderOpen, Folder, Settings, Boxes, Box } from "lucide-react";
import useSideBar from "@/core/hooks/useSideBar";


export default function SideBarButtons() {
  const navigate = useNavigate();

  const { sidebar, Buttons } = useSideBar();

  const { activeSidebar, sideBarIsOpen, setActiveSidebar } = sidebar;

  // Um botão está "ativo" se a sidebar correspondente está visível E aberta
  const isActive = (sidebar: string) => activeSidebar === sidebar && sideBarIsOpen;

  return (
    <div className="grid flex-col w-13 bg-bg-panel text-zinc-400">
      <div className="w-full">
        <div className="grid grid-cols-1 justify-start items-center w-full">
          {Buttons.map((button) => {
            const active = isActive(button.title);
            return (
              <button
                key={button.title}
                className={`flex items-center justify-center w-full py-3.5 cursor-pointer relative group ${active ? "text-yellow-500" : "hover:text-yellow-400"}`}
                onClick={button.func}
              >
                {active && (
                  <div className="absolute left-0 h-full w-0.5 bg-yellow-500"></div>
                )}
                {button.icon(active)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col justify-self-end justify-end items-center p-2 gap-2">
        <button className="p-1.5 cursor-pointer group">
          <Settings
            strokeWidth={2.5}
            size={20}
            className={`${isActive("user") ? "text-yellow-500" : "group-hover:text-white"}`}
            onClick={() => setActiveSidebar("user")}
          />
        </button>
      </div>
    </div>
  );
}
