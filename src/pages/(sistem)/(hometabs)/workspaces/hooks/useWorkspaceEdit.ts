import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useWorkspacesStore from "@/core/store/slices/useWorkspacesStore";
import { Workspace } from "@/types";

export function useWorkspaceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workspaces, updateWorkspace, removeWorkspace, isLoading } = useWorkspacesStore();

  // Encontra a versão básica em cache
  const cachedWorkspace = workspaces.find((w) => w.id === id);

  // Detecta se o workspace que estamos editando foi excluído (por ex, via Sync ou exclusão local)
  useEffect(() => {
    const exists = workspaces.some((w) => w && w.id === id);
    if (!isLoading && !exists) {
      console.log(`[useWorkspaceEdit] Workspace ${id} não existe na lista. Redirecionando...`);
      navigate("/workspaces");
    }
  }, [workspaces, isLoading, id, navigate]);

  const handleDeleteWorkspace = async () => {
    if (!id) return;
    try {
      await removeWorkspace(id);
    } catch (error) {
      console.error("Erro ao deletar workspace na página de edição:", error);
    }
  };

  // Estados locais detalhados do banco de dados
  const [workspace, setWorkspace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados locais para inputs
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Visibilidade pública (simulada localmente)
  const [isPublic, setIsPublic] = useState(true);

  // Atividade simulada de 7 dias (alturas em porcentagem para o gráfico)
  const activityData = [40, 55, 30, 80, 50, 45, 70];

  // Carrega os detalhes completos do workspace do banco local via IPC
  const loadWorkspaceDetails = async () => {
    if (!id) return;
    if ((window as any).electronAPI) {
      setLoading(true);
      try {
        const details = await (window as any).electronAPI.getWorkspaceDetails(id);
        if (details) {
          setWorkspace(details);
          setNameInput(details.name || "");
          setDescriptionInput(details.description || "");
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes do workspace do SQLite:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadWorkspaceDetails();
  }, [id]);

  // Sincroniza estados caso a store atualize a versão cached
  useEffect(() => {
    if (cachedWorkspace && !workspace) {
      setNameInput(cachedWorkspace.name || "");
      setDescriptionInput(cachedWorkspace.description || "");
    }
  }, [cachedWorkspace, workspace]);

  // Ações de Nome
  const handleSaveName = async () => {
    if (!cachedWorkspace || !nameInput.trim()) return;
    
    const updated = {
      ...cachedWorkspace,
      name: nameInput.trim(),
      updatedAt: new Date().toISOString(),
    };
    
    // 1. Otimista na store
    await updateWorkspace(updated);
    
    // 2. Recarrega do SQLite
    loadWorkspaceDetails();
    setIsEditingName(false);
  };

  // Ações de Descrição
  const handleSaveDescription = async () => {
    if (!cachedWorkspace) return;
    
    const updated = {
      ...cachedWorkspace,
      description: descriptionInput.trim() || null,
      updatedAt: new Date().toISOString(),
    };

    // 1. Otimista na store
    await updateWorkspace(updated);

    // 2. Recarrega do SQLite
    loadWorkspaceDetails();
    setIsEditingDescription(false);
  };

  // Alteração de Ícone
  const handleChangeIcon = async (iconName: string) => {
    if (!cachedWorkspace) return;

    const updated = {
      ...cachedWorkspace,
      icon: iconName,
      updatedAt: new Date().toISOString(),
    };

    // 1. Otimista na store
    await updateWorkspace(updated);

    // 2. Recarrega do SQLite
    loadWorkspaceDetails();
  };

  // Alternar Visibilidade
  const handleToggleVisibility = () => {
    setIsPublic((prev) => !prev);
  };

  // Adicionar Nova Coleção real no Workspace
  const handleAddCollection = async (name: string) => {
    if (!name.trim() || !id) return;
    
    if ((window as any).electronAPI) {
      try {
        const collectionId = `coll_${Date.now()}`;
        // Cria a coleção no banco
        await (window as any).electronAPI.saveHistory({
          id: collectionId,
          name: name.trim(),
          workspaceId: id,
          items: [],
          environments: [],
        });
        
        // Recarrega os detalhes do workspace
        loadWorkspaceDetails();
      } catch (err) {
        console.error("Erro ao criar coleção vinculada:", err);
      }
    }
  };

  // Desvincular Coleção do Workspace
  const handleDeleteCollection = async (collectionId: string) => {
    if ((window as any).electronAPI) {
      try {
        await (window as any).electronAPI.unlinkCollection(collectionId);
        loadWorkspaceDetails();
      } catch (err) {
        console.error("Erro ao desvincular coleção:", err);
      }
    }
  };

  // Exportar Coleção
  const handleExportCollection = async (col: any) => {
    if ((window as any).electronAPI) {
      try {
        const colData = await (window as any).electronAPI.getCollectionForExport(col.id);
        if (colData) {
          const savePath = await (window as any).electronAPI.selectSaveLocation();
          if (savePath) {
            await (window as any).electronAPI.saveFile({
              path: savePath,
              content: JSON.stringify(colData, null, 2),
            });
            alert(`Coleção "${col.name}" exportada com sucesso.`);
          }
        }
      } catch (err) {
        console.error("Erro ao exportar coleção:", err);
      }
    }
  };

  // Convidar Novo Membro real
  const handleInviteMember = async (_name: string, email: string) => {
    if (!id || !email.trim()) return;

    if ((window as any).electronAPI) {
      try {
        await (window as any).electronAPI.inviteMember({
          workspaceId: id,
          email: email.trim(),
          role: "viewer",
        });
        loadWorkspaceDetails();
      } catch (err: any) {
        alert(err.message || "Erro ao convidar membro. Verifique se o e-mail está cadastrado localmente no app.");
      }
    }
  };

  // Mudar Permissão/Role do Membro
  const handleChangeMemberRole = async (memberId: string, role: "viewer" | "editor" | "admin") => {
    if (!id || !workspace) return;

    const member = workspace.users?.find((u: any) => u.id === memberId);
    if (!member || !member.email) return;

    if ((window as any).electronAPI) {
      try {
        await (window as any).electronAPI.inviteMember({
          workspaceId: id,
          email: member.email,
          role,
        });
        loadWorkspaceDetails();
      } catch (err) {
        console.error("Erro ao mudar cargo do membro:", err);
      }
    }
  };

  // Remover Membro da Equipe
  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;

    if ((window as any).electronAPI) {
      try {
        await (window as any).electronAPI.removeMember({
          workspaceId: id,
          userId: memberId,
        });
        loadWorkspaceDetails();
      } catch (err) {
        console.error("Erro ao remover membro do workspace:", err);
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // As coleções vinculadas reais
  const linkedCollections = workspace?.collections || [];

  return {
    workspace: workspace || cachedWorkspace,
    loading,
    nameInput,
    setNameInput,
    descriptionInput,
    setDescriptionInput,
    isEditingName,
    setIsEditingName,
    isEditingDescription,
    setIsEditingDescription,
    isPublic,
    linkedCollections,
    activityData,
    handleSaveName,
    handleSaveDescription,
    handleChangeIcon,
    handleToggleVisibility,
    handleAddCollection,
    handleDeleteCollection,
    handleExportCollection,
    handleInviteMember,
    handleChangeMemberRole,
    handleRemoveMember,
    handleGoBack,
    handleDeleteWorkspace,
  };
}
