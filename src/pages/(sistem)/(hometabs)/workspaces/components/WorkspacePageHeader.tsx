import { Plus } from "lucide-react";
import { useWorkspacePageContext } from "../context/WorkspacePageContext";

export default function WorkspacePageHeader() {
  const { setIsOpenCreateModal } = useWorkspacePageContext();

  return (
    <div className="flex w-full items-center justify-between mt-4 mb-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Seus Workspaces
        </h1>
        <p className="text-zinc-400 text-[0.9rem]">
          Gerencie seus ambientes de desenvolvimento e colaboração.
        </p>
      </div>
      
      <button
        onClick={() => setIsOpenCreateModal(true)}
        className="
          flex items-center gap-1.5 px-4 py-2.5
          bg-brand hover:bg-brand-hover text-zinc-950
          font-bold text-sm rounded-md shadow-lg shadow-brand/15
          transition-all duration-200 hover:scale-[1.02] cursor-pointer
        "
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>Criar Novo</span>
      </button>
    </div>
  );
}
