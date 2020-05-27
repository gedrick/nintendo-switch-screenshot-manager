<template>
  <div class="preview">
    <h3 v-if="instructions.length">Matched files</h3>
    <table class="table-striped">
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
