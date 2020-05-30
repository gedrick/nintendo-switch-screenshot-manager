<template>
  <div class="preview">
    <p v-if="!instructions.length">
      There is nothing yet to preview, click <b>Preview Results</b> to see what
      files your next import will have.
    </p>
    <div v-if="instructions.length">
      <p><b>File Name</b></p>
      <input
        ref="folderName"
        class="form-control"
        id="folderName"
        v-model="settings.folderName"
        @keyup="$emit('file-name-changed')"
        type="text"
      />
      <Variables />
    </div>
    <table class="table-striped" v-if="instructions.length">
      <thead>
        <tr>
          <th>Delete</th>
          <th>Source</th>
          <th>Destination</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(instruction, index) in sortedInstructions" :key="index">
          <td>
            <span
              @click="remove(index)"
              class="icon icon-cancel-circled"
            ></span>
          </td>
          <td>{{ instruction.file }}</td>
          <td>{{ instruction.destination }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Variables from "./Variables";
import { mapState, mapMutations } from "vuex";

export default {
  components: {
    Variables
  },
  computed: {
    ...mapState(["instructions", "settings"]),
    sortedInstructions() {
      return this.instructions.map(({ file, destination }) => {
        return {
          file: file.replace(this.settings.sdCardDir, ""),
          destination: destination.replace(this.settings.outputDir, "")
        };
      });
    }
  },
  methods: {
    ...mapMutations(["removeInstruction"]),
    remove(index) {
      this.removeInstruction(index);
    }
  }
};
</script>

<style lang="scss" scoped>
.icon {
  color: red;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  justify-content: center;
}
</style>
