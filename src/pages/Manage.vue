<template>
  <div class="section" id="manage">
    <div v-if="isDragging" class="drag-overlay">
      <span class="icon icon-picture"></span>
      <p>
        Dragging file - you can drop in your file system or in a web browser.
      </p>
    </div>
    <div v-if="subsection === 'view-all'">
      <div class="controls">
        <div>
          <button class="btn btn-default" @click="home()">
            Home
          </button>
          <button
            :disabled="!history || !history.length"
            class="btn btn-default"
            @click="back()"
          >
            Back
          </button>
        </div>
        <div class="search">
          <input
            type="text"
            name="search"
            @keyup="onFilterKeyPress"
            v-model="filterStr"
            placeholder="filter (esc to clear)"
          />
        </div>
        <div>
          <button
            :disabled="columns === 3"
            class="btn btn-default"
            @click="adjustColumns(1)"
          >
            Smaller
          </button>
          <button
            :disabled="columns === 1"
            class="btn btn-default"
            @click="adjustColumns(-1)"
          >
            Bigger
          </button>
        </div>
      </div>
      <p v-if="!directoryContents.length">
        You haven't imported any files, or try clearing your search filters.
      </p>

      <div v-if="directoryContents.length" class="directories" :style="cssVars">
        <div v-for="directory in directoryContents" :key="directory">
          <div
            class="folder"
            @click="changePath(directory)"
            v-if="getType(directory) === 'folder'"
          >
            <div class="folder-icon">
              <span class="icon icon-folder"></span>
            </div>
            <div class="title">
              {{ directory }}
            </div>
          </div>
          <div
            class="file"
            @click="openFileInFolder(directory)"
            @drag="isDragging = true"
            @dragend.passive="isDragging = false"
            v-if="getType(directory) === 'image'"
          >
            <div class="file-container">
              <div class="file-icon">
                <span class="icon icon-picture"></span>
              </div>
              <div class="image">
                <img class="screenshot" :src="buildImagePath(directory)" />
              </div>
            </div>
            <div class="title">
              {{ directory }}
            </div>
          </div>
          <div
            class="file video"
            @click="openFileInFolder(directory)"
            v-if="getType(directory) === 'video'"
          >
            <div class="file-container">
              <div class="file-icon">
                <span class="icon icon-video"></span>
              </div>
              <div class="image">
                <div class="screenshot-placeholder"></div>
              </div>
            </div>
            <div class="title">
              {{ directory }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="subsection === 'recent'">
      <p v-if="!recentImports.length">
        You haven't recently imported any files.
      </p>
      <div v-if="recentImports.length" class="controls">
        <div class="search">
          <input
            type="text"
            name="search"
            @keyup="onFilterKeyPress"
            v-model="filterStr"
            placeholder="filter (esc to clear)"
          />
        </div>
        <div>
          <button
            :disabled="columns === 3"
            class="btn btn-default"
            @click="adjustColumns(1)"
          >
            Smaller
          </button>
          <button
            :disabled="columns === 1"
            class="btn btn-default"
            @click="adjustColumns(-1)"
          >
            Bigger
          </button>
        </div>
      </div>
      <div v-if="recentImports.length" class="directories" :style="cssVars">
        <div v-for="fileName in recentImportFiltered" :key="fileName">
          <div
            class="file"
            @click="openFileInFolder(fileName)"
            @drag="isDragging = true"
            @dragend.passive="isDragging = false"
            v-if="getType(fileName) === 'image'"
          >
            <div class="file-container">
              <div class="file-icon">
                <span class="icon icon-picture"></span>
              </div>
              <div class="image">
                <img class="screenshot" :src="`file:///${fileName}`" />
              </div>
            </div>
            <div class="title">
              {{ cleanFilename(fileName) }}
            </div>
          </div>
          <div
            class="file video"
            @click="openFileInFolder(fileName)"
            v-if="getType(fileName) === 'video'"
          >
            <div class="file-container">
              <div class="file-icon">
                <span class="icon icon-video"></span>
              </div>
              <div class="image">
                <div class="screenshot-placeholder"></div>
              </div>
            </div>
            <div class="title">
              {{ cleanFilename(fileName) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const fs = require("fs");
const Electron = window.require("electron").remote;
const shell = Electron.shell;
import { mapState } from "vuex";

export default {
  name: "Manage",
  props: {
    filters: {
      type: Array,
      default: () => {
        return ["mp4", "jpg"];
      }
    },
    subsection: {
      type: String,
      default: "view-all"
    }
  },
  data() {
    return {
      filterStr: "",
      directory: null,
      history: [],

      columns: 3,

      isDragging: false
    };
  },
  mounted() {
    this.home();
  },
  computed: {
    ...mapState(["settings", "recentImports"]),
    directoryContents() {
      if (!this.directory) {
        return [];
      }
      const files = fs.readdirSync(this.directory);
      return files.filter(filename => {
        return filename.toLowerCase().includes(this.filterStr.toLowerCase());
      });
    },
    recentImportFiltered() {
      if (!this.recentImports.length) {
        return [];
      }

      const files = this.recentImports;
      return files.filter(filename => {
        return filename.toLowerCase().includes(this.filterStr.toLowerCase());
      });
    },
    cssVars() {
      return {
        "--column-count": "1fr ".repeat(this.columns)
      };
    }
  },
  methods: {
    cleanFilename(path) {
      return path.substr(path.lastIndexOf("/") + 1);
    },
    openFileInFolder(filePath) {
      shell.showItemInFolder(`${this.directory}/${filePath}`);
    },
    onFilterKeyPress(event) {
      if (event.key === "Escape") {
        this.filterStr = "";
      }
    },
    beginDrag() {
      this.isDragging = true;
    },
    endDrag() {
      this.isDragging = false;
    },
    changePath(path) {
      this.directory += `/${path}`;
      this.history.push(path);
    },
    back() {
      this.directory = this.directory.replace(`/${this.history.pop()}`, "");
    },
    home() {
      this.history = [];
      this.directory = this.settings.outputDir;
    },
    adjustColumns(adjustment) {
      this.columns += adjustment;
    },
    getType(path) {
      const lcase = path.toLowerCase();
      if (lcase.endsWith("jpg")) {
        return "image";
      } else if (lcase.endsWith("mp4")) {
        return "video";
      } else {
        return "folder";
      }
    },
    buildImagePath(path) {
      return `file://${this.directory}/${path}`;
    }
  }
};
</script>

<style lang="scss">
.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(blue, 0.3);
  color: white;
  z-index: 5;
  font-size: 40px;

  .icon {
    align-self: center;
    font-size: 30px;
  }

  p {
    width: 50%;
    text-align: center;
    align-self: center;
    line-height: 1;
  }
}

#manage {
  height: 100%;
  padding: 25px;
}

.controls {
  padding-bottom: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  button {
    padding-right: 10px;
  }
}

.directories {
  display: grid;
  grid-template-columns: var(--column-count);
  grid-gap: 5px;
}

.folder {
  width: 100%;
  height: 100%;
  padding: 5px;
  display: flex;
  justify-content: flex-start;
  border-radius: 5px;
  background-color: rgba(green, 0.3);

  &:hover {
    background-color: rgba(green, 0.7);
  }
  & * {
    cursor: pointer;
    align-self: flex-start;
    text-align: left;
  }

  .icon {
    padding-right: 5px;
  }
  p {
    line-height: normal;
  }
}

.file {
  width: 100%;
  height: 100%;
  padding: 5px;
  background-color: rgba(#000, 0.1);
  border-radius: 5px;

  & * {
    cursor: pointer;
  }

  .file-container {
    position: relative;
  }

  .file-icon {
    position: absolute;
    width: 50px;
    height: 50px;
    top: 0;
    left: 0;
    display: flex;
    align-self: center;
    justify-content: center;
  }

  .screenshot {
    width: 100%;
    height: 100%;
  }

  &:hover .icon {
    opacity: 1;
  }

  .icon {
    padding-right: 5px;
    align-self: center;
    justify-self: center;
    pointer-events: none;
    opacity: 0;

    &::before {
      font-size: 30px;
      color: #fff;
      background-color: rgba(#000, 0.3);
      padding: 5px;
      border-radius: 5px;
    }
  }

  &.video {
    .icon {
      opacity: 1;
      pointer-events: unset;
    }

    .screenshot-placeholder {
      width: 100px;
      height: 100px;
    }
  }

  p {
    line-height: normal;
  }
}
</style>
