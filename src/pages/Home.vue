<template>
  <div class="window">
    <div class="window-content">
      <div class="pane-group">
        <div class="pane-sm sidebar">
          <nav class="nav-group">
            <h5 class="nav-group-title">Import</h5>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'settings' }"
              @click="setActivePage('import', 'settings')"
            >
              <span class="icon icon-folder"></span>
              Settings
            </a>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'preview' }"
              @click="setActivePage('import', 'preview')"
            >
              <span class="icon icon-doc-text"></span>
              Preview
            </a>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'resolve' }"
              @click="setActivePage('import', 'resolve')"
            >
              <span class="icon icon-docs"></span>
              Resolve
              <span v-if="uniqueGameIds.length">
                ({{ uniqueGameIds.length }})
              </span>
            </a>
            <h5 class="nav-group-title">Screenshots</h5>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'view-all' }"
              @click="setActivePage('manage', 'view-all')"
            >
              <span class="icon icon-camera"></span>
              View All
            </a>
            <!-- <a
              class="nav-group-item"
              :class="{ active: subsection === 'screenshots' }"
              @click="setActivePage('manage', 'screenshots')"
            >
              <span class="icon icon-picture"></span>
              Screenshots
            </a>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'videos' }"
              @click="setActivePage('manage', 'videos')"
            >
              <span class="icon icon-video"></span>
              Videos
            </a>
            <a
              class="nav-group-item"
              :class="{ active: subsection === 'recent' }"
              @click="setActivePage('manage', 'recent')"
            >
              <span class="icon icon-calendar"></span>
              Recent
            </a> -->
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
import { mapState } from "vuex";
import mixins from "../helpers/mixins";

export default {
  name: "Home",
  mixins: [mixins],
  components: {
    Import,
    Manage
  },
  data() {
    return {
      section: "import",
      subsection: "settings"
    };
  },
  computed: {
    ...mapState(["unknownGameIds"])
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
@import "../styles/variables";

body {
  background-color: #e3f2fd;
  font-family: BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu,
    Cantarell, "Helvetica Neue", sans-serif;
}

.sidebar {
  background-color: #335368;
  nav {
    .nav-group-title {
      color: #fff;
    }
    .nav-group-item {
      color: #fff;
      &.active {
        background-color: #266dd3;
      }
      span {
        color: #fff;
      }
    }
  }
}

.pane {
  background-color: $gray;
  border-left: none;
}

.form-control,
.btn,
.btn * {
  cursor: pointer;
}

.btn[disabled="disabled"] {
  opacity: 0.5;
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
    background-color: rgba($zelda-green, 0.3);
  }
}
</style>
