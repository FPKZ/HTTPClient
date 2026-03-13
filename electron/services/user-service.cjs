const bcrypt = require("bcrypt");

//MOCAP
const mocapUsers = [
    {
        id: "1",
        name: "Luis Felipe",
        email: "felipedosantos.tr@gmail.com",
        displayName: "Luis Felipe",
        emailVerified: true,
        phone: "1234567890",
        phoneVerified: true,
        password: bcrypt.hashSync("felipe1706", bcrypt.genSaltSync(10)),
        avatar: "https://example.com/avatar.jpg",
        provider: "email",
        autoSave: true,
        defaultWorkspaceId: "1",
        updatedAt: "2022-01-01T00:00:00.000Z",
        createdAt: "2022-01-01T00:00:00.000Z",
        deletedAt: null,
    },
    {
        id: "2",
        name: "Jorge",
        email: "jorgeGay@gmail.com",
        displayName: "Jorge",
        emailVerified: true,
        phone: "1234567890",
        phoneVerified: true,
        password: bcrypt.hashSync("jorge123", bcrypt.genSaltSync(10)),
        avatar: "https://example.com/avatar.jpg",
        provider: "email",
        autoSave: true,
        defaultWorkspaceId: "1",
        updatedAt: "2022-01-01T00:00:00.000Z",
        createdAt: "2022-01-01T00:00:00.000Z",
        deletedAt: null,
    }
]

/**
 * User service 
 */

class UserService {
    constructor() {
        this.user = null
    }

    async login(email, password) {
        try {
            //verificação de login no banco de dados
            // const user = await this.storage.getUserByEmail(email);
            const user = mocapUsers.find((user) => user.email === email);
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return { success: false, error: 'Invalid password' };
            }
            this.user = user;

            this.user = new User(user);
            
            return { success: true, user };
            
        } catch (error) {
            console.error('Error logging in:', error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            this.user = null;
            return { success: true };
        } catch (error) {
            console.error('Error logging out:', error);
            return { success: false, error: error.message };
        }
    }

    getUser() {
        return this.user;
    }
}

class User {
    constructor(user) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.displayName = user.displayName;
        this.emailVerified = user.emailVerified;
        this.phone = user.phone;
        this.phoneVerified = user.phoneVerified;
        this.password = user.password;
        this.avatar = user.avatar;
        this.provider = user.provider;
        this.autoSave = user.autoSave;
        this.defaultWorkspaceId = user.defaultWorkspaceId;
        this.updatedAt = user.updatedAt;
        this.createdAt = user.createdAt;
        this.deletedAt = user.deletedAt;
    }

    async register(email, password) {
        try {
            //verificação de registro no banco de dados
            // const user = await this.storage.getUserByEmail(email);
            // if (user) {
            //     return { success: false, error: 'User already exists' };
            // }
            // this.user = user;
            const user = {
                id: "1",
                name: "Felipe",
                email: "[EMAIL_ADDRESS]",
                displayName: "Felipe",
                emailVerified: true,
                phone: "1234567890",
                phoneVerified: true,
                password: "[PASSWORD]",
                avatar: "https://example.com/avatar.jpg",
                provider: "email",
                autoSave: true,
                defaultWorkspaceId: "1",
                updatedAt: "2022-01-01T00:00:00.000Z",
                createdAt: "2022-01-01T00:00:00.000Z",
                deletedAt: null,
            };
            
            return { success: true, user };
            
        } catch (error) {
            console.error('Error registering:', error);
            return { success: false, error: error.message };
        }
    }

    async update(user) {
        try {
            //verificação de atualização no banco de dados
            // const user = await this.storage.getUserByEmail(email);
            // if (user) {
            //     return { success: false, error: 'User already exists' };
            // }
            // this.user = user;
            const user = {
                id: "1",
                name: "Felipe",
                email: "[EMAIL_ADDRESS]",
                displayName: "Felipe",
                emailVerified: true,
                phone: "1234567890",
                phoneVerified: true,
                password: "[PASSWORD]",
                avatar: "https://example.com/avatar.jpg",
                provider: "email",
                autoSave: true,
                defaultWorkspaceId: "1",
                updatedAt: "2022-01-01T00:00:00.000Z",
                createdAt: "2022-01-01T00:00:00.000Z",
                deletedAt: null,
            };
            
            return { success: true, user };
            
        } catch (error) {
            console.error('Error updating:', error);
            return { success: false, error: error.message };
        }
    }
}

class UserSettings {
    constructor() {
        this.user_id = null;
        this.auto_save_enabled = null;
        this.default_workspace_id = null;
        this.updated_at = null;
        this.created_at = null;
    }
}

module.exports = UserService
