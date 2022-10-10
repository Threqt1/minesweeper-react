export type MinesweeperCell = {
  isFlipped: boolean;
  isBomb: boolean;
  isFlagged: boolean;
  fail?: {
    isWrongFlag: boolean;
  };
  win?: {};
  minesNear: number;
  seed: number;
};

export type MinesweeperBoard = {
  board: MinesweeperCell[];
  unflippedTiles: number;
  height: number;
  width: number;
  flags: number;
  startedAt: number;
  duration?: number;
  status: "start" | "in_progress" | "done";
  fail?: {
    mines: [number, number][];
    incorrectFlags: [number, number][];
  };
  win?: {
    correctFlags: [number, number][];
  };
};

const dX = [-1, -1, -1, 0, 1, 1, 1, 0];
const dY = [1, 0, -1, -1, -1, 0, 1, 1];

/*
Create an empty board with default values that will provide bare minimum for displaying.
Pass into GenerateBoard with the first-click position to populate the board
*/
export function CreateBoard(
  sizeX: number,
  sizeY: number,
  flags: number
): MinesweeperBoard {
  let boardSize = sizeX * sizeY;
  let board: MinesweeperBoard = {
    board: new Array(boardSize),
    unflippedTiles: boardSize - flags,
    height: sizeY,
    width: sizeX,
    flags,
    startedAt: -1,
    status: "start",
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

function setCoordOnBoard(
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

/*
Flip a tile on the board without mutating it
*/
export function flipCoordOnBoard(
  board: MinesweeperBoard,
  x: number,
  y: number
) {
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    unflippedTiles: board.unflippedTiles,
    height: board.height,
    width: board.width,
    win: board.win,
    fail: board.fail,
    flags: board.flags,
    startedAt: board.startedAt,
    status: board.status,
    duration: board.duration,
  };
  setCoordOnBoard(editBoard, x, y, {
    isFlipped: true,
    isFlagged: false,
  });
  return editBoard;
}

export function markCoordWrongOnBoard(
  board: MinesweeperBoard,
  x: number,
  y: number
) {
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    unflippedTiles: board.unflippedTiles,
    height: board.height,
    width: board.width,
    win: board.win,
    fail: board.fail,
    flags: board.flags,
    startedAt: board.startedAt,
    status: board.status,
    duration: board.duration,
  };
  setCoordOnBoard(editBoard, x, y, {
    isFlagged: false,
    fail: { isWrongFlag: true },
  });
  return editBoard;
}

export function removeFlagOnBoard(
  board: MinesweeperBoard,
  x: number,
  y: number
) {
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    unflippedTiles: board.unflippedTiles,
    height: board.height,
    width: board.width,
    win: board.win,
    fail: board.fail,
    flags: board.flags,
    startedAt: board.startedAt,
    status: board.status,
    duration: board.duration,
  };
  setCoordOnBoard(editBoard, x, y, {
    isFlagged: false,
  });
  return editBoard;
}

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
    unflippedTiles: board.unflippedTiles,
    height: board.height,
    width: board.width,
    win: board.win,
    fail: board.fail,
    flags: board.flags,
    startedAt: Date.now(),
    status: "in_progress",
    duration: board.duration,
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
  if (coord.isBomb || coord.isFlipped) return;
  if (coord.isFlagged) board.flags += 1;
  setCoordOnBoard(board, x, y, { isFlipped: true, isFlagged: false });
  board.unflippedTiles -= 1;
  if (coord.minesNear > 0) {
    for (let i = 1; i < dX.length; i += 2) {
      let tX = x + dX[i];
      let tY = y + dY[i];
      if (tX >= 0 && tX < board.width && tY >= 0 && tY < board.height) {
        if (getCoordFromBoard(board, tX, tY).minesNear <= 0)
          HandleBoardClick_Mut(board, tX, tY, visited);
      }
    }
  } else {
    for (let i = 0; i < dX.length; i += 1) {
      let tX = x + dX[i];
      let tY = y + dY[i];
      if (tX >= 0 && tX < board.width && tY >= 0 && tY < board.height) {
        HandleBoardClick_Mut(board, tX, tY, visited);
      }
    }
  }

  return;
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
  code: "success" | "fail";
} {
  if (board.status === "start") board = GenerateBoard(board, x, y);
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    unflippedTiles: board.unflippedTiles,
    height: board.height,
    width: board.width,
    win: board.win,
    fail: board.fail,
    flags: board.flags,
    startedAt: board.startedAt,
    status: board.status,
    duration: board.duration,
  };
  let coord = getCoordFromBoard(editBoard, x, y);
  if (coord.isFlagged || coord.isFlipped)
    return {
      board: editBoard,
      code: "success",
    };
  if (coord.isBomb)
    return {
      board: editBoard,
      code: "fail",
    };
  let visited = new Array(editBoard.width * editBoard.height).fill(false);
  HandleBoardClick_Mut(editBoard, x, y, visited);
  return {
    board: editBoard,
    code: "success",
  };
}

/*
Flags the cell at (x, y)
*/
export function HandleBoardFlag(board: MinesweeperBoard, x: number, y: number) {
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    unflippedTiles: board.unflippedTiles,
    height: board.height,
    width: board.width,
    win: board.win,
    fail: board.fail,
    flags: board.flags,
    startedAt: board.startedAt,
    status: board.status,
    duration: board.duration,
  };
  if (board.status === "start") return editBoard;
  let coord = getCoordFromBoard(editBoard, x, y);
  if (coord.isFlipped) return editBoard;
  if (!coord.isFlagged && editBoard.flags <= 0) return editBoard;
  if (!coord.isFlagged) {
    editBoard.flags -= 1;
  } else {
    editBoard.flags += 1;
  }
  setCoordOnBoard(editBoard, x, y, { isFlagged: !coord.isFlagged });
  return editBoard;
}

export enum BorderInfo {
  BOTTOM_LEFT = "bottomLeft",
  LEFT = "left",
  TOP_LEFT = "topLeft",
  TOP = "top",
  TOP_RIGHT = "topRight",
  RIGHT = "right",
  BOTTOM_RIGHT = "bottomRight",
  BOTTOM = "bottom",
}

/*
Determine borders for a cell on a board
*/
export function HandleCellBorders(
  board: MinesweeperBoard,
  x: number,
  y: number
) {
  let borderInfo: Partial<{
    [key in BorderInfo]: boolean;
  }> = {};

  let coord = getCoordFromBoard(board, x, y);
  if (coord.isBomb && coord.isFlipped) return borderInfo;

  for (let i = 0; i < dX.length; i++) {
    let tX = x + dX[i];
    let tY = y + dY[i];

    if (tX >= 0 && tX < board.width && tY >= 0 && tY < board.height) {
      let cell = getCoordFromBoard(board, tX, tY);
      if (!cell.isFlipped || (cell.isFlipped && cell.isBomb)) {
        borderInfo[Object.values(BorderInfo)[i]] = true;
      }
    }
  }

  return borderInfo;
}

/*
Determine cells to be highlighted when right click + left click on a flipped cell
*/
export function HandleBoardPeeks(
  board: MinesweeperBoard,
  x: number,
  y: number
) {
  let coord = getCoordFromBoard(board, x, y);
  if (!coord.isFlipped) return null;
  let alreadyMatched = 0;
  let toHighlight: {
    cells: { [key: `${number},${number}`]: boolean };
    shouldFlip: boolean;
  } = {
    cells: {},
    shouldFlip: false,
  };

  for (let i = 0; i < dX.length; i++) {
    let tX = x + dX[i];
    let tY = y + dY[i];

    if (tX >= 0 && tX < board.width && tY >= 0 && tY < board.height) {
      let nextCoord = getCoordFromBoard(board, tX, tY);

      if (nextCoord.isFlagged) {
        alreadyMatched++;
      } else if (!nextCoord.isFlipped) {
        toHighlight.cells[`${tX},${tY}`] = true;
      }
    }
  }

  toHighlight.shouldFlip = alreadyMatched === coord.minesNear;

  return toHighlight;
}

/*
Handle flipping tiles that were returned by the peek
*/
export function HandleBoardFlippingPeekCells(
  board: MinesweeperBoard,
  cells: { [key: `${number},${number}`]: boolean }
) {
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    unflippedTiles: board.unflippedTiles,
    height: board.height,
    width: board.width,
    win: board.win,
    fail: board.fail,
    flags: board.flags,
    startedAt: board.startedAt,
    status: board.status,
    duration: board.duration,
  };
  for (let coord of Object.keys(cells)) {
    let coords = coord.split(",");
    let x = +coords[0];
    let y = +coords[1];

    let clickedBoard = HandleBoardClick(editBoard, x, y);
    if (clickedBoard.code === "fail") return { ...clickedBoard, x, y };
    else editBoard = clickedBoard.board;
  }

  return {
    board: editBoard,
    code: "success",
    x: -1,
    y: -1,
  };
}

/*
Generates the coordinate pairs for mines in the board (with the incorrect mine at the first index), list of incorrect flags, and sets the board as failed
*/
export function HandleBoardLoss(
  board: MinesweeperBoard,
  mineX: number,
  mineY: number
): MinesweeperBoard {
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    unflippedTiles: board.unflippedTiles,
    height: board.height,
    width: board.width,
    win: board.win,
    fail: board.fail,
    flags: board.flags,
    startedAt: board.startedAt,
    duration: Date.now() - board.startedAt,
    status: "done",
  };
  let mines: [number, number][] = [[mineX, mineY]];
  let incorrectFlags: [number, number][] = [];

  for (let y = 0; y < editBoard.height; y++) {
    for (let x = 0; x < editBoard.width; x++) {
      if (y === mineY && x === mineX) continue;
      let coord = getCoordFromBoard(editBoard, x, y);
      if (coord.isBomb) {
        if (!coord.isFlagged) {
          mines.push([x, y]);
        }
      } else if (coord.isFlagged) {
        incorrectFlags.push([x, y]);
      }
    }
  }

  return {
    ...editBoard,
    fail: {
      mines,
      incorrectFlags,
    },
  };
}

/*
Generates coordinate pairs for successesful flags, and sets the board as won
*/
export function HandleBoardWin(board: MinesweeperBoard) {
  let editBoard: MinesweeperBoard = {
    board: board.board.slice(),
    unflippedTiles: board.unflippedTiles,
    height: board.height,
    width: board.width,
    flags: board.flags,
    startedAt: board.startedAt,
    win: board.win,
    fail: board.fail,
    duration: Date.now() - board.startedAt,
    status: "done",
  };
  let correctFlags: [number, number][] = [];

  for (let y = 0; y < editBoard.height; y++) {
    for (let x = 0; x < editBoard.width; x++) {
      let coord = getCoordFromBoard(editBoard, x, y);
      if (coord.isFlagged) {
        correctFlags.push([x, y]);
      }
      setCoordOnBoard(editBoard, x, y, { win: {} });
    }
  }

  return {
    ...editBoard,
    win: {
      correctFlags,
    },
  };
}
