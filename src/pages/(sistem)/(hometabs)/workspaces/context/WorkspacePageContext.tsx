import React, { createContext, useContext } from "react";
import { useWorkspacePage } from "../hooks/useWorkspacePage";

type WorkspacePageContextType = ReturnType<typeof useWorkspacePage>;

const WorkspacePageContext = createContext<WorkspacePageContextType | null>(null);

export function WorkspacePageProvider({ children }: { children: React.ReactNode }) {
  const value = useWorkspacePage();
  return (
    <WorkspacePageContext.Provider value={value}>
      {children}
    </WorkspacePageContext.Provider>
  );
}

export function useWorkspacePageContext() {
  const context = useContext(WorkspacePageContext);
  if (!context) {
    throw new Error(
      "useWorkspacePageContext deve ser utilizado dentro de um WorkspacePageProvider"
    );
  }
  return context;
}
