<template>
  <div class="container ">
    <div class="sub-container card-panel">
      <p>Importing file {{ doneFiles }} of {{ totalFiles }}</p>
      <p v-if="skippedFiles">Skipped {{ skippedFiles }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    totalFiles: {
      type: Number,
      default: 0
    },
    doneFiles: {
      type: Number,
      default: 0
    },
    skippedFiles: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;

  display: flex;
  align-content: center;
  justify-content: center;
}
.sub-container {
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
  width: 50%;
  height: 50%;
  background-color: #fff;
}
</style>
