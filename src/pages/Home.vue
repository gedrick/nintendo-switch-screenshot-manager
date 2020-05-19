<template>
  <div class="window">
    <div class="window-content">
      <div class="pane-group">
        <div class="pane-sm sidebar">
          <nav class="nav-group">
            <h5 class="nav-group-title">Import</h5>
            <a
              class="nav-group-item active"
              @click="setActivePage('file-folder-locations')"
            >
              <span class="icon icon-home"></span>
              File/Folder Locations
            </a>
            <a class="nav-group-item">
              <span class="icon icon-download"></span>
              File Naming
            </a>
            <a class="nav-group-item">
              <span class="icon icon-folder"></span>
              Documents
            </a>
            <h5 class="nav-group-title">Manage</h5>
            <a class="nav-group-item">
              <span class="icon icon-folder"></span>
              View All
            </a>
            <a class="nav-group-item">
              <span class="icon icon-folder"></span>
              Screenshots
            </a>
            <a class="nav-group-item">
              <span class="icon icon-folder"></span>
              Videos
            </a>
            <a class="nav-group-item">
              <span class="icon icon-folder"></span>
              Recent
            </a>
          </nav>
        </div>
        <div class="pane">
          <Import v-if="section === 'import'" />
          <Manage v-if="section === 'manage'" />
        </div>
      </div>
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
    Manage,
  },
  data() {
    return {
      section: "import",
    };
  },
};
</script>

<style lang="scss">
body {
  background-color: #e3f2fd;
  font-family: BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu,
    Cantarell, "Helvetica Neue", sans-serif;
}

// #home {
//   padding: 10px;
//   font-family: Avenir, Helvetica, Arial, sans-serif;
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
//   text-align: center;
//   color: #2c3e50;
//   margin: 20px 0;
//   height: 100vh;
// }

// .header {
//   display: flex;
//   justify-content: flex-start;
// }

// .navigation {
//   width: 100%;
//   height: 100%;

//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;

//   button {
//     width: 50%;
//   }
//   & button:not(.last-of-type) {
//     margin-bottom: 20px;
//   }
// }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
