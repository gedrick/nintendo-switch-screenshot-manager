import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    settings: {
      outputDir: null,
      sdCardDir: null
    }
  },
  mutations: {
    setSettings(state, newSettings) {
      Vue.set(state, "settings", newSettings);
    },
    updateSetting(state, { setting, value }) {
      Vue.set(state.settings, setting, value);
    }
  },
  actions: {},
  modules: {}
});
