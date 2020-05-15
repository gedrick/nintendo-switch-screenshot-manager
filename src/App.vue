<template>
  <div id="app">
    <div class="container">
      <SdCardDir />
      <OutputDir />
      <FileName />
      <TypeSettings />

      <!-- <div class="row">
        <div class="col s12">
          <div class="row center">
            <b>Preview:</b><br />
            {{ settings.outputDir }}{{ folderNamePreview }}
          </div>
        </div>
      </div> -->

      <button
        class="waves-light btn-large"
        id="output-dir-btn"
        @click="beginImport"
        :disabled="!readyToImport"
      >
        Import
      </button>
    </div>
    <!-- <Resolve v-if="inResolveMode" :unknownGameIds="unknownGameIds" /> -->
    <!-- <button v-if="inResolveMode" @click="inResolveMode = false">Cancel</button> -->
    <!-- <transition name="fade">
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
    </transition> -->
  </div>
</template>

<script>
const fs = require("fs");

// import Progress from "./components/Progress.vue";
import SdCardDir from "./components/SdCardDir.vue";
import OutputDir from "./components/OutputDir.vue";
import FileName from "./components/FileName.vue";
import TypeSettings from "./components/TypeSettings.vue";
// import Resolve from "./components/Resolve.vue";
import { ipcRenderer } from "electron";
import { mapState, mapMutations } from "vuex";

export default {
  name: "App",
  components: {
    // Progress,
    SdCardDir,
    OutputDir,
    FileName,
    TypeSettings,
    // Resolve
  },
  data() {
    return {
      inResolveMode: false,
      // inProgress: false,
      totalFiles: 0,
      doneFiles: 0,
      skippedFiles: 0,

      unknownGameIds: [],
      copyInstructions: [],
      error: null,
      errors: {
        gameIdFetchError:
          "Something went wrong while downloading the game ID file. Please try again.",
      },
    };
  },
  mounted() {
    ipcRenderer.send("read-settings");
    ipcRenderer.once("receive-settings", (event, settings) => {
      if (settings) {
        this.setSettings(settings);
      }
    });
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
        (this.settings.types.images || this.settings.types.videos)
      );
    },
    pathsAreValid() {
      return false;
    },
  },
  methods: {
    ...mapMutations([
      "setSettings",
      "updateSetting",
      "setGameIds",
      "addGameId",
    ]),
    cancelImport() {
      this.inProgress = false;
      this.totalFiles = 0;
      this.doneFiles = 0;
      this.skippedFiles = 0;
    },

    importGameIds() {
      // TODO: STILL NEED TO FIGURE OUT THIS SHIT
      // PROCESS.ENV IS ONLY VALID WHEN I CONSOLE LOG IT!?
      const gameIds = fs.readFileSync(
        `/home/chris/.nssm/game_ids.json`,
        "utf8"
      );
      this.setGameIds(JSON.parse(gameIds));
    },
    beginImport() {
      this.importGameIds();
      this.inProgress = true;

      const sdCardDir = `${this.settings.sdCardDir}/Nintendo/Album`;
      let allDirectories = [];
      const yearFolders = fs.readdirSync(sdCardDir);
      yearFolders.forEach((year) => {
        const yearFolder = `${sdCardDir}/${year}`;
        const monthFolders = fs.readdirSync(yearFolder);
        monthFolders.forEach((month) => {
          const monthFolder = `${sdCardDir}/${year}/${month}`;
          const dayFolders = fs.readdirSync(monthFolder);
          dayFolders.forEach((day) => {
            allDirectories.push(`${sdCardDir}/${year}/${month}/${day}`);
          });
        });
      });

      this.processDirectories(allDirectories);
    },
    processDirectories(directoryArray) {
      let filteredFiles = [];
      directoryArray.forEach((directory) => {
        const screenshotFiles = fs.readdirSync(directory);
        filteredFiles = filteredFiles.concat(
          this.filterFiles(screenshotFiles).map((filename) => {
            return `${directory}/${filename}`;
          })
        );
      });

      this.totalFiles = filteredFiles.length;
      this.backupFiles(filteredFiles);
      if (this.unknownGameIds.length) {
        this.inResolveMode = true;
      }

      ipcRenderer.send("copy-files", this.copyInstructions);
      ipcRenderer.once("files-copied", () => {
        if (this.unknownGameIds.length) {
          console.log("some files were unknown");
        }
      });
    },
    backupFiles(filelist) {
      // let outputDir;
      filelist.forEach((screenshotFullPath) => {
        const filename = screenshotFullPath.substring(
          screenshotFullPath.lastIndexOf("/") + 1
        );

        const gameName = this.getGameTitle(filename);
        if (!gameName) {
          console.log(`Game mapping not found for ${filename}.`);
          const gameId = this.getGameIdFromFileName(filename);
          ipcRenderer.send("addGameId", gameId, "");
          if (
            !this.unknownGameIds.find((gameObj) => gameObj.gameId === gameId)
          ) {
            this.unknownGameIds.push({ gameId, screenshotFullPath });
          }
          this.backupFile(screenshotFullPath, "Unknown");
        } else {
          console.log(`Backing up screenshot for ${gameName}`);
          this.backupFile(screenshotFullPath, gameName);
        }

        this.doneFiles++;
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

      if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationDirectory, { recursive: true });
        if (fs.existsSync(destinationPath)) {
          this.skippedFiles++;
        } else {
          this.copyInstructions.push({
            file: filePath,
            destination: destinationPath,
          });
        }
      }
    },
    getGameIdFromFileName(fileName) {
      let gameId = fileName.substr(fileName.indexOf("-") + 1);
      gameId = gameId.substr(0, gameId.length - 4);
      return gameId;
    },
    filterFiles(filelist) {
      const fileTypes = [];
      if (this.settings.types.images) {
        fileTypes.push("jpg");
      }
      if (this.settings.types.videos) {
        fileTypes.push("mp4");
      }

      const files = filelist.filter((filename) => {
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
    },
  },
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
  margin: 20px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.card-panel {
  padding: 5px 10px;
}
</style>
