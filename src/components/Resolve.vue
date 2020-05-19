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
          matching ID! Sometimes this happens if the database is not up to date.
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
      class="card-panel green"
      v-for="game in uniqueGameIds"
      :key="game.gameId"
    >
      <div class="col s8 input-field">
        <input
          type="text"
          class="form-control"
          v-model="newTitle[game.gameId]"
        />
        <label for="folderName">Game Title</label>
        <div class="buttons">
          <button
            class="btn btn-mini btn-positive"
            @click="addGameId(game.gameId)"
          >
            Save Name
          </button>
          <button
            class="btn btn-mini btn-warning"
            @click="confirmDelete(game.gameId)"
          >
            Delete
          </button>
          <button
            class="confirm-delete btn btn-mini btn-negative"
            @click="deleteScreenshot(game.gameId, game.screenshotPath)"
            :ref="`confirm-${game.gameId}`"
          >
            Confirm?
          </button>
        </div>
      </div>
      <div class="col s4">
        <img
          @click="toggleFullScreen(game.gameId)"
          :ref="`screenshot-${game.gameId}`"
          class="screenshot"
          :src="`file://${game.screenshotPath}`"
        />
      </div>
    </div>
  </div>
</template>

<script>
const fs = require("fs");
import { mapState, mapMutations } from "vuex";
import { ipcRenderer } from "electron";

export default {
  name: "Resolve",
  data() {
    return {
      newTitle: {},
      fullScreen: false
    };
  },
  computed: {
    ...mapState(["unknownGameIds"]),
    uniqueGameIds() {
      const foundUniques = [];
      this.unknownGameIds.forEach(gameObj => {
        if (
          !foundUniques.find(
            foundUnique => foundUnique.gameId === gameObj.gameId
          )
        ) {
          foundUniques.push(gameObj);
        }
      });
      return foundUniques;
    }
  },
  methods: {
    ...mapMutations(["addGameId", "removeUnknownGameId"]),
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

.card-panel {
  .input-field {
    display: flex;
    flex-direction: column;
  }

  .buttons {
    display: flex;
    justify-content: flex-start;
  }
}
</style>
