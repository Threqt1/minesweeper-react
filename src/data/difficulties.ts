import { Difficulties } from "../types";

/**
 * A list of Difficulties that are registered in the game
 */
const DifficultyList: Difficulties.DifficultyInfo = {
  Easy: {
    name: "Easy",
    boardSize: {
      width: 10,
      height: 8,
    },
    mines: 10,
  },
  Medium: {
    name: "Medium",
    boardSize: {
      width: 18,
      height: 14,
    },
    mines: 40,
  },
  Hard: {
    name: "Hard",
    boardSize: {
      width: 24,
      height: 20,
    },
    mines: 99,
  },
};

export { DifficultyList };
