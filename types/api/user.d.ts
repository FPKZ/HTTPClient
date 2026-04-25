import { User } from "../entities/user";

export interface UserAPI {
    getUser: () => Promise<User>;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    register: (email: string, password: string) => Promise<User>;
    update: (user: User) => Promise<User>;
    onUserChangerd: (callback: (user: User) => void) => () => void;
}