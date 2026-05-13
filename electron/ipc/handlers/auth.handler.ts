import { ipcMain } from "electron";
import { BaseHandler } from "./base.handler";
import { IUserService } from "../../interfaces/user-service.interface";

export class AuthHandler extends BaseHandler {
  private user: IUserService;

  constructor(userService: IUserService) {
    super();
    this.user = userService;
  }

  register(): void {
    ipcMain.handle("auth:get-user", () => this.user.getCurrentUser());
    ipcMain.handle("auth:login", (_event, { email, password }) => this.user.signInWithEmail(email, password));
    ipcMain.handle("auth:logout", () => this.user.logout());
    ipcMain.handle("auth:signup", (_event, params) => this.user.signUpWithEmail(params));
    ipcMain.handle("auth:social-login", (_event, provider: 'google' | 'github') => this.user.signInWithOAuth(provider));
    ipcMain.handle("auth:cancel", () => this.user.cancelOAuth());
    ipcMain.handle("auth:update-profile", (_event, params) => this.user.updateProfile(params));
  }
}
