import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    settings: {
      outputDir: null,
      sdCardDir: null,
      folderName:
        "/%titlefull%/%type%/%titleshort%-%day%-%month%-%year%-%time%",
      types: {
        images: true,
        videos: false
      }
    },
    gameIds: {},
    unknownGameIds: [],
    instructions: []
  },
  mutations: {
    addInstruction(state, instructions) {
      const currentInstructions = state.instructions;
      currentInstructions.push(instructions);
      Vue.set(state, "instructions", currentInstructions);
    },
    removeInstruction(state, instructionIndex) {
      const instructions = state.instructions;
      instructions.splice(instructionIndex, 1);
      Vue.set(state, "instructions", instructions);
    },
    clearInstructions(state) {
      Vue.set(state, "instructions", []);
    },
    setSettings(state, newSettings) {
      const currentSettings = state.settings;
      Vue.set(state, "settings", {
        ...currentSettings,
        ...newSettings
      });
    },
    addUnknownGameId(state, { gameId, screenshotPath }) {
      const unknownGameIds = state.unknownGameIds;
      unknownGameIds.push({
        gameId,
        screenshotPath
      });
      Vue.set(state, "unknownGameIds", unknownGameIds);
    },
    removeUnknownGameId(state, gameId) {
      const unknownGameIds = state.unknownGameIds.filter(
        record => record.gameId !== gameId
      );
      Vue.set(state, "unknownGameIds", unknownGameIds);
    },
    clearUnknownGameIds(state) {
      Vue.set(state, "unknownGameIds", []);
    },
    updateSetting(state, { setting, value }) {
      Vue.set(state.settings, setting, value);
    },
    setGameIds(state, gameIds) {
      Vue.set(state, "gameIds", gameIds);
    },
    addGameId(state, { gameId, gameName }) {
      Vue.set(state.gameIds, gameId, gameName);
    }
  },
  actions: {},
  modules: {}
});
