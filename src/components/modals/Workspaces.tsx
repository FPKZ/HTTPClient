import React, { useMemo } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useHistory } from "@/core/hooks/useHistory";

interface WorkspaceMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface WorkspaceEnvironmentVariable {
  key: string;
  value: string;
  enabled: boolean;
}

interface WorkspaceEnvironment {
  id: number;
  name: string;
  variables: WorkspaceEnvironmentVariable[];
}

interface WorkspaceSettings {
  theme: string;
  sidebarCollapsed: boolean;
}

interface Workspace {
  id: number;
  name: string;
  description: string;
  members: WorkspaceMember[];
  collectionIds: any[];
  environments: WorkspaceEnvironment[];
  activeEnvironmentId: number;
  settings: WorkspaceSettings;
  createdAt: number;
  updatedAt: number;
}

interface WorkspacesProps {
  children: React.ReactNode;
}

export default function Workspaces({ children }: WorkspacesProps) {
  const { history } = useHistory();

  const workspaces: Workspace[] = useMemo(
    () => [
      {
        id: 1,
        name: "Workspace 1",
        description: "Workspace 1",
        members: [
          {
            id: 1,
            name: "User 1",
            email: "user1@user.com",
            role: "owner",
            avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          },
        ],
        collectionIds: history,
        environments: [
          {
            id: 1,
            name: "Ambiente 1",
            variables: [
              {
                key: "base_url",
                value: "https://api.com",
                enabled: true,
              },
            ],
          },
        ],
        activeEnvironmentId: 1,
        settings: {
          theme: "dark",
          sidebarCollapsed: false,
        },
        createdAt: 1740506000000,
        updatedAt: 1740506000000,
      },
      {
        id: 2,
        name: "Workspace 2",
        description: "Workspace 2",
        members: [
          {
            id: 1,
            name: "User 2",
            email: "user2@user.com",
            role: "owner",
            avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          },
        ],
        collectionIds: history,
        environments: [
          {
            id: 1,
            name: "Ambiente 2",
            variables: [
              {
                key: "base_url",
                value: "https://api.com",
                enabled: true,
              },
            ],
          },
        ],
        activeEnvironmentId: 1,
        settings: {
          theme: "dark",
          sidebarCollapsed: false,
        },
        createdAt: 1740506000000,
        updatedAt: 1740506000000,
      },
      {
        id: 3,
        name: "Workspace 3",
        description: "Workspace 3",
        members: [
          {
            id: 1,
            name: "User 3",
            email: "user3@user.com",
            role: "owner",
            avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          },
        ],
        collectionIds: history,
        environments: [
          {
            id: 1,
            name: "Ambiente 3",
            variables: [
              {
                key: "base_url",
                value: "https://api.com",
                enabled: true,
              },
            ],
          },
        ],
        activeEnvironmentId: 1,
        settings: {
          theme: "dark",
          sidebarCollapsed: false,
        },
        createdAt: 1740506000000,
        updatedAt: 1740506000000,
      },
    ],
    [history],
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="bg-transparent border-none p-0 cursor-pointer">{children}</button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="
                        min-w-[180px] max-h-[400px]
                        text-[0.8rem] 
                        bg-zinc-900 
                        border border-zinc-700! 
                        p-2 
                        rounded-sm 
                        shadow-2xl 
                        z-50!
                        flex flex-col
                        animate-in zoom-in-95 duration-100
                    "
        >
          <div className="flex items-center gap-2 py-1">
            <input
              type="text"
              placeholder="Procurar"
              className="outline-none border border-zinc-700! bg-zinc-950 text-zinc-200 rounded-sm px-2 py-1 flex-1 text-xs"
            />
            <button className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-2 py-1 rounded-sm! border-none text-[0.7rem] transition-colors cursor-pointer">
              Criar Workspace
            </button>
          </div>
          <div className="py-1 mt-2 flex flex-col flex-1 overflow-y-auto gap-2 scrollbar-thin scrollbar-thumb-zinc-700">
            {workspaces.map((item, index) => (
              <div key={item.id || index}>
                <span className="text-[0.7rem] font-bold text-zinc-400 truncate px-2 py-1 block">
                  {item.name}
                </span>
                <div className="flex flex-col py-1 px-1 mx-2 border-s border-zinc-700!">
                  {item.collectionIds.map((collection, cIndex) => (
                    <span
                      key={collection.id || cIndex}
                      className="
                                                text-[0.7rem] truncate 
                                                px-2 py-1 rounded-sm!
                                                text-zinc-300
                                                hover:bg-zinc-800
                                                hover:text-white
                                                cursor-pointer
                                                transition-colors
                                            "
                    >
                      {collection.name}
                    </span>
                  ))}
                  {item.collectionIds.length === 0 && (
                    <span className="text-[0.6rem] text-zinc-600 px-2 font-italic">Nenhuma coleção</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
