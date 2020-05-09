<template>
  <div class="container">
    <div class="sub-container">
      <slot />
    </div>
  </div>
</template>

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
  flex-direction: column;
}
</style>
