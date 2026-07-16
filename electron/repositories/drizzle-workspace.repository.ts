import { eq, and, sql, inArray } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { IWorkspaceRepository } from "../interfaces/workspace-repository.interface";

export class DrizzleWorkspaceRepository implements IWorkspaceRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }

  async getWorkspaces(userId: string): Promise<any[]> {
    const userMemberships = await this.db
      .select({ workspaceId: schema.workspaceMembers.workspaceId })
      .from(schema.workspaceMembers)
      .where(eq(schema.workspaceMembers.userId, userId));

    const wsIds = userMemberships.map((m) => m.workspaceId);
    if (wsIds.length === 0) return [];

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
      const collectionsCountResult = await this.db
        .select({ count: sql<number>`count(${schema.collections.id})` })
        .from(schema.collections)
        .where(eq(schema.collections.workspaceId, ws.id));

      const count = collectionsCountResult[0]?.count || 0;

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
  }

  async getWorkspaceDetails(id: string): Promise<any> {
    const workspace = await this.db.query.workspaces.findFirst({
      where: eq(schema.workspaces.id, id),
    });

    if (!workspace) return null;

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
  }

  async createWorkspace(params: { name: string; ownerId: string; icon?: string; description?: string }): Promise<any> {
    const { name, ownerId, icon, description } = params;
    const id = `ws_${Date.now()}`;

    await this.db.transaction((tx) => {
      tx.insert(schema.workspaces).values({
        id,
        name,
        description: description || null,
        icon: icon || "box",
        ownerId,
      }).run();

      tx.insert(schema.workspaceMembers).values({
        workspaceId: id,
        userId: ownerId,
        role: "admin",
      }).run();
    });

    return this.getWorkspaceDetails(id);
  }

  async updateWorkspace(workspace: any): Promise<boolean> {
    await this.db
      .update(schema.workspaces)
      .set({
        name: workspace.name,
        description: workspace.description || null,
        icon: workspace.icon || "box",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.workspaces.id, workspace.id))
      .run();

    return true;
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    await this.db.transaction((tx) => {
      tx.update(schema.collections)
        .set({ workspaceId: null })
        .where(eq(schema.collections.workspaceId, id))
        .run();

      tx.delete(schema.workspaceMembers)
        .where(eq(schema.workspaceMembers.workspaceId, id))
        .run();

      tx.delete(schema.workspaces).where(eq(schema.workspaces.id, id)).run();
    });

    return true;
  }

  async linkCollection(workspaceId: string, collectionId: string): Promise<boolean> {
    await this.db
      .update(schema.collections)
      .set({
        workspaceId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.collections.id, collectionId))
      .run();

    return true;
  }

  async unlinkCollection(collectionId: string): Promise<boolean> {
    await this.db
      .update(schema.collections)
      .set({
        workspaceId: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.collections.id, collectionId))
      .run();

    return true;
  }

  async findUserByEmail(email: string): Promise<any> {
    return this.db.query.profiles.findFirst({
      where: eq(schema.profiles.email, email),
    });
  }

  async upsertMember(workspaceId: string, userId: string, role: string): Promise<boolean> {
    await this.db
      .insert(schema.workspaceMembers)
      .values({
        workspaceId,
        userId,
        role: role as any,
      })
      .onConflictDoUpdate({
        target: [schema.workspaceMembers.workspaceId, schema.workspaceMembers.userId],
        set: {
          role: role as any,
          updatedAt: new Date().toISOString(),
        },
      })
      .run();

    return true;
  }

  async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    await this.db
      .delete(schema.workspaceMembers)
      .where(
        and(
          eq(schema.workspaceMembers.workspaceId, workspaceId),
          eq(schema.workspaceMembers.userId, userId)
        )
      )
      .run();

    return true;
  }
}
