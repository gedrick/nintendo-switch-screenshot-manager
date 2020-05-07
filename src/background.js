"use strict";

import { app, protocol, BrowserWindow, Menu, ipcMain, dialog } from "electron";
import {
  createProtocol
  /* installVueDevtools */
} from "vue-cli-plugin-electron-builder/lib";
import fs from "fs";
const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Open Output Folder",
        accelerator: process.platform === "darwin" ? "Cmd+O" : "Ctrl+O",
        click() {
          console.log("open output folder!");
        }
      },
      {
        type: "separator"
      },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
        click() {
          app.quit();
        }
      }
    ]
  }
];

if (process.platform === "darwin") {
  mainMenuTemplate.unshift({});
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 700,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  });

  Menu.buildFromTemplate(mainMenuTemplate);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  win.on("closed", () => {
    win = null;
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
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  createWindow();
});

// async function updateSettingsFile(key, newValue) {
//   let filePath = "./settings.json";
//   let fileContents;
//   let fileJson = {};

//   if (fs.existsSync(filePath)) {
//     fileContents = await fsPromises.readFile(filePath);
//     fileJson = JSON.parse(fileContents);
//   }

//   fileJson[key] = newValue;

//   try {
//     return await fsPromises.writeFile(
//       filePath,
//       JSON.stringify(fileJson, null, 2),
//       "utf8"
//     );
//   } catch (e) {
//     return Promise.reject(e);
//   }
// }

ipcMain.on("select-sd-card-dir", async event => {
  console.log("captured!");

  // const result = await dialog.showOpenDialog(win, {
  //   title: "SD Card Directory",
  //   properties: ["openDirectory"]
  // });

  // let newPath;
  // if (!result.canceled) {
  //   newPath = result.filePaths[0];
  //   if (fs.existsSync(`${newPath}/DCIM`)) {
  //     try {
  //       await updateSettingsFile("sdCardDir", newPath);
  //       win.webContents.send("setSdCardDir");
  //     } catch (e) {
  //       console.log("Error: Your settings could not be saved:", e);
  //     }
  //   } else {
  //     console.log("Error: No DCIM folder found!");
  //   }
  // } else {
  //   console.log("No directory selected");
  // }
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
