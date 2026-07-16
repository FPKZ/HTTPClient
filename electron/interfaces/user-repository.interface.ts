import { User } from "./user-service.interface";

export interface IUserRepository {
  deleteProfile(id: string): Promise<boolean>;
  updateProfile(id: string, updates: Partial<User>): Promise<boolean>;
  upsertProfile(user: User): Promise<boolean>;
}
