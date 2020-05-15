<template>
  <div
    class="card-panel center lighten-4 valign-wrapper row"
    :class="{
      red: !settings.types.images && !settings.types.videos,
      green: settings.types.images || settings.types.videos
    }"
  >
    <div class="col s5">
      <div class="switch">
        <label>
          Off
          <input type="checkbox" v-model="settings.types.images" />
          <span class="lever"></span>
          On
        </label>
      </div>
      <label>
        <span class="black-text">Backup Images</span>
      </label>
    </div>
    <div class="col s5">
      <div class="switch">
        <label>
          Off
          <input type="checkbox" v-model="settings.types.videos" />
          <span class="lever"></span>
          On
        </label>
      </div>
      <label>
        <span class="black-text">Backup Videos</span>
      </label>
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
