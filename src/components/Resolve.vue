<template>
  <div class="container">
    <p>
      The following game IDs were not found! Please enter the name of the game
      next to each screenshot. You will only have to do this once for each game.
    </p>
    <div
      class="card-panel valign-wrapper row"
      v-for="game in unknownGameIds"
      :key="game.gameId"
    >
      <div class="col s8 input-field">
        <input type="text" />
        <label for="folderName">Game Title</label>
        <div class="buttons">
          <button>Save Game Name</button>
          <!-- <button>Delete Screenshot</button> -->
        </div>
      </div>
      <div class="col s4">
        <!-- make an image block that you can click to shuffle through
        matching images to match the game better -->
        <img class="screenshot" :src="`file://${game.screenshotPath}`" />
      </div>
    </div>
  </div>
</template>

<script>
// const fsp = fs.promises;
import { mapState, mapMutations } from "vuex";
export default {
  name: "Resolve",
  computed: {
    ...mapState(["unknownGameIds"]),
    uniqueGameIds() {
      return new Map();
    }
  },
  methods: {
    ...mapMutations(["addGameId", "removeUnknownGameId"])
  }
};
</script>

<style lang="scss" scoped>
.screenshot {
  max-height: 100%;
  height: 100px;
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
