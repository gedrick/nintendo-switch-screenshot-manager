<template>
  <div id="home">
    <div class="header" v-if="section">
      <button class="waves-light" @click="section = ''">Back to Home</button>
    </div>
    <div class="navigation" v-if="!section">
      <button class="waves-light btn-large" @click="section = 'import'">
        Import Screenshots
      </button>
      <button class="waves-light btn-large" @click="section = 'manage'">
        Manage Screenshots
      </button>
      <button class="waves-light btn-large" @click="section = 'resolve'">
        Resolve Unknowns
      </button>
    </div>
    <div class="import" v-if="section === 'import'">
      <Import />
    </div>
    <div class="manage" v-if="section === 'manage'">
      <Manage />
    </div>
  </div>
</template>

<script>
import Import from "./Import";
import Manage from "./Manage";

export default {
  name: "Home",
  components: {
    Import,
    Manage
  },
  data() {
    return {
      section: ""
    };
  }
};
</script>

<style lang="scss">
body {
  background-color: #e3f2fd;
  font-family: BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu,
    Cantarell, "Helvetica Neue", sans-serif;
  overflow: hidden;
}

#home {
  padding: 10px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 20px 0;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: flex-start;
}

.navigation {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  button {
    width: 50%;
  }
  & button:not(.last-of-type) {
    margin-bottom: 20px;
  }
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
