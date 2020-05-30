<template>
  <div class="" id="import">
    <div class="top">
      <div v-if="subsection === 'settings'">
        <SdCardDir />
        <OutputDir />
        <TypeSettings />
        <FileName />
      </div>

      <Preview
        v-if="subsection === 'preview'"
        @file-name-changed="beginImport(true)"
      />

      <Resolve v-if="subsection === 'resolve'" />

      <!-- <Progress v-if="inProgress && instructions.length > 0">
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
      </Progress> -->
    </div>

    <div class="bottom">
      <button
        class="btn btn-primary btn-action"
        id="output-dir-btn"
        @click="beginImport(true)"
        :disabled="!readyToImport"
      >
        <span class="label">Preview Results</span>
      </button>
      <button
        class="btn btn-primary btn-action"
        id="output-dir-btn"
        @click="beginImport(false)"
        :disabled="!readyToImport || !instructions.length"
      >
        <span class="icon icon-camera"></span>
        <span class="label">Begin Import</span>
      </button>
    </div>
  </div>
</template>

<script>
const fs = require("fs");
const Electron = window.require("electron").remote;

// import Progress from "../components/Progress.vue";
import SdCardDir from "../components/SdCardDir.vue";
import OutputDir from "../components/OutputDir.vue";
import FileName from "../components/FileName.vue";
import Preview from "../components/Preview.vue";
import TypeSettings from "../components/TypeSettings.vue";
import Resolve from "../components/Resolve.vue";
import mixins from "../helpers/mixins";
import { ipcRenderer } from "electron";
import { mapState, mapMutations } from "vuex";

const dialog = Electron.dialog;

export default {
  name: "Import",
  mixins: [mixins],
  components: {
    // Progress,
    SdCardDir,
    OutputDir,
    FileName,
    Preview,
    TypeSettings,
    Resolve
  },
  props: {
    subsection: {
      type: String,
      default: "settings"
    }
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
    ...mapState(["settings", "gameIds", "unknownGameIds", "instructions"]),

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
      "clearUnknownGameIds",
      "addInstruction",
      "clearInstructions",
      "addRecentImport",
      "clearRecentImports"
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
    getAllFiles(dirPath, arrayOfFiles) {
      let files = fs.readdirSync(dirPath);
      arrayOfFiles = arrayOfFiles || [];

      files.forEach(file => {
        if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
          arrayOfFiles = this.getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
          arrayOfFiles = this.filterFiles(arrayOfFiles);
        } else {
          arrayOfFiles.push(`${dirPath}/${file}`);
        }
      });

      return arrayOfFiles;
    },
    async beginImport(dryRun = true) {
      this.clearInstructions();
      this.clearUnknownGameIds();
      this.importGameIds();
      this.copyProgress = 0;
      this.copyInstructions = [];

      const sdCardDir = `${this.settings.sdCardDir}/Nintendo/Album`;
      const allFiles = this.getAllFiles(sdCardDir);

      allFiles.forEach(screenshotFullPath => {
        const fileName = screenshotFullPath.substring(
          screenshotFullPath.lastIndexOf("/") + 1
        );

        const gameName = this.getGameTitle(fileName);
        if (!gameName) {
          const gameId = this.getGameIdFromFileName(fileName);
          this.addUnknownGameId({ gameId, screenshotPath: screenshotFullPath });
        } else {
          this.performLookup(screenshotFullPath, gameName);
        }
      });

      if (dryRun && this.instructions.length) {
        ipcRenderer.send("ask-to-import", {
          instructions: this.instructions,
          unknownIds: this.uniqueGameIds
        });

        ipcRenderer.once("ask-to-import-response", (event, dialogResult) => {
          if (dialogResult === 0) {
            this.$emit("changeSection", "preview");
          } else if (dialogResult === 2) {
            this.beginImport(false);
          } else {
            this.$emit("changeSection", "resolve");
          }

          return;
        });
      }

      if (!this.instructions.length) {
        dialog.showMessageBox({
          type: "error",
          buttons: ["OK"],
          cancelId: 0,
          message: "No files were found that can be imported."
        });
        return;
      }

      if (!dryRun) {
        this.doImport();
      }
    },
    doImport() {
      this.clearRecentImports();
      this.recentFiles = [];
      this.inProgress = true;

      ipcRenderer.once("files-copied", () => {
        this.inProgress = false;
        this.clearInstructions();
      });

      ipcRenderer.send("copy-files", this.instructions);
    },
    performLookup(filePath, gameName) {
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
      if (!fs.existsSync(destinationPath)) {
        this.addInstruction({
          file: filePath,
          destination: destinationPath
        });
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

      const files = filelist.filter(filePath => {
        const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
        const validType = fileTypes.includes(fileName.split(".")[1]);
        const validName = fileName.match(/^\d+-[A-Z\d]+\.(jpg|mp4)$/);
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
  width: 100%;
  display: grid;
  grid-template-rows: 85% 15%;
  row-gap: 5px;
  overflow: hidden;
  justify-content: flex-start;
}

.top {
  width: 100%;
  overflow-y: auto;
  padding: 10px;
}

.bottom {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.card-panel {
  padding: 5px 15px;
}
</style>
