import { ArrowLeft } from "lucide-react";
import { WorkspaceEditProvider, useWorkspaceEditContext } from "./context/WorkspaceEditContext";
import IconSelector from "./components/edit/IconSelector";
import InfoFields from "./components/edit/InfoFields";
import ActivityChart from "./components/edit/ActivityChart";
import VisibilityToggle from "./components/edit/VisibilityToggle";
import LinkedCollections from "./components/edit/LinkedCollections";
import TeamMembers from "./components/edit/TeamMembers";

function WorkspaceEditContent() {
  const { workspace, handleGoBack, handleDeleteWorkspace } = useWorkspaceEditContext();

  if (!workspace) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-bg-app p-8 text-zinc-400">
        <span className="text-sm font-semibold">Workspace não encontrado.</span>
        <button
          onClick={handleGoBack}
          className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded hover:text-white transition-all cursor-pointer"
        >
          Voltar para Workspaces
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-bg-app p-8 flex flex-col custom-scrollbar select-none">
      <div className="max-w-6xl w-full mx-auto flex flex-col">
        {/* Botão de Voltar */}
        <button
          onClick={handleGoBack}
          className="
            flex items-center gap-1.5 mb-6 text-xs font-bold text-zinc-500
            hover:text-zinc-300 transition-colors cursor-pointer outline-none w-fit
          "
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          <span>VOLTAR PARA WORKSPACES</span>
        </button>

        {/* Topo: Ícone, Info e Gráfico */}
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          <IconSelector />
          
          <div className="flex-1 w-full lg:px-4">
            <InfoFields />
            {/* <VisibilityToggle /> */}
            <button onClick={handleDeleteWorkspace} className="mt-3 bg-danger text-white font-semibold w-fit px-3 py-1.5 rounded cursor-pointer">
              Apagar workspace
            </button>
          </div>

          <ActivityChart />
        </div>

        {/* Linha Divisória */}
        <div className="my-8 border-t border-zinc-900/60 w-full" />

        {/* Rodapé: Coleções Vinculadas e Membros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          <LinkedCollections />
          <TeamMembers />
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceEdit() {
  return (
    <WorkspaceEditProvider>
      <WorkspaceEditContent />
    </WorkspaceEditProvider>
  );
}