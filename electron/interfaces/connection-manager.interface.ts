export interface IConnectionManager {
  connectWebSocket(requestId: string, url: string, headers: any, sender: any): void;
  sendWebSocket(requestId: string, message: string): void;
  disconnectWebSocket(requestId: string): void;
  connectSse(requestId: string, url: string, headers: any, sender: any): void;
  disconnectSse(requestId: string): void;
  disconnectAll(requestId: string): void;
}
