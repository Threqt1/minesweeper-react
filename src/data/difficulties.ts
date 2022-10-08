export type Difficulties = "Easy" | "Medium" | "Hard";

export type Difficulty = {
  name: Difficulties;
  boardSize: {
    x: number;
    y: number;
  };
  mines: number;
};

export type DifficultyInfo = {
  [key in Difficulties]: Difficulty;
};

const DifficultyList: DifficultyInfo = {
  Easy: {
    name: "Easy",
    boardSize: {
      x: 10,
      y: 8,
    },
    mines: 10,
  },
  Medium: {
    name: "Medium",
    boardSize: {
      x: 18,
      y: 14,
    },
    mines: 40,
  },
  Hard: {
    name: "Hard",
    boardSize: {
      x: 24,
      y: 20,
    },
    mines: 99,
  },
};

export { DifficultyList };
