<template>
  <div>
    <div
      class="card-panel"
      :class="{ red: !settings.folderName, green: settings.folderName }"
    >
      <input
        ref="folderName"
        class="form-control"
        id="folderName"
        v-model="settings.folderName"
        type="text"
      />
      <div class="col s2">
        <button
          @click="updateFolderName('folderName')"
          class="btn btn-default btn-mini"
          id="output-dir-btn"
        >
          <span>Save</span>
        </button>
      </div>
    </div>

    <fieldset>
      <legend>Available Variables</legend>

      <div class="row center">
        <b>Preview:</b><br />
        {{ folderNamePreview }}
      </div>

      <Variables />
    </fieldset>
  </div>
</template>

<script>
import Variables from "../components/Variables";
import { mapState } from "vuex";
import { ipcRenderer } from "electron";

export default {
  name: "FileName",
  components: { Variables },
  mounted() {
    this.$refs.folderName.focus();
    this.$refs.folderName.blur();
  },
  computed: {
    ...mapState(["settings"]),
    folderNamePreview() {
      const folderName = this.settings.folderName;

      if (!folderName) {
        return "";
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
    updateFolderName(settingName) {
      ipcRenderer.send("change-path", settingName, this.settings[settingName]);
    }
  }
};
</script>

<style lang="scss" scoped>
.input-block {
  margin-bottom: 0;
}

fieldset {
  font-size: 18px;
}
</style>
