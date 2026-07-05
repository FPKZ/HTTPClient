import { WorkspacePageProvider } from "./context/WorkspacePageContext";
import WorkspacePageHeader from "./components/WorkspacePageHeader";
import WorkspaceGrid from "./components/WorkspaceGrid";
import CreateWorkspaceModal from "./components/CreateWorkspaceModal";

export default function WorkspacePage() {
  return (
    <WorkspacePageProvider>
      <div className="w-full h-full overflow-y-auto bg-bg-app p-8 flex flex-col custom-scrollbar select-none">
        <div className="max-w-6xl w-full mx-auto flex flex-col">
          {/* Cabeçalho de Workspaces */}
          <WorkspacePageHeader />

          {/* Grid de Workspaces */}
          <WorkspaceGrid />
        </div>

        {/* Modal de Criação de Workspace */}
        <CreateWorkspaceModal />
      </div>
    </WorkspacePageProvider>
  );
}