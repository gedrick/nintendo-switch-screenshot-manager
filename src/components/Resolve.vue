<template>
  <div class="container">
    <div v-if="!unknownGameIds.length">
      <p>
        Looks like everything is all good - you don't have any game IDs to
        resolve.
      </p>
    </div>
    <div v-else>
      <p>
        <b>
          Some screenshots could not be imported because they don't have a
          matching ID.
        </b>
      </p>
      <p>
        Enter the name of the game next to each screenshot. You will only have
        to do this once for each game. Once you've saved a new game title, you
        will have to Import again to see the screenshots copied over. You can
        click the screenshot to view it in full screen.
      </p>
    </div>
    <div
      class="card-panel game-block green"
      v-for="game in uniqueGameIds"
      :key="game.gameId"
    >
      <div class="game-block-actions input-field">
        <input
          type="text"
          placeholder="Game Title"
          class="form-control"
          v-model="newTitle[game.gameId]"
        />
        <div class="buttons">
          <button class="btn btn-positive" @click="addGameId(game.gameId)">
            Save Name
          </button>
          <button class="btn btn-warning" @click="confirmDelete(game.gameId)">
            Delete
          </button>
          <button
            class="confirm-delete btn btn-negative"
            @click="deleteScreenshot(game.gameId, game.screenshotPath)"
            :ref="`confirm-${game.gameId}`"
          >
            Confirm?
          </button>
        </div>
      </div>
      <div class="col s4">
        <img
          v-if="fileIsImage(game.screenshotPath)"
          @click="toggleFullScreen(game.gameId)"
          :ref="`screenshot-${game.gameId}`"
          class="screenshot"
          :src="`file://${game.screenshotPath}`"
        />
        <button v-else @click="openVideo(game.screenshotPath)">
          Open Video
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const fs = require("fs");
import { mapState, mapMutations } from "vuex";
import mixins from "../helpers/mixins";
import { ipcRenderer, shell } from "electron";

export default {
  name: "Resolve",
  mixins: [mixins],
  data() {
    return {
      newTitle: {},
      fullScreen: false
    };
  },
  computed: {
    ...mapState(["unknownGameIds"])
  },
  methods: {
    ...mapMutations(["addGameId", "removeUnknownGameId"]),
    openVideo(filePath) {
      shell.openItem(filePath);
    },
    fileIsImage(filePath) {
      return filePath.endsWith("jpg");
    },
    addGameId(gameId) {
      ipcRenderer.send("addGameId", gameId, this.newTitle[gameId]);
      this.removeUnknownGameId(gameId);
    },
    toggleFullScreen(gameId) {
      this.$refs[`screenshot-${gameId}`][0].classList.toggle("fullscreen");
    },
    confirmDelete(gameId) {
      this.$refs[`confirm-${gameId}`][0].classList.add("visible");
    },
    deleteScreenshot(gameId, screenshotPath) {
      this.removeUnknownGameId(gameId);
      fs.unlinkSync(screenshotPath);
    }
  }
};
</script>

<style lang="scss" scoped>
.game-block {
  display: flex;
  flex-direction: row;
}

.game-block-actions {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.screenshot {
  max-height: 100%;
  height: 100px;
  cursor: pointer;
  z-index: 5;

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.confirm-delete {
  display: none;
  &.visible {
    display: block;
  }
}
</style>
