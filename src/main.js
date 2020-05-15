import Vue from "vue";
import store from "./store";
import Home from "./pages/Home.vue";

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(Home)
}).$mount("#app");
