<template>
  <div class="resolve">
    <div v-if="!unknownFiles.length">
      Looks like all of your screenshots are sorted correctly.
    </div>
    <div v-if="unknownFiles.length"></div>
  </div>
</template>

<script>
export default {
  name: "Resolve",
  computed: {
    unknownFiles() {
      return [];
    }
  }
};
</script>
