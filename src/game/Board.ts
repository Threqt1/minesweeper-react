interface MinesweeperCell {
  isFlipped: boolean;
  isBomb: boolean;
  isFlagged: boolean;
  minesNear: number;
}

export interface MinesweeperBoard {
  height: number;
  width: number;
  mines: number;
  board: MinesweeperCell[];
  index: (this: MinesweeperBoard, x: number, y: number) => number;
  get: (this: MinesweeperBoard, x: number, y: number) => MinesweeperCell;
  set: (
    this: MinesweeperBoard,
    x: number,
    y: number,
    newProps: Partial<MinesweeperCell>
  ) => MinesweeperCell;
}

/*
Create an empty board with default values that will provide bare minimum for displaying.
Pass into GenerateBoard with the first-click position to populate the board
*/
export function CreateBoard(
  sizeX: number,
  sizeY: number,
  mines: number
): MinesweeperBoard {
  let board: MinesweeperBoard = {
    height: sizeY,
    width: sizeX,
    mines,
    board: new Array(sizeX * sizeY),
    index: function (this: MinesweeperBoard, x: number, y: number) {
      return y * this.height + x;
    },
    get: function (this: MinesweeperBoard, x: number, y: number) {
      return this.board[y * this.height + x];
    },
    set: function (
      this: MinesweeperBoard,
      x: number,
      y: number,
      newProps: Partial<MinesweeperCell>
    ) {
      this.board[y * this.height + x] = Object.assign(
        this.get(x, y) ?? {},
        newProps
      );
      return this.get(x, y);
    },
  };
  board.index = board.index.bind(board);
  board.get = board.get.bind(board);
  board.set = board.set.bind(board);
  for (let y = 0; y < sizeY; y++) {
    for (let x = 0; x < sizeX; x++) {
      board.set(x, y, {
        isFlipped: false,
        isBomb: false,
        isFlagged: false,
        minesNear: -1,
      });
    }
  }
  return board;
}

const dX = [-1, -1, -1, 0, 1, 1, 1, 0];
const dY = [-1, 0, 1, 1, 1, 0, -1, -1];

/*
Populate the board based on the first click
*/
export function GenerateBoard(
  board: MinesweeperBoard,
  clickX: number,
  clickY: number
) {
  let possibleIndexes: number[][] = [];
  for (let y = 0; y < board.height; y++) {
    possibleIndexes[y] = [];
    for (let x = 0; x < board.width; x++) {
      possibleIndexes[y].push(x);
    }
  }
  /* Remove Top 3 Above */
  if (clickY - 1 >= 0) {
    let startX = Math.max(0, clickX - 1);
    let endX = Math.min(board.width - 1, clickX + 1);
    possibleIndexes[clickY - 1].splice(startX, endX - startX + 1);
  }
  /* Remove 1 Left, 1 Right */
  if (clickX - 1 >= 0) {
    possibleIndexes[clickY].splice(clickX - 1, 1);
  }
  if (clickX + 1 < board.width) {
    possibleIndexes[clickY].splice(clickX + 1, 1);
  }
  /* Remove 3 on Bottom */
  if (clickY + 1 < board.height) {
    let startX = Math.max(0, clickX - 1);
    let endX = Math.min(board.width - 1, clickX + 1);
    possibleIndexes[clickY + 1].splice(startX, endX - startX + 1);
  }
  let minesNeeded = board.mines;
  while (minesNeeded > 0) {
    let randomY = (Math.random() * possibleIndexes.length) | 0;
    let randomXIndex = (Math.random() * possibleIndexes[randomY].length) | 0;
    let randomX = possibleIndexes[randomY].splice(randomXIndex, 1)[0];
    if (possibleIndexes[randomY].length === 0)
      possibleIndexes.splice(randomY, 1);
    board.set(randomX, randomY, {
      isBomb: true,
      minesNear: -1,
    });
    minesNeeded--;
  }
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      if (!board.get(x, y).isBomb) {
        let minesNear = 0;
        for (let i = 0; i < dX.length; i++) {
          let tX = x + dX[i];
          let tY = y + dY[i];
          if (tX > 0 && tX < board.width && tY > 0 && tY < board.height) {
            if (board.get(tX, tY).isBomb) minesNear++;
          }
        }
        board.set(x, y, { minesNear });
      }
    }
  }
  return board;
}
