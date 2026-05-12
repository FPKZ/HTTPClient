export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  updatedAt: string;
}

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}

export interface IUserService {
  initSession(): Promise<User | null>;
  signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }>;
  signUpWithEmail(params: CreateUserParams): Promise<{ success: boolean; user?: User; error?: string }>;
  signInWithOAuth(provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }>;
  handleAuthCallback(url: string): Promise<{ success: boolean; user?: any } | undefined>;
  logout(): Promise<{ success: boolean }>;
  getCurrentUser(): User | null;
}
