<template>
  <div id="app">
    <div class="container">
      <SdCardDir />
      <OutputDir />
      <div
        class="card-panel lighten-4"
        :class="{ red: !settings.folderName, green: settings.folderName }"
      >
        <div class="row valign-wrapper">
          <div class="input-field col s10">
            <input
              id="folderName"
              v-model="settings.folderName"
              type="text"
              class="validate"
            />
            <label for="folderName">Output Folder and File Name</label>
          </div>
          <div class="col s2">
            <button
              @click="updateFolderName('folderName')"
              class="waves-effect waves-light btn"
              id="output-dir-btn"
            >
              <span>Save</span>
            </button>
          </div>
        </div>
        <div class="row center">
          {{ folderNamePreview }}
        </div>
        <div class="row center">
          <div class="col s6">
            <b>Date variables:</b><br />
            %year%&nbsp;&nbsp;%month%<br />
            %day%&nbsp;&nbsp;%time%
          </div>
          <div class="col s6">
            <b>Other variables:</b><br />
            %titlefull% %titleshort%<br />
            %type% %number%
          </div>
        </div>
      </div>

      <div class="card-panel center green lighten-4 valign-wrapper row">
        <div class="col s5">
          <div class="switch">
            <label>
              Off
              <input type="checkbox" v-model="types.images" />
              <span class="lever"></span>
              On
            </label>
          </div>
          <label v-if="settings.outputDir">
            <span class="black-text">Backup Images</span>
          </label>
        </div>
        <div class="col s5">
          <div class="switch">
            <label>
              Off
              <input type="checkbox" v-model="types.videos" />
              <span class="lever"></span>
              On
            </label>
          </div>
          <label v-if="settings.outputDir">
            <span class="black-text">Backup Videos</span>
          </label>
        </div>
      </div>

      <div class="row">
        <div class="col s12">
          <div class="row center">
            <b>Preview:</b><br />
            {{ settings.outputDir }}{{ folderNamePreview }}
          </div>
        </div>
      </div>

      <button
        class="waves-light btn-large"
        id="output-dir-btn"
        @click="beginImport"
        :disabled="!readyToImport"
      >
        Import
      </button>
    </div>
    <transition name="fade">
      <Progress v-if="inProgress">
        <p>Importing file {{ doneFiles }} of {{ totalFiles }}</p>
        <p v-if="skippedFiles">Skipped {{ skippedFiles }}</p>
        <br />
        <p>
          <button class="waves-effect waves-light btn" @click="cancelImport">
            Cancel
          </button>
        </p>
      </Progress>
    </transition>
  </div>
</template>

<script>
const { ipcRenderer, app } = require("electron");
const fs = require("fs");
const { COPYFILE_EXCL } = fs.constants;

import Progress from "./components/Progress.vue";
import SdCardDir from "./components/SdCardDir.vue";
import OutputDir from "./components/OutputDir.vue";
import { mapState, mapMutations } from "vuex";

export default {
  name: "App",
  components: {
    Progress,
    SdCardDir,
    OutputDir
  },
  data() {
    return {
      inProgress: false,
      totalFiles: 0,
      doneFiles: 0,
      skippedFiles: 0,

      promiseChain: [],
      appPath: null,
      error: null,
      sdCardError: null,
      errors: {
        gameIdFetchError:
          "Something went wrong while downloading the game ID file. Please try again."
      },
      types: {
        images: true,
        videos: false
      }
    };
  },
  mounted() {
    let settings;
    try {
      settings = fs.readFileSync(app.getAppPath() + "/settings.json");
      this.setSettings(JSON.parse(settings));
    } catch (e) {
      console.log("No settings file exists.");
    }
  },
  beforeDestroy() {
    ipcRenderer.removeAllListeners("setOutputDir");
  },
  computed: {
    ...mapState(["settings", "gameIds"]),
    readyToImport() {
      return (
        this.settings.outputDir &&
        this.settings.sdCardDir &&
        this.settings.folderName &&
        (this.types.images || this.types.videos)
      );
    },
    pathsAreValid() {
      return false;
    },
    folderNamePreview() {
      const folderName = this.settings.folderName;

      if (!folderName) {
        return false;
      }

      let newFolderName = folderName
        .replace(/%year%/g, "2020")
        .replace(/%month%/g, "03")
        .replace(/%day%/g, "21")
        .replace(/%time%/g, "2208")
        .replace(/%titlefull%/g, "Super Mario Odyssey")
        .replace(/%titleshort%/g, "Super_Mario_Odyssey")
        .replace(/%type%/g, "Images")
        .replace(/%number%/g, "03");

      return `${newFolderName}.jpg`;
    }
  },
  methods: {
    ...mapMutations([
      "setSettings",
      "updateSetting",
      "setGameIds",
      "addGameId"
    ]),
    cancelImport() {
      this.inProgress = false;
      this.promiseChain = [];
      this.totalFiles = 0;
      this.doneFiles = 0;
      this.skippedFiles = 0;
    },
    updateFolderName(settingName) {
      ipcRenderer.send("change-path", settingName, this.settings[settingName]);
    },
    importGameIds() {
      const gameIds = fs.readFileSync(
        app.getPath("home") + "/.nssm/game_ids.json"
      );
      this.setGameIds(gameIds);
    },
    beginImport() {
      this.importGameIds();

      this.inProgress = true;

      const sdCardDir = `${this.settings.sdCardDir}/Nintendo/Album`;
      let allDirectories = [];
      const yearFolders = fs.readdirSync(sdCardDir);
      yearFolders.forEach(year => {
        const yearFolder = `${sdCardDir}/${year}`;
        const monthFolders = fs.readdirSync(yearFolder);
        monthFolders.forEach(month => {
          const monthFolder = `${sdCardDir}/${year}/${month}`;
          const dayFolders = fs.readdirSync(monthFolder);
          dayFolders.forEach(day => {
            allDirectories.push(`${sdCardDir}/${year}/${month}/${day}`);
          });
        });
      });

      this.processDirectories(allDirectories);
    },
    processDirectories(directoryArray) {
      let filteredFiles = [];
      directoryArray.forEach(directory => {
        const screenshotFiles = fs.readdirSync(directory);
        filteredFiles = filteredFiles.concat(
          this.filterFiles(screenshotFiles).map(filename => {
            return `${directory}/${filename}`;
          })
        );
      });

      this.totalFiles = filteredFiles.length;
      this.backupFiles(filteredFiles);
      Promise.all(this.promiseChain);
    },
    backupFiles(filelist) {
      // let outputDir;
      filelist.forEach(screenshotFullPath => {
        if (this.inProgress) {
          const filename = screenshotFullPath.substring(
            screenshotFullPath.lastIndexOf("/") + 1
          );

          const gameName = this.getGameTitle(filename);
          if (!gameName) {
            // Do this later
            // ipcRenderer.send('no-matching-game')
            // console.log("game name not found, skipping for now");
          } else {
            this.backupFile(screenshotFullPath, gameName);
          }
        }

        this.doneFiles++;

        // WORKFLOW:
        // check if the game name exists
        // else, show a prompt, write the id and title to it

        // DONE check if the game name folder exists
        // DONE else, create it

        // check number of items in the folder for starting index
        // generate the final file name
      });
    },
    backupFile(filePath, gameName) {
      const sourceFileName = filePath.substr(filePath.lastIndexOf("/") + 1);

      const destinationFolder = this.settings.folderName;

      const splitFile = sourceFileName.split("-");
      const dateStr = splitFile[0];
      const gameId = splitFile[1];
      const extension = gameId.split(".")[1];

      const year = dateStr.substr(0, 4);
      const month = dateStr.substr(4, 2);
      const day = dateStr.substr(6, 2);
      const time = dateStr.substr(8);

      const type = extension === "jpg" ? "Images" : "Videos";
      const cleanedGameName = gameName.replace(/[^A-Za-z0-9 -]/g, "");
      const shortGameName = cleanedGameName.replace(/[ ]/g, "_");

      let destinationFile = destinationFolder
        .replace(/%year%/g, year)
        .replace(/%month%/g, month)
        .replace(/%day%/g, day)
        .replace(/%time%/g, time)
        .replace(/%type%/g, type)
        .replace(/%titlefull%/g, cleanedGameName)
        .replace(/%titleshort%/g, shortGameName)
        .concat(`.${extension}`);

      if (!destinationFile.startsWith("/")) {
        destinationFile = `/${destinationFile}`;
      }

      const destinationPath = this.settings.outputDir + destinationFile;
      const destinationDirectory = destinationPath.substr(
        0,
        destinationPath.lastIndexOf("/")
      );

      // console.log(filePath);
      // console.log(destinationPath);

      if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationDirectory, { recursive: true });
        try {
          fs.copyFileSync(filePath, destinationPath, COPYFILE_EXCL);
        } catch (e) {
          this.skippedFiles++;
        }
      }
    },
    filterFiles(filelist) {
      const fileTypes = [];
      if (this.types.images) {
        fileTypes.push("jpg");
      }
      if (this.types.videos) {
        fileTypes.push("mp4");
      }

      const files = filelist.filter(filename => {
        const validType = fileTypes.includes(filename.split(".")[1]);
        const validName = filename.match(/^\d+-[A-Z\d]+\.(jpg|mp4)$/);
        return validType && validName;
      });
      return files;
    },
    getGameTitle(filename) {
      const file = filename.split("-");
      const gameId = file[1].split(".")[0];
      const gameTitle = this.gameIds[gameId];
      return gameTitle || false;
    }
  }
};
</script>

<style lang="scss">
body {
  background-color: #e3f2fd;
  font-family: BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu,
    Cantarell, "Helvetica Neue", sans-serif;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
