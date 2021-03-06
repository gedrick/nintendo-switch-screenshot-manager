"use strict";

import fs from "fs";
import {
  app,
  protocol,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  shell
} from "electron";
import {
  createProtocol,
  installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";
const fsp = fs.promises;
const path = require("path");
const { COPYFILE_EXCL } = fs.constants;
const isDevelopment = process.env.NODE_ENV !== "production";
const testingFlags = {
  updateAvailable: false
};

import log from "../server/logging.js";
import { mainWindowTemplate, updateWindowTemplate } from "../server/windows.js";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let childWindow;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Open User Mappings",
        click: () => {
          const filePath = `${app.getPath("home")}/.nssm/user_game_ids.json`;
          if (fs.existsSync(filePath)) {
            shell.openItem(filePath);
          }
        }
      },
      {
        label: "Open Log File",
        click: () => {
          const filePath = `${app.getPath("home")}/.nssm/log.txt`;
          if (fs.existsSync(filePath)) {
            shell.openItem(filePath);
          }
        }
      },
      {
        label: "Clear Log File",
        click: () => {
          const filePath = `${app.getPath("home")}/.nssm/log.txt`;
          fs.writeFileSync(filePath, "", "utf8");
        }
      },
      {
        type: "separator"
      },
      {
        label: "Check for Updates",
        click: async () => {
          const updateAvailable = await checkForUpdates();
          if (!updateAvailable) {
            showDialogBox("You are already using the latest version.");
          } else {
            if (await checkToUpdate()) {
              createUpdateWindow();
            }
          }
        }
      },

      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
        click() {
          app.quit();
        }
      }
    ]
  },
  {
    label: "Help",
    submenu: [
      {
        label: "Submit Custom Game Mapping",
        click: async () => {
          const filePath = `${app.getPath("home")}/.nssm/user_game_ids.json`;
          const fileContents = fs.readFileSync(filePath);
          const userIds = JSON.parse(fileContents);
          const amountOfIds = Object.keys(userIds).length;
          if (!amountOfIds) {
            showDialogBox(
              "You don't currently have any custom IDs to share",
              "error"
            );
          } else {
            if (
              await showYesNoBox(
                `You have ${amountOfIds} custom IDs. Do you want to submit them?`
              )
            ) {
              const ids = Object.keys(userIds);
              let issueText = "";
              ids.forEach(id => {
                issueText += `${id}: "${userIds[id]}"\n`;
              });
              shell.openExternal(
                `https://github.com/gedrick/nintendo-switch-screenshot-manager/issues/new?title=Custom ID Submission&body=${issueText}`
              );
            }
          }
        }
      }
    ]
  }
];

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...mainWindowTemplate,
    icon: path.join(__dirname, "build/512x512.png")
  });

  Menu.buildFromTemplate(mainMenuTemplate);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    mainWindow.loadURL("app://./index.html");
  }

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createUpdateWindow() {
  childWindow = new BrowserWindow({
    ...updateWindowTemplate,
    parent: mainWindow,
    alwaysOnTop: true
  });
  childWindow.loadURL(paths.baseUrl);
  childWindow.once("ready-to-show", () => {
    childWindow.show();
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  const updateAvailable = await checkForUpdates();
  if (!updateAvailable) {
    loadApp();
  } else {
    const launchUpdater = await checkToUpdate();
    loadApp();
    if (launchUpdater) {
      createUpdateWindow();
    }
  }

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools();
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
});

async function checkToUpdate() {
  const response = await dialog.showMessageBox({
    message: `A new version is available. Would you like to download it now?`,
    type: "question",
    buttons: ["No", "Yes"],
    cancelId: 0
  });

  if (response.response === 1) {
    return true;
  }
}

async function loadApp() {
  await checkRequiredFiles();
  await importGameIds();
  createMainWindow();
}

import axios from "axios";
import paths from "./paths.js";

function addGameId(gameId, gameName) {
  const filePath = `${app.getPath("home")}/.nssm/user_game_ids.json`;
  const fileContents = fs.readFileSync(filePath, "utf8");
  const gameMap = JSON.parse(fileContents);
  gameMap[gameId] = gameName;

  try {
    fs.writeFileSync(filePath, JSON.stringify(gameMap, null, 2), "utf8");
    if (gameName) {
      log(`Wrote new game mapping for ${gameName}`);
    } else {
      log(`Wrote empty mapping for ${gameId}`);
    }
  } catch (e) {
    log(`Error writing game ID mapping: ${e}`, "error");
  }
}

function showDialogBox(message, type = "info") {
  dialog.showMessageBox(mainWindow, {
    buttons: ["OK"],
    cancelId: 0,
    type,
    message
  });
}

async function showYesNoBox(message, type = "info") {
  const dialogResult = await dialog.showMessageBox(mainWindow, {
    buttons: ["Cancel", "OK"],
    cancelId: 0,
    type,
    message
  });
  return dialogResult.response > 0;
}

ipcMain.on("show-message", (event, message, type) => {
  showDialogBox(message, type);
});

ipcMain.on(
  "ask-to-import",
  async (event, { instructions = [], unknownIds = [] }) => {
    const dialogResult = await dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["Preview Files", "Resolve Missing IDs", "Import Now"],
      message: `${instructions.length} new files were found, with ${unknownIds.length} game IDs unresolved. What would you like to do?`,
      noLink: true
    });
    event.sender.send("ask-to-import-response", dialogResult.response);
  }
);

async function checkForUpdates() {
  let res;
  try {
    res = await axios(paths.versionPath, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    // Error downloading file or user is not online.
    log("Error checking for updates or user is not online", "error");
    return false;
  }

  const { data } = res;
  const currentVersion = require("../package.json").version;
  if (
    data.latest > currentVersion ||
    (process.env.NODE_ENV !== "production" && testingFlags.updateAvailable)
  ) {
    await log(`Update available: ${data.latest}, from ${currentVersion}.`);
    return true;
  }

  return false;
}

async function importGameIds() {
  let res;
  try {
    res = await axios(paths.gameIdPath, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    log(`Error downloading latest game ID mapping: ${e}`, "error");
    res = {
      data: {}
    };
  }
  const { data } = res;
  const filePath = `${app.getPath("home")}/.nssm/game_ids.json`;
  let fileContents;

  if (fs.existsSync(filePath)) {
    fileContents = await fsp.readFile(filePath);
    const oldGameMap = JSON.parse(fileContents);
    const newGameMap = data;
    const newJson = {
      ...newGameMap,
      ...oldGameMap
    };
    await fsp.writeFile(filePath, JSON.stringify(newJson, null, 2), "utf8");
    log("Game ID mapping file was updated.");
  } else {
    try {
      await fsp.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      log(`Error updating game ID mapping: ${e}`, "error");
    }
  }
}

async function checkRequiredFiles() {
  // Some files are required as they are pulled in and/or written
  // to in the app. All are stored in $HOME/.nssm/
  // game_ids.json          all official game id maps
  // user_game_ids.json     user created game id maps
  // settings.json          saved paths and file names

  const homePath = `${app.getPath("home")}/.nssm/`;
  await fsp.mkdir(`${homePath}`, { recursive: true });

  if (!fs.existsSync(`${homePath}game_ids.json`)) {
    log(`${homePath}game_ids.json does not exist - creating now.`);
    await fsp.writeFile(`${homePath}game_ids.json`, "{}", "utf8");
  }

  if (!fs.existsSync(`${homePath}user_game_ids.json`)) {
    log(`${homePath}user_game_ids.json does not exist - creating now.`);
    await fsp.writeFile(`${homePath}user_game_ids.json`, "{}", "utf8");
  }

  if (!fs.existsSync(`${homePath}settings.json`)) {
    log(`${homePath}settings.json does not exist - creating now.`);
    await fsp.writeFile(`${homePath}settings.json`, "{}", "utf8");
  }
}

ipcMain.on("copy-files", async (event, instructions) => {
  log(`Beginning to copy ${instructions.length} files...`);

  const copyFile = async (src, dest) => {
    try {
      await fsp.mkdir(dest.substr(0, dest.lastIndexOf("/")), {
        recursive: true
      });
      await fsp.copyFile(src, dest, COPYFILE_EXCL);
    } catch (e) {
      console.log(e);
      log(
        `File already exists or there was a problem creating the directory: ${dest}`
      );
    }
  };

  instructions.forEach(async ({ file, destination }) => {
    await copyFile(file, destination);
    log(`Copied file ${file} to ${destination}.`);
  });

  log(`Finished copying files`);
  showDialogBox(`${instructions.length} have been successfully copied.`);
  event.sender.send("files-copied");
});

ipcMain.on("addGameId", (event, gameId, gameName) => {
  addGameId(gameId, gameName);
});

ipcMain.on("read-settings", async event => {
  const filePath = `${app.getPath("home")}/.nssm/settings.json`;
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const settingsObj = JSON.parse(fileContents);
    event.sender.send("receive-settings", settingsObj);
  } catch (e) {
    event.sender.send("receive-settings", {});
  }
});

function updateSettingsFile(key, newValue) {
  let filePath = `${app.getPath("home")}/.nssm/settings.json`;
  console.log("trying to save file", filePath);
  let fileContents;
  let fileJson = {};

  if (fs.existsSync(filePath)) {
    fileContents = fs.readFileSync(filePath);
    fileJson = JSON.parse(fileContents);
  }

  fileJson[key] = newValue;

  try {
    return fs.writeFileSync(
      filePath,
      JSON.stringify(fileJson, null, 2),
      "utf8"
    );
  } catch (e) {
    return Promise.reject(e);
  }
}

ipcMain.on("change-path", async (event, pathName, value) => {
  updateSettingsFile(pathName, value);
});

ipcMain.on("select-sd-card-dir", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "SD Card Directory",
    properties: ["openDirectory"]
  });

  let newPath;
  if (!result.canceled) {
    newPath = result.filePaths[0];
    if (fs.existsSync(`${newPath}/Nintendo`)) {
      try {
        await updateSettingsFile("sdCardDir", newPath);
        mainWindow.webContents.send("setSdCardDir", newPath);
      } catch (e) {
        console.log("Error: Your settings could not be saved:", e);
      }
    } else {
      mainWindow.webContents.send("setSdCardDir");
      console.log("Error: No Nintendo folder found!");
    }
  } else {
    console.log("No directory selected");
  }
});

ipcMain.on("select-output-dir", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Output Directory",
    properties: ["openDirectory"]
  });

  let newPath;
  if (!result.canceled) {
    newPath = result.filePaths[0];
    try {
      await updateSettingsFile("outputDir", newPath);
      console.log("set new output dir", newPath);
      mainWindow.webContents.send("setOutputDir", newPath);
    } catch (e) {
      console.log("Error: Your settings could not be saved:", e);
    }
  } else {
    console.log("No directory selected");
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
