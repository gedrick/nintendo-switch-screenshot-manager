<template>
  <div class="preview">
    <p v-if="!instructions.length">
      There is nothing yet to preview, click <b>Preview Results</b> to see what
      files your next import will have.
    </p>
    <p v-if="instructions.length">
      The right column is the file/folder structure that will be created while
      importing your file.
    </p>
    <table class="table-striped" v-if="instructions.length">
      <thead>
        <tr>
          <th>Source</th>
          <th>Destination</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(instruction, index) in sortedInstructions" :key="index">
          <td>{{ instruction.file }}</td>
          <td>{{ instruction.destination }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
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
  }
};
</script>
