<template>
  <div class="container">
    <p>
      The following game IDs were not found! Please enter the name of the game
      next to each screenshot. You will only have to do this once for each game.
    </p>
    <div
      class="card-panel valign-wrapper lighten-4 row"
      v-for="game in unknownGameIds"
      :key="game.gameId"
      :style="{ 'background-image': `url(file://${game.screenshotFullPath})` }"
    >
      <!-- :class="{ red: !settings.outputDir, green: settings.outputDir }" -->
      <div class="col s6">
        <!-- <img :style={'--background-image': game.screenshotFullPath} /> -->
      </div>
      <div class="col s6">
        Screenshot:<br />
        <img :src="game.screenshotFullPath" />
        <div
          class="screenshot"
          :style="{ 'background-image': `url(${game.screenshotFullPath})` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Resolve",
  props: {
    unknownGameIds: {
      type: Array,
      default: function() {
        return [];
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.screenshot {
  width: 100px;
  height: 100px;
}
</style>
