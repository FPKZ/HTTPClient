/**
 * User service 
 * Refatorado para integrar com Supabase Auth e Banco de Dados Local (SQLite)
 */

class UserService {
    /**
     * @param {import('./supabase-service.cjs')} supabaseService 
     * @param {import('../utils/local-db-provider.cjs')} localDbProvider 
     */
    constructor(supabaseService, localDbProvider) {
        this.supabaseService = supabaseService;
        this.dbProvider = localDbProvider;
        this.user = null; // Usuário logado em memória
    }

    get supabase() {
        return this.supabaseService.getClient();
    }

    get db() {
        return this.dbProvider.getDb();
    }

    /**
     * Tenta recuperar a sessão ativa do Supabase/Local no startup
     */
    async initSession() {
        if (!this.supabaseService.isActive()) return;
        
        const { data, error } = await this.supabase.auth.getSession();
        if (data && data.session && data.session.user) {
            this.setLocalUserFromAuth(data.session.user);
        }
    }

    /**
     * Realiza o login via Supabase
     */
    async login(email, password) {
        if (!this.supabaseService.isActive()) {
            return { success: false, error: 'Serviço de Nuvem indisponível.' };
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data && data.user) {
                this.setLocalUserFromAuth(data.user);
                return { success: true, user: this.user };
            }

            return { success: false, error: 'Erro desconhecido ao logar.' };
            
        } catch (error) {
            console.error('[UserService] Erro ao logar:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Realiza o registro via Supabase
     */
    async register(email, password, displayName = '') {
        if (!this.supabaseService.isActive()) {
            return { success: false, error: 'Serviço de Nuvem indisponível.' };
        }

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: displayName
                    }
                }
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data && data.user) {
                this.setLocalUserFromAuth(data.user);
                return { success: true, user: this.user };
            }

            return { success: false, error: 'Erro ao registrar.' };
            
        } catch (error) {
            console.error('[UserService] Erro ao registrar:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Encerra sessão
     */
    async logout() {
        try {
            if (this.supabaseService.isActive()) {
                await this.supabase.auth.signOut();
            }
            this.user = null;
            return { success: true };
        } catch (error) {
            console.error('[UserService] Erro ao deslogar:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sincroniza os dados do usuário autenticado para a tabela SQLite local
     */
    setLocalUserFromAuth(authUser) {
        const userId = authUser.id;
        const email = authUser.email;
        const displayName = authUser.user_metadata?.name || email.split('@')[0];
        const avatarUrl = authUser.user_metadata?.avatar_url || null;

        try {
            // Upsert no BD Local para Cache
            const stmt = this.db.prepare(`
                INSERT INTO users (id, email, display_name, avatar_url)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    email=excluded.email,
                    display_name=excluded.display_name,
                    avatar_url=excluded.avatar_url
            `);
            
            stmt.run(userId, email, displayName, avatarUrl);

            this.user = {
                id: userId,
                email: email,
                displayName: displayName,
                avatar: avatarUrl
            };
        } catch (err) {
            console.error('[UserService] Falha ao persistir usuário localmente:', err);
        }
    }

    getUser() {
        return this.user;
    }

    async update(userParams) {
        // Implementação futura de update de profile
        return { success: false, error: 'Not implemented' };
    }
}

module.exports = UserService;
