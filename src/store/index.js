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
    gameIds: {}
  },
  mutations: {
    setSettings(state, newSettings) {
      const currentSettings = state.settings;
      Vue.set(state, "settings", {
        ...currentSettings,
        ...newSettings
      });
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
