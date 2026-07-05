import { Plus } from "lucide-react";
import { useWorkspacePageContext } from "../context/WorkspacePageContext";

export default function AddWorkspaceCard() {
  const { setIsOpenCreateModal } = useWorkspacePageContext();

  return (
    <div
      onClick={() => setIsOpenCreateModal(true)}
      className="
        flex flex-col items-center justify-center min-h-[170px] p-6
        border-2 border-dashed border-zinc-800/80 hover:border-zinc-700/60
        bg-transparent hover:bg-zinc-900/10 rounded-lg cursor-pointer
        transition-all duration-200 group select-none
      "
    >
      <div
        className="
          w-9 h-9 rounded-md flex items-center justify-center mb-3
          bg-zinc-900/60 border border-zinc-800 text-zinc-400
          group-hover:bg-zinc-800 group-hover:text-white transition-all duration-200
        "
      >
        <Plus size={16} strokeWidth={2.5} />
      </div>
      <span
        className="
          text-zinc-500 group-hover:text-zinc-300
          font-bold text-sm transition-all duration-200
        "
      >
        Adicionar Novo Workspace
      </span>
    </div>
  );
}
