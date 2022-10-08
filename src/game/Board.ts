interface MinesweeperCell {
  isFlipped: boolean;
  isBomb: boolean;
  isFlagged: boolean;
  minesNear: number;
  seed: number;
}

export type MinesweeperBoard = {
  board: MinesweeperCell[];
  height: number;
  width: number;
  flags: number;
  generated: boolean;
};

/*
Create an empty board with default values that will provide bare minimum for displaying.
Pass into GenerateBoard with the first-click position to populate the board
*/
export function CreateBoard(
  sizeX: number,
  sizeY: number,
  flags: number
): MinesweeperBoard {
  let board: MinesweeperBoard = {
    board: new Array(sizeX * sizeY),
    height: sizeY,
    width: sizeX,
    flags,
    generated: false,
  };
  for (let y = 0; y < sizeY; y++) {
    let startSeed = y % 2;
    for (let x = 0; x < sizeX; x++) {
      setCoordOnBoard(board, x, y, {
        isFlipped: false,
        isBomb: false,
        isFlagged: false,
        minesNear: -1,
        seed: startSeed++,
      });
    }
  }
  return board;
}

export function getCoordFromBoard(
  board: MinesweeperBoard,
  x: number,
  y: number
) {
  return board.board[y * board.width + x];
}

export function setCoordOnBoard(
  board: MinesweeperBoard,
  x: number,
  y: number,
  props: Partial<MinesweeperCell>
) {
  board.board[y * board.width + x] = {
    ...getCoordFromBoard(board, x, y),
    ...props,
  };
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
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    height: board.height,
    width: board.width,
    flags: board.flags,
    generated: true,
  };
  let possibleIndexes: number[][] = [];
  for (let y = 0; y < editBoard.height; y++) {
    possibleIndexes[y] = [];
    for (let x = 0; x < editBoard.width; x++) {
      possibleIndexes[y].push(x);
    }
  }
  /* Remove Top 3 Above */
  if (clickY - 1 >= 0) {
    let startX = Math.max(0, clickX - 1);
    let endX = Math.min(editBoard.width - 1, clickX + 1);
    possibleIndexes[clickY - 1].splice(startX, endX - startX + 1);
  }
  /* Remove 1 Left, Middle, 1 Right */
  let startXt = Math.max(0, clickX - 1);
  let endXt = Math.min(editBoard.width - 1, clickX + 1);
  possibleIndexes[clickY].splice(startXt, endXt - startXt + 1);
  /* Remove 3 on Bottom */
  if (clickY + 1 < editBoard.height) {
    let startX = Math.max(0, clickX - 1);
    let endX = Math.min(editBoard.width - 1, clickX + 1);
    possibleIndexes[clickY + 1].splice(startX, endX - startX + 1);
  }
  let minesNeeded = editBoard.flags;
  while (minesNeeded > 0) {
    let randomY = (Math.random() * possibleIndexes.length) | 0;
    let randomXIndex = (Math.random() * possibleIndexes[randomY].length) | 0;
    let randomX = possibleIndexes[randomY].splice(randomXIndex, 1)[0];
    if (possibleIndexes[randomY].length === 0)
      possibleIndexes.splice(randomY, 1);
    setCoordOnBoard(editBoard, randomX, randomY, {
      isBomb: true,
      minesNear: -1,
    });
    minesNeeded--;
  }
  for (let y = 0; y < editBoard.height; y++) {
    for (let x = 0; x < editBoard.width; x++) {
      if (!getCoordFromBoard(editBoard, x, y).isBomb) {
        let minesNear = 0;
        for (let i = 0; i < dX.length; i++) {
          let tX = x + dX[i];
          let tY = y + dY[i];
          if (
            tX >= 0 &&
            tX < editBoard.width &&
            tY >= 0 &&
            tY < editBoard.height
          ) {
            if (getCoordFromBoard(editBoard, tX, tY).isBomb) minesNear++;
          }
        }
        setCoordOnBoard(editBoard, x, y, { minesNear });
      }
    }
  }
  return editBoard;
}

/* Utility recursion function that mutates board */
function HandleBoardClick_Mut(
  board: MinesweeperBoard,
  x: number,
  y: number,
  visited: boolean[]
) {
  if (visited[y * board.width + x] === true) return;
  visited[y * board.width + x] = true;
  let coord = getCoordFromBoard(board, x, y);
  if (coord.isBomb) return;
  if (coord.isFlagged) board.flags++;
  setCoordOnBoard(board, x, y, { isFlipped: true, isFlagged: false });
  if (coord.minesNear > 0) return;
  for (let i = 0; i < dX.length; i += 1) {
    let tX = x + dX[i];
    let tY = y + dY[i];
    if (tX >= 0 && tX < board.width && tY >= 0 && tY < board.height) {
      HandleBoardClick_Mut(board, tX, tY, visited);
    }
  }

  return;
}

export enum CLICK_RETURN_VALUES {
  SUCCESS,
  FAIL,
}
/*
Returns false if the tile was a bomb, else propogates and returns true
*/
export function HandleBoardClick(
  board: MinesweeperBoard,
  x: number,
  y: number
): {
  board: MinesweeperBoard;
  code: CLICK_RETURN_VALUES;
} {
  if (board.generated === false) board = GenerateBoard(board, x, y);
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    height: board.height,
    width: board.width,
    flags: board.flags,
    generated: true,
  };
  let coord = getCoordFromBoard(editBoard, x, y);
  if (coord.isBomb)
    return {
      board: editBoard,
      code: CLICK_RETURN_VALUES.FAIL,
    };
  if (coord.isFlagged)
    return {
      board: editBoard,
      code: CLICK_RETURN_VALUES.SUCCESS,
    };
  setCoordOnBoard(editBoard, x, y, { isFlipped: true });
  if (coord.minesNear > 0)
    return {
      board: editBoard,
      code: CLICK_RETURN_VALUES.SUCCESS,
    };
  let visited = new Array(editBoard.width * editBoard.height).fill(false);
  HandleBoardClick_Mut(editBoard, x, y, visited);
  return {
    board: editBoard,
    code: CLICK_RETURN_VALUES.SUCCESS,
  };
}

/*
Flags the cell at (x, y)
*/
export function HandleBoardFlag(board: MinesweeperBoard, x: number, y: number) {
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    height: board.height,
    width: board.width,
    flags: board.flags,
    generated: board.generated,
  };
  if (board.generated === false) return editBoard;
  let coord = getCoordFromBoard(editBoard, x, y);
  if (coord.isFlipped) return editBoard;
  if (!coord.isFlagged && editBoard.flags <= 0) return editBoard;
  if (!coord.isFlagged) editBoard.flags -= 1;
  else editBoard.flags += 1;
  setCoordOnBoard(editBoard, x, y, { isFlagged: !coord.isFlagged });
  return editBoard;
}
