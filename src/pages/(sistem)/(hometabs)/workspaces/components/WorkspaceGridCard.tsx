import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Check, Edit2, Trash2 } from "lucide-react";
import { Workspace } from "@/types";
import { useWorkspacePageContext } from "../context/WorkspacePageContext";
import { getRelativeTime } from "@/utils/dateUtils";
import { useWorkspaceTheme } from "@/core/hooks/useWorkspaceTheme";

interface WorkspaceGridCardProps {
  workspace: Workspace;
}

export default function WorkspaceGridCard({ workspace }: WorkspaceGridCardProps) {
  const {
    activeWorkspace,
    handleSelectWorkspace,
    handleDeleteWorkspace,
    handleEditWorkspace,
  } = useWorkspacePageContext();

  const isActive = activeWorkspace?.id === workspace.id;
  const { Icon, colorClass, bgClass } = useWorkspaceTheme(workspace.icon);
  const totalMembers = workspace.users?.length || 0;

  return (
    <div
      onClick={() => handleSelectWorkspace(workspace)}
      className={`
        flex flex-col justify-between p-5 min-h-[170px]
        rounded-lg border cursor-pointer select-none transition-all duration-200
        bg-[#111112] hover:bg-[#141416] group
        ${isActive
          ? "border-brand/40 shadow-[0_0_15px_rgba(255,191,0,0.03)]"
          : "border-zinc-800 hover:border-zinc-700/60"
        }
      `}
    >
      <div className="flex flex-col gap-3 w-full">
        {/* Header do Card */}
        <div className="flex items-center gap-3 w-full min-w-0">
          {/* Caixa de Ícone Customizada */}
          <div
            className={`
              w-9 h-9 rounded-md flex items-center justify-center shrink-0 border
              ${bgClass}
            `}
          >
            <Icon className={colorClass} size={18} strokeWidth={2.2} />
          </div>

          {/* Nome e Badges */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`
                  font-bold text-[0.95rem] tracking-tight leading-tight truncate
                  ${isActive ? "text-brand" : "text-zinc-100 group-hover:text-white"}
                `}
              >
                {workspace.name}
              </span>
              
              {isActive && (
                <span
                  className="
                    flex items-center gap-1 px-1.5 py-0.5 rounded shrink-0
                    bg-green-500/10 text-green-400 border border-green-500/20
                    text-[8px] font-extrabold uppercase tracking-widest
                  "
                >
                  <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                  Ativo
                </span>
              )}
            </div>
          </div>

          {/* Timestamp Relativo (somente inativos) */}
          {!isActive && (
            <span className="text-zinc-500 text-[0.75rem] font-medium shrink-0 ml-auto">
              {getRelativeTime(workspace.updatedAt)}
            </span>
          )}
        </div>

        {/* Descrição do Workspace */}
        <p className="text-zinc-400 text-[0.825rem] leading-relaxed line-clamp-2 mt-1 pr-2">
          {workspace.description || "Sem descrição disponível."}
        </p>
      </div>

      {/* Footer do Card */}
      <div className="flex justify-between items-center w-full mt-4 pt-3 border-t border-zinc-900/60">
        {/* Avatares dos Membros */}
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-1.5">
            {workspace.users?.slice(0, 3).map((user, idx) => (
              <div
                key={user.id || idx}
                className="
                  flex items-center justify-center rounded-full w-5 h-5 
                  bg-zinc-800 border border-zinc-950 text-[0.6rem] font-bold text-zinc-300
                  overflow-hidden relative select-none
                "
                title={user.name}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span>{user.name?.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
            ))}
            
            {totalMembers > 3 && (
              <div
                className="
                  flex items-center justify-center rounded-full w-5 h-5
                  bg-zinc-900 border border-zinc-950 text-zinc-500 text-[0.55rem] font-bold
                "
              >
                +{totalMembers - 3}
              </div>
            )}
          </div>

          <span className="text-zinc-400 text-[0.75rem] font-medium">
            {totalMembers} {totalMembers === 1 ? "membro" : "membros"}
          </span>
        </div>

        {/* Botão de Menu Três Pontos */}
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <button
                className="
                  p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900
                  transition-all duration-150 cursor-pointer outline-none
                "
              >
                <MoreVertical size={16} />
              </button>
            </Dropdown.Trigger>

            <Dropdown.Portal>
              <Dropdown.Content
                align="end"
                sideOffset={5}
                className="
                  min-w-[140px] p-1 rounded-md border border-zinc-800 bg-[#161618]
                  shadow-xl z-50 text-zinc-300 animate-in fade-in slide-in-from-top-1
                "
              >
                {!isActive && (
                  <Dropdown.Item
                    onClick={() => handleSelectWorkspace(workspace)}
                    className="
                      flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-semibold
                      hover:text-white hover:bg-zinc-800 rounded cursor-pointer outline-none
                    "
                  >
                    <Check size={12} className="text-green-500" />
                    <span>Ativar</span>
                  </Dropdown.Item>
                )}
                
                <Dropdown.Item
                  onClick={() => handleEditWorkspace(workspace.id)}
                  className="
                    flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-semibold
                    hover:text-white hover:bg-zinc-800 rounded cursor-pointer outline-none
                  "
                >
                  <Edit2 size={12} />
                  <span>Editar</span>
                </Dropdown.Item>

                <Dropdown.Item
                  onClick={() => handleDeleteWorkspace(workspace.id)}
                  className="
                    flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-semibold
                    text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded
                    cursor-pointer outline-none border-t border-zinc-800/40 mt-1 pt-1.5
                  "
                >
                  <Trash2 size={12} />
                  <span>Excluir</span>
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        </div>
      </div>
    </div>
  );
}
