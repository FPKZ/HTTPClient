import { Workspaces } from "../../electron/db/schema/workspaces.schema"
import { User } from "./user"


export interface Workspace extends Omit<Workspaces, 'createdAt'> {
  collectionsId?: string[]
  collectionsCount?: number,
  users: (Omit<User, 'email'> & { email?: string })[]
}