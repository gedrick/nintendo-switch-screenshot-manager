<template>
  <div class="section" id="import">
    <div v-if="subsection === 'file-folder-locations'">
      <SdCardDir />
      <OutputDir />
      <TypeSettings />
    </div>
    <div v-if="subsection === 'filename'">
      <FileName />
    </div>

    <Resolve v-if="subsection === 'resolve'" />

    <Progress v-if="inProgress && copyProgress > 0">
      <div class="progress-bar">
        <div class="progress-bar-filler"></div>
        <span>Imported {{ copyProgress }} new files</span>
      </div>
      <div class="resolve-warning" v-if="unknownGameIds.length">
        Some files were unable to be imported due to an unknown game ID. Click
        <b>Resolve</b> to fix them now.
      </div>
      <div class="controls">
        <button
          v-if="
            copyProgress >= copyInstructions.length && unknownGameIds.length
          "
          @click="showResolveScreen"
          class="btn btn-primary btn-large"
        >
          Resolve
        </button>
        <button @click="cancelImport" class="btn btn-secondary btn-large">
          <span v-if="copyProgress >= copyInstructions.length">
            Close
          </span>
          <span v-if="copyProgress < copyInstructions.length">
            Cancel
          </span>
        </button>
      </div>
    </Progress>

    <div class="actions">
      <button
        class="btn btn-large btn-primary btn-action"
        id="output-dir-btn"
        @click="beginImport(false)"
        :disabled="!readyToImport"
      >
        <span class="icon icon-camera"></span>
        <span class="label">Start Importing</span>
      </button>
    </div>
  </div>
</template>

<script>
const fs = require("fs");
const Electron = window.require("electron").remote;

import Progress from "../components/Progress.vue";
import SdCardDir from "../components/SdCardDir.vue";
import OutputDir from "../components/OutputDir.vue";
import FileName from "../components/FileName.vue";
import TypeSettings from "../components/TypeSettings.vue";
import Resolve from "../components/Resolve.vue";
import { ipcRenderer } from "electron";
import { mapState, mapMutations } from "vuex";

export default {
  name: "Import",
  props: {
    subsection: {
      type: String,
      default: "file-folder-locations"
    }
  },
  components: {
    Progress,
    SdCardDir,
    OutputDir,
    FileName,
    TypeSettings,
    Resolve
  },
  data() {
    return {
      copyProgress: 0,
      inResolveMode: false,
      inProgress: false,
      totalFiles: 0,
      doneFiles: 0,
      skippedFiles: 0,
      recentFiles: [],

      copyInstructions: [],
      error: null,
      errors: {
        gameIdFetchError:
          "Something went wrong while downloading the game ID file. Please try again."
      }
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
    ...mapState(["settings", "gameIds", "unknownGameIds"]),
    calculateProgressWidth() {
      const total = this.copyInstructions.length;
      const complete = this.copyProgress;
      return (complete / total) * 10;
    },
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
    }
  },
  methods: {
    ...mapMutations([
      "setSettings",
      "updateSetting",
      "setGameIds",
      "addGameId",
      "addUnknownGameId",
      "removeUnknownGameId",
      "clearUnknownGameIds"
    ]),
    cancelImport() {
      this.inProgress = false;
      this.totalFiles = 0;
      this.doneFiles = 0;
      this.skippedFiles = 0;
    },
    showResolveScreen() {
      this.cancelImport();
      this.$emit("changeSection", "resolve");
    },
    importGameIds() {
      const gameIds = fs.readFileSync(
        `${Electron.app.getPath("home")}/.nssm/game_ids.json`,
        "utf8"
      );
      this.setGameIds(JSON.parse(gameIds));
    },
    beginImport(dryRun = true) {
      this.clearUnknownGameIds();
      this.importGameIds();
      this.copyProgress = 0;
      this.copyInstructions = [];
      this.inProgress = true;

      const sdCardDir = `${this.settings.sdCardDir}/Nintendo/Album`;
      const yearFolders = fs.readdirSync(sdCardDir);
      let allDirectories = [];
      yearFolders
        .filter(name => !name.startsWith("."))
        .forEach(year => {
          const yearFolder = `${sdCardDir}/${year}`;
          const monthFolders = fs.readdirSync(yearFolder);
          monthFolders
            .filter(name => !name.startsWith("."))
            .forEach(month => {
              const monthFolder = `${sdCardDir}/${year}/${month}`;
              const dayFolders = fs.readdirSync(monthFolder);
              dayFolders
                .filter(name => !name.startsWith("."))
                .forEach(day => {
                  allDirectories.push(`${sdCardDir}/${year}/${month}/${day}`);
                });
            });
        });

      this.processDirectories(allDirectories);

      if (!dryRun) {
        this.recentFiles = [];

        //REMOVE THIS LISTENER vv
        ipcRenderer.on("copy-progress", (event, src, destination) => {
          if (destination) {
            this.recentFiles.push(destination);
          }

          this.copyProgress++;
        });
        ipcRenderer.once("files-copied", () => {
          ipcRenderer.removeAllListeners("copy-progress");
          if (this.unknownGameIds.length) {
            this.$emit("changeSection", "resolve");
            // this.inResolveMode = true;
          }
        });
        this.inProgress = true;
        setTimeout(() => {
          ipcRenderer.send("copy-files", this.copyInstructions);
        }, 1000);
      } else {
        // Currently, not getting here, ever.
        if (this.unknownGameIds.length) {
          this.$emit("changeSection", "resolve");
          this.inResolveMode = true;
        }
      }
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
      this.generateInstructions(filteredFiles);
    },
    generateInstructions(filelist) {
      filelist.forEach(screenshotFullPath => {
        const filename = screenshotFullPath.substring(
          screenshotFullPath.lastIndexOf("/") + 1
        );

        const gameName = this.getGameTitle(filename);
        if (!gameName) {
          const gameId = this.getGameIdFromFileName(filename);
          ipcRenderer.send("addGameId", gameId, "");
          this.addUnknownGameId({ gameId, screenshotPath: screenshotFullPath });
        } else {
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
            destination: destinationPath
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
#import {
  height: 100%;
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-panel {
  padding: 5px 15px;
}

.actions {
  display: flex;
  justify-content: space-evenly;
}
</style>
