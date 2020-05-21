<template>
  <div
    class="card-panel"
    :class="{
      red: !settings.types.images && !settings.types.videos,
      green: settings.types.images || settings.types.videos
    }"
  >
    <div class="option">
      <div>
        <b>Backup Images:</b> This is a very lightweight operation, although it
        make a few minutes if you haven't transferred your screenshots in a
        while.
      </div>
      <div>
        <input type="checkbox" v-model="settings.types.images" />
      </div>
    </div>
    <div class="option">
      <div>
        <b>Backup Videos:</b> This can take a very long time and be a little
        unstable on certain systems. Use with caution.
      </div>
      <div>
        <input type="checkbox" v-model="settings.types.videos" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "TypeSettings",
  computed: {
    ...mapState(["settings"])
  }
};
</script>

<style lang="scss" scoped>
.card-panel {
  display: flex;
  flex-direction: column;
}

.option {
  display: flex;
  flex-grow: 1 0;
  // flex-direction: row;
  // justify-content: space-between;
  // align-content: center;
}
</style>
