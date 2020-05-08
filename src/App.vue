<template>
  <div id="app">
    <div class="container">
      <div
        class="card-panel valign-wrapper lighten-4 row"
        :class="{ red: !settings.sdCardDir, green: settings.sdCardDir }"
      >
        <div class="col s1">
          <label v-if="settings.sdCardDir">
            <input disabled type="checkbox" checked="checked" />
            <span></span>
          </label>
        </div>
        <div class="col s9">
          <b v-if="!settings.sdCardDir" class="left">
            Select the directory of your SD card
          </b>
          <b v-if="settings.sdCardDir" class="left">{{ settings.sdCardDir }}</b>
          <b v-if="error" class="red-text bold left">{{ error }}</b>
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
          <b v-else class="left">{{ settings.outputDir }}</b>
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

      <button
        class="waves-light btn-large"
        :class="{ pulse: settings.outputDir && settings.sdCardDir }"
        id="output-dir-btn"
        :disabled="!settings.outputDir || !settings.sdCardDir"
      >
        Import
      </button>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require("electron");
const fsp = require("fs").promises;
const path = require("path");
import { mapState, mapMutations } from "vuex";

export default {
  name: "App",
  data() {
    return {
      appPath: null,
      error: null,
      errors: {
        invalidSdCardDir: "Invalid SD card path - no Nintendo folder was found!"
      }
    };
  },
  async mounted() {
    this.setupListeners();
    const settings = await fsp.readFile(
      path.dirname(process.execPath) + "/settings.json"
    );
    if (settings) {
      this.setSettings(JSON.parse(settings));
    }
  },
  computed: {
    ...mapState(["settings"])
  },
  methods: {
    ...mapMutations(["setSettings", "updateSetting"]),
    setupListeners() {
      ipcRenderer.addListener("setSdCardDir", (event, directory) => {
        if (!directory) {
          this.error = this.errors.invalidSdCardDir;
        } else {
          this.updateSetting({ setting: "sdCardDir", value: directory });
        }
      });
      ipcRenderer.addListener("setOutputDir", (event, directory) => {
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
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
