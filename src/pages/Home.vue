<template>
  <div class="window">
    <div class="window-content">
      <div class="pane-group">
        <div class="pane-sm sidebar">
          <nav class="nav-group">
            <h5 class="nav-group-title">Import</h5>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'file-folder-locations' }"
              @click="setActivePage('import', 'file-folder-locations')"
            >
              <span class="icon icon-home"></span>
              File/Folder Locations
            </a>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'filename' }"
              @click="setActivePage('import', 'filename')"
            >
              <span class="icon icon-download"></span>
              File Naming
            </a>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'resolve' }"
              @click="setActivePage('import', 'resolve')"
            >
              <span class="icon icon-folder"></span>
              Resolve
            </a>
            <h5 class="nav-group-title">Screenshots</h5>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'view-all' }"
              @click="setActivePage('manage', 'view-all')"
            >
              <span class="icon icon-folder"></span>
              View All
            </a>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'screenshots' }"
              @click="setActivePage('manage', 'screenshots')"
            >
              <span class="icon icon-folder"></span>
              Screenshots
            </a>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'videos' }"
              @click="setActivePage('manage', 'videos')"
            >
              <span class="icon icon-folder"></span>
              Videos
            </a>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'recent' }"
              @click="setActivePage('manage', 'recent')"
            >
              <span class="icon icon-folder"></span>
              Recent
            </a>
          </nav>
        </div>
        <div class="pane">
          <Import
            v-if="section === 'import'"
            @changeSection="section => (subsection = section)"
            :subsection="subsection"
          />
          <Manage v-if="section === 'manage'" :subsection="subsection" />
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
    Manage
  },
  data() {
    return {
      section: "import",
      subsection: "file-folder-locations"
    };
  },
  methods: {
    setActivePage(section, subsection) {
      this.section = section;
      this.subsection = subsection;
    }
  }
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

.form-control,
.btn * {
  cursor: pointer;
}

.btn-action {
  .label {
    padding: 10px;
  }
  .icon::before {
    color: #fff;
  }
}

.card-panel {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-radius: 5px;

  &.red {
    background-color: rgba(red, 0.3);
  }

  &.green {
    background-color: rgba(green, 0.3);
  }
}

.btn-primary {
  // font-size: 20px;
}

.btn-default {
  // font-size: 15px;
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
