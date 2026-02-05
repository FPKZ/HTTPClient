const fs = require("fs");
const path = require("path");
const os = require("os");
const { app } = require("electron");
const { Tail } = require("tail");

class ActionLogger {
  constructor() {
    const userDataPath = app.getPath("userData");
    const logsDir = path.join(userDataPath, "logs");
    this.tail = null;

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.logPath = path.join(logsDir, "ActionLog");
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

  ensureLogFileExists() {
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.logPath)) fs.writeFileSync(this.logPath, '');
  }

  logRead(window) {
    this.ensureLogFileExists();

    this.logStop();
    
    try {
      this.tail = new Tail(this.logPath, {
        fromBeginning: true,
        fsWatchOptions: {
          interval: 1000,
        },
        follow: true,
      });

      this.tail.on("line", (line) => {
        if(window && !window.isDestroyed()){
          console.log("Enviando log para a janela", line);
          window.webContents.send("new-action-log", line);
        } else {
          this.logStop();
        }
      });

      this.tail.on("error", (error) => {
        console.error("Failed to read ActionLog:", error);
        this.logStop();
      });

    } catch (error) {
      console.error("Failed to read ActionLog:", error);
      return null;
    }
  }

  logStop() {
    if(this.tail){
      try{
        this.tail.unwatch();
      } catch (error) {
        console.error("Failed to stop ActionLog:", error);
      }
      this.tail = null;
    }
  }
}

module.exports = new ActionLogger();
