import { WebContents } from "electron";

export interface IAppMessenger {
  sendToMain(channel: string, ...args: any[]): void;
  sendToUpdate(channel: string, ...args: any[]): void;
  sendToWindow(window: WebContents | null, channel: string, ...args: any[]): void;
  focusMain(): void;
}
