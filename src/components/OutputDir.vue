<template>
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
      <p v-else class="left"><b>Output Folder:</b> {{ settings.outputDir }}</p>
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
</template>

<script>
const { ipcRenderer } = require("electron");
import { mapState, mapMutations } from "vuex";

export default {
  name: "OutputDir",
  computed: {
    ...mapState(["settings"])
  },
  mounted() {
    ipcRenderer.on("setOutputDir", (event, directory) => {
      this.updateSetting({ setting: "outputDir", value: directory });
    });
  },
  beforeDestroy() {
    ipcRenderer.removeAllListeners("setOutputDir");
  },
  methods: {
    ...mapMutations(["updateSetting"]),
    selectOutputDir() {
      ipcRenderer.send("select-output-dir");
    }
  }
};
</script>
