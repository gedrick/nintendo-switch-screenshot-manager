<template>
  <div class="section" id="manage">
    <div class="controls">
      <div>
        <button class="btn btn-default" @click="home()">
          Home
        </button>
      </div>
      <div>
        <button v-if="history.length" class="btn btn-default" @click="back()">
          Back
        </button>
      </div>
      <div>
        <button
          v-if="columns < 3"
          class="btn btn-default"
          @click="adjustColumns(1)"
        >
          Smaller
        </button>
        <button
          v-if="columns > 1"
          class="btn btn-default"
          @click="adjustColumns(-1)"
        >
          Bigger
        </button>
      </div>
    </div>
    <div class="directories" :style="cssVars">
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
        <div class="file" v-if="getType(directory) === 'image'">
          <div class="file-icon">
            <span class="icon icon-picture"></span>
          </div>
          <div class="image">
            <img class="screenshot" :src="buildImagePath(directory)" />
          </div>
          <div class="title">
            {{ directory }}
          </div>
        </div>
        <div class="file" v-if="getType(directory) === 'video'">
          <div class="file-icon">
            <span class="icon icon-video"></span>
          </div>
          <div class="image">
            <img class="screenshot" :src="buildImagePath(directory)" />
          </div>
          <div class="title">
            {{ directory }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const fs = require("fs");
import { mapState } from "vuex";

export default {
  name: "Manage",
  props: {
    filters: {
      type: Array,
      default: () => {
        return ["mp4", "jpg"];
      }
    }
  },
  data() {
    return {
      directory: null,
      history: [],

      columns: 3
    };
  },
  mounted() {
    this.home();
  },
  computed: {
    ...mapState(["settings"]),
    directoryContents() {
      if (!this.directory) {
        return [];
      }
      return fs.readdirSync(this.directory);
    },
    cssVars() {
      return {
        "--column-count": "1fr ".repeat(this.columns)
      };
    }
  },
  methods: {
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
  }

  .icon {
    padding-right: 5px;
  }
  p {
    line-height: normal;
  }
}

.file {
  position: relative;
  width: 100%;
  height: 100%;

  & * {
    cursor: pointer;
  }

  .file-icon {
    width: 100%;
    height: 100%;
    position: absolute;
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
    }
  }

  p {
    line-height: normal;
  }
}
</style>
