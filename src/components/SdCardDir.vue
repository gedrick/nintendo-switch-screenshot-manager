<template>
  <div
    class="card-panel valign-wrapper lighten-4 row"
    :class="{ red: !settings.sdCardDir, green: settings.sdCardDir }"
  >
    <div class="col s10">
      <b v-if="!settings.sdCardDir" class="left">
        Select the directory of your SD card
      </b>
      <p v-if="settings.sdCardDir" class="left">
        <b>SD Card:</b> {{ settings.sdCardDir }}
      </p>
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
</template>

<script>
const { ipcRenderer } = require("electron");
import { mapState, mapMutations } from "vuex";

export default {
  name: "SdCardDir",
  data() {
    return {
      error: null,
      errors: {
        invalid: "Invalid SD card path - no Nintendo folder was found!"
      }
    };
  },
  computed: {
    ...mapState(["settings"])
  },
  mounted() {
    ipcRenderer.on("setSdCardDir", (event, directory) => {
      if (!directory) {
        this.error = this.errors.invalid;
      } else {
        this.updateSetting({ setting: "sdCardDir", value: directory });
      }
    });
  },
  beforeDestroy() {
    ipcRenderer.removeAllListeners("setSdCardDir");
  },
  methods: {
    ...mapMutations(["updateSetting"]),
    selectSdCardDir() {
      this.error = null;
      ipcRenderer.send("select-sd-card-dir");
    }
  }
};
</script>
