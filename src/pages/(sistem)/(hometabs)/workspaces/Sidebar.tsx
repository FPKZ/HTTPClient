import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorkspaceCard from "./WorkspaceCard";
import useWorkspacesStore from "@/core/store/slices/useWorkspacesStore";

export default function SidebarWorkspaces() {

  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspacesStore();

  return (
    <div className="flex flex-col w-full flex-1 min-h-0 text-sm">
      <div className="flex flex-col gap-3 w-full p-3 pt-2 bg-zinc-900 ">
        <input type="text" placeholder="Buscar Workspace" className="w-full py-1 px-2 bg-zinc-950 text-zinc-200 border border-zinc-700" />
        <button
          className="flex items-center justify-center py-1 gap-2 bg-yellow-600 hover:bg-yellow-600/50 transition-colors cursor-pointer"
        >
          <PlusCircle size={16} strokeWidth={3} />
          <span>Novo Workspace</span>
        </button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col border-t border-zinc-700 bg-zinc-950/60 w-full">
        <div className="flex flex-col gap-2 p-2 w-full flex-1 min-h-0 overflow-y-auto">
          {(workspaces || []).filter(Boolean).map((workspace, index) =>  (
            <WorkspaceCard key={workspace.id} index={index} workspace={workspace} />
            )
          )}
        </div>
      </div>
    </div>
  )
}