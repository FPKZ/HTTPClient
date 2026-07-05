import React, { createContext, useContext } from "react";
import { useWorkspaceEdit } from "../hooks/useWorkspaceEdit";

type WorkspaceEditContextType = ReturnType<typeof useWorkspaceEdit>;

const WorkspaceEditContext = createContext<WorkspaceEditContextType | null>(null);

export function WorkspaceEditProvider({ children }: { children: React.ReactNode }) {
  const value = useWorkspaceEdit();
  return (
    <WorkspaceEditContext.Provider value={value}>
      {children}
    </WorkspaceEditContext.Provider>
  );
}

export function useWorkspaceEditContext() {
  const context = useContext(WorkspaceEditContext);
  if (!context) {
    throw new Error(
      "useWorkspaceEditContext deve ser utilizado dentro de um WorkspaceEditProvider"
    );
  }
  return context;
}
