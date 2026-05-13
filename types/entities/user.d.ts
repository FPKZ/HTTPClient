/**
 * Tipo canônico do usuário autenticado.
 * Compartilhado entre o Renderer e o preload.
 * A fonte de verdade é o UserService no processo Main.
 */
export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    updatedAt?: string;
}