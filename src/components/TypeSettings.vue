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
        <input type="checkbox" v-model="settings.types.images" />
      </div>
      <div>
        <b>Backup Images:</b> This is a very lightweight operation, although it
        make a few minutes if you haven't transferred your screenshots in a
        while.
      </div>
    </div>
    <div class="option">
      <div>
        <input type="checkbox" v-model="settings.types.videos" />
      </div>
      <div>
        <b>Backup Videos:</b> This can take a long time and be slightly unstable
        on older systems.
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
  align-self: flex-start;
}
</style>
