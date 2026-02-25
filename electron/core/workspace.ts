/**
 * Workspace Types (TS)
 * Define a estrutura de um Workspace, que agrupa usuários, coleções e configurações globais.
 */

/**
 * Papéis de usuário dentro de um Workspace.
 */
export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

/**
 * Representação de um Usuário participante do Workspace.
 */
export interface WorkspaceUser {
  id: string; // ID único do usuário
  name: string; // Nome de exibição
  email: string; // Email de contato/login
  role: WorkspaceRole; // Nível de permissão no workspace
  avatar?: string; // URL ou base64 da imagem de perfil
}

/**
 * Representação de um ambiente de variáveis no Workspace.
 */
export interface WorkspaceEnvironment {
  id: string; // ID único do ambiente (ex: env_prod)
  name: string; // Nome do ambiente (ex: Produção, Local)
  variables: Array<{
    key: string; // Nome da variável (ex: base_url)
    value: string; // Valor da variável
    enabled: boolean; // Se está ativa para uso
  }>;
}

/**
 * Configurações visuais ou de comportamento do Workspace.
 */
export interface WorkspaceSettings {
  theme: "light" | "dark" | "system"; // Tema preferencial
  sidebarCollapsed: boolean; // Estado da barra lateral
  proxy?: {
    enabled: boolean;
    url: string;
  };
}

/**
 * Interface principal de um Workspace.
 */
export interface WorkspaceData {
  id: string; // ID único do workspace
  name: string; // Nome do workspace
  description: string; // Breve descrição sobre o projeto/workspace
  ownerId: string; // ID do usuário que criou/é dono principal

  /**
   * Usuários que têm acesso a este workspace.
   */
  members: WorkspaceUser[];

  /**
   * Lista de IDs das coleções que pertencem a este workspace.
   * As coleções físicas podem estar salvas separadamente.
   */
  collectionIds: string[];

  /**
   * Ambientes de variáveis compartilhados entre as coleções do workspace.
   */
  environments: WorkspaceEnvironment[];

  /**
   * ID do ambiente que está selecionado no momento.
   */
  activeEnvironmentId?: string;

  /**
   * Configurações específicas deste workspace.
   */
  settings: WorkspaceSettings;

  /**
   * Metadados de tempo.
   */
  createdAt: number; // Timestamp de criação
  updatedAt: number; // Timestamp da última modificação
}

/**
 * Modelo para criação de novos Workspaces.
 */
export class WorkspaceTemplate {
  /**
   * Inicializa um novo objeto de Workspace com valores padrão.
   */
  static createWorkspace(name: string, owner: WorkspaceUser): WorkspaceData {
    const now = Date.now();
    return {
      id: `ws_${now}`,
      name: name,
      description: "",
      ownerId: owner.id,
      members: [owner],
      collectionIds: [],
      environments: [
        {
          id: `env_default_${now}`,
          name: "Ambiente Global",
          variables: [],
        },
      ],
      settings: {
        theme: "system",
        sidebarCollapsed: false,
      },
      createdAt: now,
      updatedAt: now,
    };
  }
}
