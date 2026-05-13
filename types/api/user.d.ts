import { User } from "../entities/user";

export interface UserAPI {
    getUser: () => Promise<User | null>;
    login: (email: string, password: string) => Promise<{ success: boolean, user?: User, error?: string }>;
    logout: () => Promise<{ success: boolean, error?: string }>;
    register: (params: { email: string; password: string; name: string }) => Promise<{ success: boolean, user?: User, error?: string }>;
    socialLogin: (provider: 'google' | 'github') => Promise<{ success: boolean, error?: string }>;
    cancelAuth: () => Promise<void>;
    updateProfile: (params: Partial<User>) => Promise<{ success: boolean, user?: User, error?: string }>;
    // handleAuthCallback: (url: string) => Promise<{ success: boolean, user?: User, error?: string }>;
    onUserChanged: (callback: (user: User) => void) => () => void;
}