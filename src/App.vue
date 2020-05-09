<template>
  <div id="app">
    <div class="container">
      <div
        class="card-panel valign-wrapper lighten-4 row"
        :class="{ red: !settings.sdCardDir, green: settings.sdCardDir }"
      >
        <div class="col s1">
          <label v-if="settings.sdCardDir">
            <input type="checkbox" checked="checked" />
            <span></span>
          </label>
        </div>
        <div class="col s9">
          <b v-if="!settings.sdCardDir" class="left">
            Select the directory of your SD card
          </b>
          <p v-if="settings.sdCardDir" class="left">
            <b>SD Card:</b> {{ settings.sdCardDir }}
          </p>
          <b v-if="sdCardError" class="red-text bold left">{{ sdCardError }}</b>
        </div>
        <div class="col s2">
          <button
            @click="selectSdCardDir"
            class="waves-effect waves-light btn"
            id="sd-dir-btn"
          >
            <span v-if="!settings.sdCardDir">Select</span>
            <span v-if="settings.sdCardDir">Change</span>
          </button>
        </div>
      </div>

      <div
        class="card-panel valign-wrapper lighten-4 row"
        :class="{ red: !settings.outputDir, green: settings.outputDir }"
      >
        <div class="col s1">
          <label v-if="settings.outputDir">
            <input type="checkbox" checked="checked" />
            <span></span>
          </label>
        </div>
        <div class="col s9">
          <b v-if="!settings.outputDir" class="left">
            Select the directory to save your screenshots
          </b>
          <p v-else class="left">
            <b>Output Folder:</b> {{ settings.outputDir }}
          </p>
        </div>
        <div class="col s2">
          <button
            @click="selectOutputDir"
            class="waves-effect waves-light btn"
            id="output-dir-btn"
          >
            <span v-if="!settings.outputDir">Select</span>
            <span v-if="settings.outputDir">Change</span>
          </button>
        </div>
      </div>

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
      <Progress
        v-if="inProgress"
        :totalFiles="totalFiles"
        :doneFiles="doneFiles"
        :skippedFiles="skippedFiles"
      />
    </transition>
  </div>
</template>

<script>
const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");
import Progress from "./components/Progress.vue";
import paths from "./paths.js";
import axios from "axios";
import { mapState, mapMutations } from "vuex";

export default {
  name: "App",
  components: {
    Progress
  },
  data() {
    return {
      inProgress: false,
      totalFiles: 0,
      doneFiles: 0,
      skippedFiles: 0,

      appPath: null,
      error: null,
      sdCardError: null,
      errors: {
        invalidSdCardDir:
          "Invalid SD card path - no Nintendo folder was found!",
        gameIdFetchError:
          "Something went wrong while downloading the game ID file. Please try again."
      },
      types: {
        images: true,
        videos: true
      }
    };
  },
  mounted() {
    this.setupListeners();
    const settings = fs.readFileSync(
      path.dirname(process.execPath) + "/settings.json"
    );
    if (settings) {
      this.setSettings(JSON.parse(settings));
    }
  },
  beforeDestroy() {
    ipcRenderer.removeAllListeners("setSdCardDir");
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
    updateFolderName(settingName) {
      ipcRenderer.send("change-path", settingName, this.settings[settingName]);
    },
    async importGameIds() {
      const res = await axios(paths.gameIdPath, {
        method: "get",
        headers: {
          "Content-Type": "application/json"
        }
      });

      let { data } = res;
      this.setGameIds(data);
    },
    async beginImport() {
      try {
        await this.importGameIds();
      } catch (e) {
        this.sdCardError = this.errors.gameIdFetchError;
        return;
      }

      this.inProgress = true;

      // const sdCardDir = `${this.settings.sdCardDir}/Nintendo/Album`;

      // let allDirectories = [];
      // const yearFolders = fs.readdirSync(sdCardDir);
      // yearFolders.forEach(year => {
      //   const yearFolder = `${sdCardDir}/${year}`;
      //   const monthFolders = fs.readdirSync(yearFolder);
      //   monthFolders.forEach(month => {
      //     const monthFolder = `${sdCardDir}/${year}/${month}`;
      //     const dayFolders = fs.readdirSync(monthFolder);
      //     dayFolders.forEach(day => {
      //       allDirectories.push(`${sdCardDir}/${year}/${month}/${day}`);
      //     });
      //   });
      // });

      // this.processDirectories(allDirectories);
    },
    processDirectories(directoryArray) {
      directoryArray.forEach(directory => {
        const screenshotFiles = fs.readdirSync(directory);
        const filteredFiles = this.filterFiles(screenshotFiles);
        this.backupFiles(filteredFiles);
      });
    },
    backupFiles(filelist) {
      // let outputDir;
      filelist.forEach(screenshotFilename => {
        const gameName = this.getGameTitle(screenshotFilename);

        if (!gameName) {
          // Do this later
          // ipcRenderer.send('getFilename')
          console.log("game name not found, skipping for now");
        }
        // WORKFLOW:
        // check if the game name exists
        // else, show a prompt, write the id and title to it

        // check if the game name folder exists
        // else, create it

        // check number of items in the folder for starting index
        // generate the final file name

        // outputDir = `${this.settings.outputDir}/${gameName}/`;

        // console.log(gameName, screenshotFilename);
        // try {
        //   const newFileName = generateFilename(screenshot);
        //   await fs.promises.copyFile(`${directory}/${screenshot}`);
        // } catch (e) {
        //   console.log(
        //     `There was an error copying file: ${directory}/${screenshot}`
        //   );
        // }
      });
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
      console.log(file);

      const gameId = file[1].split(".")[0];

      const gameTitle = this.gameIds[gameId];
      return gameTitle || false;
    },
    setupListeners() {
      ipcRenderer.on("setSdCardDir", (event, directory) => {
        if (!directory) {
          this.error = this.errors.invalidSdCardDir;
        } else {
          this.updateSetting({ setting: "sdCardDir", value: directory });
        }
      });
      ipcRenderer.on("setOutputDir", (event, directory) => {
        this.updateSetting({ setting: "outputDir", value: directory });
      });
    },
    selectSdCardDir() {
      this.error = null;
      ipcRenderer.send("select-sd-card-dir");
    },
    selectOutputDir() {
      this.error = null;
      ipcRenderer.send("select-output-dir");
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
