const fs = require("fs");
const { app } = require("electron");
const moment = require("moment");

export default (message, type = "info") => {
  const appPath = app.getPath("home");
  const filePath = `${appPath}/.nssm/log.txt`;
  const dateTime = moment().format();
  const logMessage = `[${type.toUpperCase()}] ${dateTime}: ${message}`;

  if (!fs.existsSync(filePath)) {
    try {
      fs.mkdirSync(`${appPath}/.nssm/`, { recursive: true });
      fs.writeFileSync(filePath, logMessage, "utf8");
    } catch (e) {
      console.log("Issue writing log file:", e);
    }
  } else {
    const logContents = fs.readFileSync(filePath);
    try {
      fs.writeFileSync(filePath, `${logContents}\n${logMessage}`, "utf8");
    } catch (e) {
      console.log("Issue writing log file:", e);
    }
  }
};
