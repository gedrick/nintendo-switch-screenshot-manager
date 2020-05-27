<template>
  <div class="container">
    <div class="sub-container">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../styles/variables.scss";
.container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: rgba(black, 0.3);

  display: flex;
  align-content: center;
  justify-content: center;
}

.sub-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  row-gap: 5px;
  align-items: center;
  align-self: center;
  width: 60%;
  height: 35%;
  background-color: #fff;
  flex-direction: column;
  box-shadow: 5px 5px 5px rgba(black, 0.5);
}

.progress-bar {
  height: 30px;
  width: 80%;
  border: 1px solid rgba(black, 0.5);
  box-shadow: 2px 2px 2px rgba(black, 0.3);
  margin-bottom: 10px;
  display: flex;
  position: relative;

  .progress-bar-filler {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: rgba($zelda-green, 0.3);
    width: 100%;
  }
  span {
    width: 100%;
    text-align: center;
    justify-self: center;
    align-self: center;
  }
}

.resolve-warning {
  margin-bottom: 10px;
  padding: 10px;
}

.controls {
  display: flex;
  justify-items: space-evenly;
  justify-content: space-evenly;
  align-content: space-around;
  align-items: space-evenly;

  & > button:not(:last-of-type) {
    margin-right: 10px;
  }
}
</style>
