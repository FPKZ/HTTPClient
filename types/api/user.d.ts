import { User } from "../entities/user";

export interface UserAPI {
    getUser: () => Promise<User | null>;
    login: (email: string, password: string) => Promise<{ success: boolean, user?: User, error?: string }>;
    logout: () => Promise<{ success: boolean, error?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean, user?: User, error?: string }>;
    socialLogin: (provider: 'google' | 'github') => Promise<{ success: boolean, error?: string }>;
    // handleAuthCallback: (url: string) => Promise<{ success: boolean, user?: User, error?: string }>;
    onUserChanged: (callback: (user: User) => void) => () => void;
}