import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useWorkspacesStore from "@/core/store/slices/useWorkspacesStore";
import useUserStore from "@/core/store/useUserStore";
import { Workspace, User } from "@/types";

export function useWorkspacePage() {
  const { 
    workspaces, 
    activeWorkspace, 
    loadWorkspaces, 
    addWorkspace, 
    removeWorkspace, 
    setActiveWorkspace 
  } = useWorkspacesStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);

  // Efeito para carregar os workspaces do SQLite local ao montar ou mudar de usuário
  useEffect(() => {
    if (user?.id) {
      loadWorkspaces(user.id);
    }
  }, [user?.id, loadWorkspaces]);

  const handleCreateWorkspace = (name: string, description?: string) => {
    if (!name.trim()) return;
    if (!user?.id) {
      alert("Você precisa estar autenticado para criar um workspace.");
      return;
    }

    const tempId = `temp_${Date.now()}`;
    
    // Lista de ícones disponíveis
    const iconsList = ["terminal", "globe", "gauge", "box"];
    const randomIcon = iconsList[Math.floor(Math.random() * iconsList.length)];

    // Cria membro principal a partir do usuário logado
    const currentMember: Omit<User, 'email'> & { email?: string } = {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };

    const newWorkspace: Workspace = {
      id: tempId,
      name,
      description: description || null,
      icon: randomIcon,
      ownerId: user.id,
      updatedAt: new Date().toISOString(),
      collectionsId: [],
      collectionsCount: 0,
      users: [currentMember],
    };

    addWorkspace(newWorkspace);
    setIsOpenCreateModal(false);
  };

  const handleDeleteWorkspace = (id: string) => {
    removeWorkspace(id);
    if (activeWorkspace?.id === id) {
      const remaining = workspaces.filter(w => w.id !== id);
      setActiveWorkspace(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleSelectWorkspace = (workspace: Workspace) => {
    navigate(`/workspace/${workspace.id}`);
  };

  const handleEditWorkspace = (id: string) => {
    navigate(`/workspace/${id}`);
  };

  return {
    workspaces,
    activeWorkspace,
    isOpenCreateModal,
    setIsOpenCreateModal,
    handleCreateWorkspace,
    handleDeleteWorkspace,
    handleSelectWorkspace,
    handleEditWorkspace,
  };
}
