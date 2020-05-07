<template>
  <div id="app">
    <div class="container">
      <div class="card-panel red lighten-4 row">
        <div class="col s10">
          <p>Select the directory of your SD card</p>
        </div>
        <div class="col s2">
          <button
            @click="selectSdCardDir"
            class="waves-effect waves-light btn"
            id="sd-dir-btn"
          >
            Select
          </button>
        </div>
      </div>

      <div class="card-panel red lighten-4 row">
        <div class="col s10">
          <p>Select the directory to save your screenshots</p>
        </div>
        <div class="col s2">
          <button class="waves-effect waves-light btn" id="output-dir-btn">
            Select
          </button>
        </div>
      </div>

      <button
        class="waves-effect waves-light btn center"
        id="output-dir-btn"
        disabled
      >
        Import
      </button>
    </div>
  </div>
</template>

<script>
// import HelloWorld from "./components/HelloWorld.vue";
const { ipcRenderer } = require("electron");

export default {
  name: "App",
  components: {},
  methods: {
    selectSdCardDir() {
      ipcRenderer.send("select-sd-card-dir");
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
