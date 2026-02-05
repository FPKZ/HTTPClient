const fs = require("fs");
const path = require("path");
const os = require("os");
const { app } = require("electron");

class ActionLogger {
  constructor() {
    const userDataPath = app.getPath("userData");
    const logsDir = path.join(userDataPath, "logs");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.logPath = path.join(logsDir, "ActonLog");
  }

  getIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
        if (iface.family === "IPv4" && !iface.internal) {
          return [iface.address, iface.mac];
        }
      }
    }
    return ["127.0.0.1", "00:00:00:00:00:00"];
  }

  log(action, user = null) {
    const timestamp = new Date().toLocaleString("pt-BR");
    const identifier = this.getIpAddress();
    const logEntry = `[${timestamp}] [${identifier[0]} - ${identifier[1]}${user ? ` - (${user})` : ""}] - ${action}\n`;

    try {
      fs.appendFileSync(this.logPath, logEntry);
      return true;
    } catch (error) {
      console.error("Failed to write to ActionLog:", error);
      return false;
    }
  }
  logClear() {
    try {
      fs.writeFileSync(this.logPath, "");
      return true;
    } catch (error) {
      console.error("Failed to clear ActionLog:", error);
      return false;
    }
  }
}

module.exports = new ActionLogger();
