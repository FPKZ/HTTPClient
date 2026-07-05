import { eq, and, sql, inArray } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { IWorkspaceService } from "../interfaces/workspace-service.interface";

export class WorkspaceService implements IWorkspaceService {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }

  /**
   * Busca a lista resumida de workspaces associados ao usuário logado.
   */
  async getWorkspaces(userId: string): Promise<any[]> {
    if (!userId) return [];

    try {
      // 1. Busca os workspaces onde o usuário é membro
      const userMemberships = await this.db
        .select({ workspaceId: schema.workspaceMembers.workspaceId })
        .from(schema.workspaceMembers)
        .where(eq(schema.workspaceMembers.userId, userId));

      const wsIds = userMemberships.map((m) => m.workspaceId);
      if (wsIds.length === 0) return [];

      // 2. Busca os dados dos workspaces encontrados
      const results = await this.db
        .select({
          id: schema.workspaces.id,
          name: schema.workspaces.name,
          description: schema.workspaces.description,
          icon: schema.workspaces.icon,
          ownerId: schema.workspaces.ownerId,
          createdAt: schema.workspaces.createdAt,
          updatedAt: schema.workspaces.updatedAt,
        })
        .from(schema.workspaces)
        .where(inArray(schema.workspaces.id, wsIds));

      const wsList = [];

      for (const ws of results) {
        // Contagem de coleções vinculadas
        const collectionsCountResult = await this.db
          .select({ count: sql<number>`count(${schema.collections.id})` })
          .from(schema.collections)
          .where(eq(schema.collections.workspaceId, ws.id));

        const count = collectionsCountResult[0]?.count || 0;

        // Busca básica de membros do workspace (apenas nome e avatarUrl para listagem rápida)
        const members = await this.db
          .select({
            id: schema.profiles.id,
            name: schema.profiles.name,
            avatarUrl: schema.profiles.avatarUrl,
            role: schema.workspaceMembers.role,
          })
          .from(schema.profiles)
          .innerJoin(
            schema.workspaceMembers,
            eq(schema.profiles.id, schema.workspaceMembers.userId)
          )
          .where(eq(schema.workspaceMembers.workspaceId, ws.id));

        wsList.push({
          ...ws,
          collectionsCount: count,
          users: members,
        });
      }

      return wsList;
    } catch (error) {
      console.error("[WorkspaceService] Erro ao buscar workspaces:", error);
      return [];
    }
  }

  /**
   * Busca detalhes de um workspace específico.
   */
  async getWorkspaceDetails(id: string): Promise<any> {
    try {
      const workspace = await this.db.query.workspaces.findFirst({
        where: eq(schema.workspaces.id, id),
      });

      if (!workspace) return null;

      // Busca coleções vinculadas
      const collectionsList = await this.db
        .select({
          id: schema.collections.id,
          name: schema.collections.name,
          description: schema.collections.description,
          storageType: schema.collections.storageType,
          updatedAt: schema.collections.updatedAt,
        })
        .from(schema.collections)
        .where(eq(schema.collections.workspaceId, id));

      // Busca membros do workspace
      const members = await this.db
        .select({
          id: schema.profiles.id,
          name: schema.profiles.name,
          email: schema.profiles.email,
          avatarUrl: schema.profiles.avatarUrl,
          role: schema.workspaceMembers.role,
        })
        .from(schema.profiles)
        .innerJoin(
          schema.workspaceMembers,
          eq(schema.profiles.id, schema.workspaceMembers.userId)
        )
        .where(eq(schema.workspaceMembers.workspaceId, id));

      return {
        ...workspace,
        collectionsId: collectionsList.map((c) => c.id),
        collections: collectionsList,
        users: members,
        collectionsCount: collectionsList.length,
      };
    } catch (error) {
      console.error("[WorkspaceService] Erro ao buscar detalhes do workspace:", error);
      return null;
    }
  }

  /**
   * Cria um novo workspace e vincula o criador como proprietário/admin.
   */
  async createWorkspace(params: {
    name: string;
    ownerId: string;
    icon?: string;
    description?: string;
  }): Promise<any> {
    const { name, ownerId, icon, description } = params;
    console.log("[WorkspaceService] createWorkspace chamado com params:", params);

    if (!ownerId) {
      throw new Error("Usuário deve estar autenticado para criar um workspace.");
    }

    const id = `ws_${Date.now()}`;

    try {
      await this.db.transaction((tx) => {
        // Insere o workspace
        tx.insert(schema.workspaces).values({
          id,
          name,
          description: description || null,
          icon: icon || "box",
          ownerId,
        }).run();

        // Vincula o dono como membro administrador
        tx.insert(schema.workspaceMembers).values({
          workspaceId: id,
          userId: ownerId,
          role: "admin",
        }).run();
      });
      console.log("[WorkspaceService] transação de criação finalizada para id:", id);

      const details = await this.getWorkspaceDetails(id);
      console.log("[WorkspaceService] getWorkspaceDetails para id", id, "retornou:", details);
      return details;
    } catch (error) {
      console.error("[WorkspaceService] Erro ao criar workspace:", error);
      throw error;
    }
  }

  /**
   * Atualiza as informações do workspace.
   */
  async updateWorkspace(workspace: any): Promise<boolean> {
    try {
      await this.db
        .update(schema.workspaces)
        .set({
          name: workspace.name,
          description: workspace.description || null,
          icon: workspace.icon || "box",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.workspaces.id, workspace.id));

      return true;
    } catch (error) {
      console.error("[WorkspaceService] Erro ao atualizar workspace:", error);
      return false;
    }
  }

  /**
   * Remove o workspace e suas referências locais de forma limpa.
   */
  async deleteWorkspace(id: string): Promise<boolean> {
    try {
      await this.db.transaction((tx) => {
        // 1. Desvincula as coleções (define workspaceId = null)
        tx
          .update(schema.collections)
          .set({ workspaceId: null })
          .where(eq(schema.collections.workspaceId, id))
          .run();

        // 2. Remove os membros associados
        tx
          .delete(schema.workspaceMembers)
          .where(eq(schema.workspaceMembers.workspaceId, id))
          .run();

        // 3. Remove o workspace fisicamente
        tx.delete(schema.workspaces).where(eq(schema.workspaces.id, id)).run();
      });

      return true;
    } catch (error) {
      console.error("[WorkspaceService] Erro ao deletar workspace:", error);
      return false;
    }
  }

  /**
   * Vincula uma coleção a um workspace.
   */
  async linkCollection(workspaceId: string, collectionId: string): Promise<boolean> {
    try {
      await this.db
        .update(schema.collections)
        .set({
          workspaceId,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.collections.id, collectionId));

      return true;
    } catch (error) {
      console.error("[WorkspaceService] Erro ao vincular coleção:", error);
      return false;
    }
  }

  /**
   * Desvincula uma coleção de seu workspace.
   */
  async unlinkCollection(collectionId: string): Promise<boolean> {
    try {
      await this.db
        .update(schema.collections)
        .set({
          workspaceId: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.collections.id, collectionId));

      return true;
    } catch (error) {
      console.error("[WorkspaceService] Erro ao desvincular coleção:", error);
      return false;
    }
  }

  /**
   * Convida/vincula um novo membro ao workspace.
   */
  async inviteMember(
    workspaceId: string,
    email: string,
    role?: "viewer" | "editor" | "admin"
  ): Promise<boolean> {
    try {
      // Busca o perfil correspondente ao email fornecido
      const user = await this.db.query.profiles.findFirst({
        where: eq(schema.profiles.email, email),
      });

      if (!user) {
        throw new Error(`Usuário com o email "${email}" não encontrado.`);
      }

      // Insere ou atualiza o papel do membro
      await this.db
        .insert(schema.workspaceMembers)
        .values({
          workspaceId,
          userId: user.id,
          role: role || "viewer",
        })
        .onConflictDoUpdate({
          target: [schema.workspaceMembers.workspaceId, schema.workspaceMembers.userId],
          set: {
            role: role || "viewer",
            updatedAt: new Date().toISOString(),
          },
        });

      return true;
    } catch (error) {
      console.error("[WorkspaceService] Erro ao convidar membro:", error);
      throw error;
    }
  }

  /**
   * Remove um membro do workspace.
   */
  async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    try {
      await this.db
        .delete(schema.workspaceMembers)
        .where(
          and(
            eq(schema.workspaceMembers.workspaceId, workspaceId),
            eq(schema.workspaceMembers.userId, userId)
          )
        );

      return true;
    } catch (error) {
      console.error("[WorkspaceService] Erro ao remover membro:", error);
      return false;
    }
  }
}

export default WorkspaceService;
