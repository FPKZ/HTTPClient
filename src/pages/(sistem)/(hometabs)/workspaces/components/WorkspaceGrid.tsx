import useWorkspacesStore from "@/core/store/slices/useWorkspacesStore";
import WorkspaceGridCard from "./WorkspaceGridCard";
import AddWorkspaceCard from "./AddWorkspaceCard";

export default function WorkspaceGrid() {
  const { workspaces } = useWorkspacesStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full @container">
      {(workspaces || []).filter(Boolean).map((workspace) => (
        <WorkspaceGridCard
          key={workspace.id}
          workspace={workspace}
        />
      ))}
      
      <AddWorkspaceCard />
    </div>
  );
}
