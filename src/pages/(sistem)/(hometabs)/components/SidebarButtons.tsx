import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FolderTree, FolderOpen, Folder, Settings, Boxes, Box } from "lucide-react";


export default function SideBarButtons({handleSetSideBar}: any) {

  const location = useLocation();

  const navigate = useNavigate();

  const mocap = [
    {
      icon: (active: boolean) =>
        active ? (
          <FolderOpen strokeWidth={2.5} size={20} />
        ) : (
          <Folder strokeWidth={2.5} size={20} />
        ),
      title: "home",
      href: "/home",
      func: () => {handleSetSideBar("collection"), navigate("home")},
    },
    {
      icon: (active: boolean) => (
          <div className="flex flex-col items-center">
            <Box className={active ? "fill-yellow-500" : `fill-zinc-400 group-hover:fill-yellow-400`} strokeWidth={2.5} size={10} />
            <div className="flex">
              <Box className={active ? "fill-yellow-500" : `fill-zinc-400 group-hover:fill-yellow-400`} strokeWidth={2.5} size={10} />
              <Box className={active ? "fill-yellow-500" : `fill-zinc-400 group-hover:fill-yellow-400`} strokeWidth={2.5} size={10} />
            </div>
          </div>
        ),
        title: "workspaces",
        href: "/workspaces",
        func: () => handleSetSideBar("workspace"),
      },
      {
        icon: () => <FolderTree strokeWidth={2.5} size={20} />,
        title: "Colecoes",
        href: "/",
        func: () => navigate("/"),
    }
  ];

  return (
    <div className="grid flex-col w-13 bg-zinc-900/60 text-zinc-400">
      <div className="w-full">
        <div className="grid grid-cols-1 justify-start items-center w-full">
          {mocap.map((button) => (
            <button
              key={button.title}
              className={`flex items-center justify-center w-full py-3.5 cursor-pointer relative group ${location.pathname === button.href ? "text-yellow-500" : "hover:text-yellow-400"} `}
              onClick={button.func}
            >
              {location.pathname === button.href && (
                <div className="absolute left-0 h-full w-0.5 bg-yellow-500"></div>
              )}
              {button.icon(location.pathname === button.href)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-self-end justify-end items-center p-2 gap-2">
        <button className="p-1.5 cursor-pointer group">
          <Settings
            strokeWidth={2.5}
            size={20}
            className="group-hover:text-white"
            onClick={() => handleSetSideBar("user")}
          />
        </button>
      </div>
    </div>
  );
}
