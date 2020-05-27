import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["unknownGameIds"]),
    uniqueGameIds() {
      const foundUniques = [];
      this.unknownGameIds.forEach(gameObj => {
        if (
          !foundUniques.find(
            foundUnique => foundUnique.gameId === gameObj.gameId
          )
        ) {
          foundUniques.push(gameObj);
        }
      });
      return foundUniques;
    }
  }
};
