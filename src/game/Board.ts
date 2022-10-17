import { BorderTypes, Minesweeper, Utility } from "../types";

/**
 * File that handles all board mutation functions.
 */

/**
 * Array of values representing offsets to add to a coordinate pair to get the coordinate pair to the left/right/etc.
 */
const dX = [-1, -1, -1, 0, 1, 1, 1, 0];
const dY = [1, 0, -1, -1, -1, 0, 1, 1];

/* The radius of the square around the clicked coordinate pair that is garunteed to be safe */
const SAFE_AREA = 1;

/**
 * A utility function for checking if a cell is in bounds
 * @param board - The board to refer to for sizes
 * @param coordinate - The coordinate pair of the cell
 *
 * @returns Whether the coordinate is on the board or not
 */
export function IsCellInBounds(
  board: Minesweeper.Board,
  coordinate: Utility.CoordinatePair
): boolean {
  return (
    coordinate.x >= 0 &&
    coordinate.x < board.size.width &&
    coordinate.y >= 0 &&
    coordinate.y < board.size.height
  );
}

/**
 * A utility function for getting the cell at coordinate pair (x, y) on the given board
 * @param board - The board to get the coordinate from
 * @param coordinate - The coordinate pair of the wanted cell
 *
 * @remarks We use the formula (y * width + x) to make a 1D array act as a 2D one
 *
 * @returns The cell at the requested position, or null if it is out of bounds
 */
export function GetCellFromBoard(
  board: Minesweeper.Board,
  coordinate: Utility.CoordinatePair
): Minesweeper.Cell | null {
  if (!IsCellInBounds(board, coordinate)) return null;
  return board.cells[coordinate.y * board.size.width + coordinate.x];
}

/**
 * A utility function for setting properties of a cell on the board if the cell exists
 * @param _board - The board to set the cell of
 * @param coordinate - The coordinate pair of the cell
 * @param props - The new properties of the cell
 * @param mutate - If the board should be mutated. Defaults to true.
 *
 * @remarks We use the formula (y * width + x) to make a 1D array act as a 2D one
 *
 * @returns void
 */
export function SetCellOnBoard(
  _board: Minesweeper.Board,
  coordinate: Utility.CoordinatePair,
  props: Partial<Minesweeper.Cell>,
  mutate: boolean = true
): void {
  let board: Minesweeper.Board = mutate
    ? _board
    : { ..._board, cells: _board.cells.slice() };
  if (!IsCellInBounds(board, coordinate)) return;
  board.cells[coordinate.y * board.size.width + coordinate.x] = {
    ...GetCellFromBoard(board, coordinate)!,
    ...props,
  };
  return;
}

/**
 * Creates an empty board containing default values and information necessary for rendering
 * @param size - The size of the board
 * @param mines - The amount of mines required to be on the board
 *
 * @returns A new board fitting the requested specificiations
 */
export function CreateBoard(
  size: Utility.Size,
  mines: number
): Minesweeper.Board {
  /* Cache the total size of the board */
  let boardSize = size.width * size.height;

  /* Construct the board */
  let board: Minesweeper.Board = {
    cells: new Array(boardSize),
    unflippedTiles: boardSize - mines,
    size,
    flags: mines,
    timing: {
      startedAt: -1,
    },
    status: Minesweeper.Status.START,
    peeks: {},
  };

  /* Initialize default cell values */
  for (let y = 0; y < size.height; y++) {
    let seed = y % 2; //Each row should start with a tile which is the alternate color of the one above it
    for (let x = 0; x < size.width; x++) {
      SetCellOnBoard(
        board,
        { x, y },
        {
          isFlipped: false,
          isBomb: false,
          isFlagged: false,
          adjacentMines: -1,
          seed: seed++,
        }
      );
    }
  }

  return board;
}

/**
 * Populate the board with mines and update corresponding values. Garunteed first-click safety
 * @param _board - The board to perform the operations on
 * @param coordinate - The coordinate pair of the click
 *
 * @returns The populated board
 */
export function PopulateBoard(
  _board: Minesweeper.Board,
  coordinate: Utility.CoordinatePair
): Minesweeper.Board {
  /* Clone the board to meet React state management requirements, and update necessary props */
  let board: Minesweeper.Board = {
    ..._board,
    cells: _board.cells.slice(),
    timing: { startedAt: Date.now() },
    status: Minesweeper.Status.IN_PROGRESS,
  };

  /**
   * A function to check if an input cell is in an X radius of the clicked cell
   * @param inputPair - The coordinate pair which will be checked
   * @param radius - The radius from the clicked points to regard as safe
   * @returns Whether the coordinate pair is in the safe area or not
   */
  function isInArea(
    inputPair: Utility.CoordinatePair,
    radius: number
  ): boolean {
    let squareStart: Utility.CoordinatePair = {
      x: coordinate.x - radius,
      y: coordinate.y - radius,
    };

    /* Checks if the input pair is within the square formed by side lengths radius x radius */
    return (
      inputPair.x >= squareStart.x &&
      inputPair.x <= squareStart.x + radius * 2 &&
      inputPair.y >= squareStart.y &&
      inputPair.y <= squareStart.y + radius * 2
    );
  }

  /* Generate a list of possible indexes to choose as mines */
  let possibleIndexes: Utility.CoordinatePair[] = [];
  for (let y = 0; y < board.size.height; y++) {
    for (let x = 0; x < board.size.width; x++) {
      let pair = { x, y };

      /* It's possible for an index to be a mine if it's not in the safe area */
      if (!isInArea(pair, SAFE_AREA)) possibleIndexes.push(pair);
    }
  }

  /* Repeatedly set tiles as mines until we have generated enough */
  let minesNeeded = board.flags;

  while (minesNeeded > 0) {
    let chosenIndex = Math.random() * possibleIndexes.length;
    let chosenPair = possibleIndexes.splice(chosenIndex, 1)[0];
    SetCellOnBoard(board, chosenPair, {
      isBomb: true,
      adjacentMines: -1,
    });
    minesNeeded--;
  }

  /* Once mines are generated, update adjacent mine numbers for the rest of the cells */
  for (let y = 0; y < board.size.height; y++) {
    for (let x = 0; x < board.size.width; x++) {
      let pair = { x, y };
      let cell = GetCellFromBoard(board, pair)!;
      if (!cell.isBomb) {
        /* Go through each offset, check if there is a bomb adjacent to the tile */
        let adjacentMines = 0;
        for (let offset = 0; offset < dX.length; offset++) {
          let nextPair = { x: x + dX[offset], y: y + dY[offset] };
          let nextCell = GetCellFromBoard(board, nextPair);
          if (nextCell && nextCell.isBomb) {
            adjacentMines++;
          }
        }
        SetCellOnBoard(board, pair, {
          adjacentMines,
        });
      }
    }
  }

  return board;
}

/**
 * Handles clicking a tile on the board and propagating the click outwards to other valid adjacent cells
 * @param _board - The board to click on
 * @param coordinate - The coordinate pair of the original click
 * @param _recurse? - Information for the propogation recursion, should not be provided
 *
 * @returns The board with the clicked tile and other valid tiles flipped
 */

export function ClickCell(
  _board: Minesweeper.Board,
  coordinate: Utility.CoordinatePair,
  _recurse?: {
    _visited: boolean[];
  }
): Minesweeper.Board {
  /* Generate the board if it's not done already, but don't work if user isn't supposed to be able to click */
  if (_board.status === Minesweeper.Status.START)
    _board = PopulateBoard(_board, coordinate);
  else if (_board.status === Minesweeper.Status.DONE) return _board;
  let board: Minesweeper.Board = _recurse
    ? _board
    : { ..._board, cells: _board.cells.slice() };
  /* To track the cells we have visited and those we have not */
  let visited = _recurse
    ? _recurse._visited
    : new Array(board.size.width * board.size.height).fill(false);
  /* If visited stop recursing */
  if (visited[coordinate.y * board.size.width + coordinate.x]) return board;
  visited[coordinate.y * board.size.width + coordinate.x] = true;
  let cell = GetCellFromBoard(board, coordinate);
  if (!cell || (cell && (cell.isFlipped || cell.isFlagged))) return board;
  if (cell.isBomb) return _recurse ? board : SetBoardAsLost(board, coordinate);
  /* Set cell as flipped */
  SetCellOnBoard(board, coordinate, { isFlipped: true });
  board.unflippedTiles--;
  /* Different behaviors if the cell was numbered or not
     If numbered, only check left, up, right, down and only accept non-numbered tiles
     Else, check all directions and accept numbered tiles
  */
  if (cell.adjacentMines > 0) {
    for (let offset = 1; offset < dX.length; offset += 2) {
      let nextPair = {
        x: coordinate.x + dX[offset],
        y: coordinate.y + dY[offset],
      };
      let nextCell = GetCellFromBoard(board, nextPair);
      if (nextCell && nextCell.adjacentMines <= 0) {
        board = ClickCell(board, nextPair, { _visited: visited });
      }
    }
  } else {
    for (let offset = 0; offset < dX.length; offset++) {
      let nextPair = {
        x: coordinate.x + dX[offset],
        y: coordinate.y + dY[offset],
      };
      let nextCell = GetCellFromBoard(board, nextPair);
      if (nextCell) {
        board = ClickCell(board, nextPair, { _visited: visited });
      }
    }
  }

  return board;
}

/**
 * Flags a cell on the board
 * @param _board - The board to flag the cell on
 * @param coordinate - The coordinate of the cell
 *
 * @returns The board with the cell flagged
 */
export function FlagCell(
  _board: Minesweeper.Board,
  coordinate: Utility.CoordinatePair
): Minesweeper.Board {
  if (_board.status !== Minesweeper.Status.IN_PROGRESS) return _board;
  let cell = GetCellFromBoard(_board, coordinate);
  if (
    !cell ||
    (cell && (cell.isFlipped || (!cell.isFlagged && _board.flags <= 0)))
  )
    return _board;
  let board: Minesweeper.Board = { ..._board, cells: _board.cells.slice() };
  if (cell.isFlagged) {
    board.flags++;
  } else {
    board.flags--;
  }
  SetCellOnBoard(board, coordinate, { isFlagged: !cell.isFlagged });
  return board;
}

/**
 * Type to represent the type used in the cell borders function
 */
export type BorderInfo = Partial<{
  [key in BorderTypes]: boolean;
}>;

/**
 * Returns the borders the cell needs on the board
 * @param board - The board to generate cell borders from
 * @param coordinate - The coordinate of the cell to generate borders for
 *
 * @returns An object containing keys representing the borders needed (keys correspond to CSS classes in the Cell stylesheet)
 */
export function GenerateCellBorders(
  board: Minesweeper.Board,
  coordinate: Utility.CoordinatePair
): BorderInfo {
  let borderInfo: BorderInfo = {};

  let cell = GetCellFromBoard(board, coordinate);
  /* No borders for flipped bombs or hidden cells */
  if (!cell || (cell && (!cell.isFlipped || (cell.isFlipped && cell.isBomb))))
    return borderInfo;

  /* In the enum, the key is a number which we can use to grab the value, and the values are the keys of the borderInfo object */
  let keys = Object.values(BorderTypes);

  for (let offset = 0; offset < dX.length; offset++) {
    let nextPair = {
      x: coordinate.x + dX[offset],
      y: coordinate.y + dY[offset],
    };
    let nextCell = GetCellFromBoard(board, nextPair);
    if (
      nextCell &&
      (!nextCell.isFlipped || (nextCell.isFlipped && nextCell.isBomb))
    )
      borderInfo[keys[offset]] = true;
  }

  return borderInfo;
}

/**
 * An object representing peeked cells, keyed by a string which holds coordinate pairs in the format x,y
 */
export type PeekedCells = {
  [key: `${number},${number}`]: boolean;
};

/**
 * Generates the possible mine spots, or peeks, for the inputted cell
 * @param _board - The board to get the cell from
 * @param coordinate - The coordinate of the cell to generate peeks for
 * @param clear - If the method should just clear the current peeks instead of actually generating new ones
 *
 * @remarks It returns an object with a cells property which has an object with keys of x,y.
 * This provides for easy indexing, and therefore, easy checking if a cell is being peeked or not
 *
 * @returns A object with the cells to be peeked, represented by a key x,y and a boolean representing if the tiles should be flipped or not
 */
export function GenerateCellPeeks(
  _board: Minesweeper.Board,
  coordinate: Utility.CoordinatePair,
  clear: boolean = false
): Minesweeper.Board {
  let board: Minesweeper.Board = { ..._board, cells: _board.cells.slice() };
  if (clear) {
    board.peeks = {};
    return board;
  }
  let cell = GetCellFromBoard(board, coordinate);
  if (!cell || (cell && !cell.isFlipped)) {
    return board;
  }

  let peeks: PeekedCells = {};
  let alreadyFlagged = 0;

  /* Remember, mines can be on any cell adjacent to the cell */
  for (let offset = 0; offset < dX.length; offset++) {
    let nextPair = {
      x: coordinate.x + dX[offset],
      y: coordinate.y + dY[offset],
    };
    let nextCell = GetCellFromBoard(board, nextPair);
    /* If not flagged, it's a possible spot */
    if (nextCell) {
      if (nextCell.isFlagged) alreadyFlagged++;
      else if (!nextCell.isFlipped) peeks[`${nextPair.x},${nextPair.y}`] = true;
    }
  }

  /* If alreadyFlagged = the amount of adjacent mines for the cell, we can assume user marked all the mines and just propagate cell flips for them */
  if (alreadyFlagged === cell.adjacentMines) {
    for (let coordString of Object.keys(peeks)) {
      let coordinates = coordString.split(",");
      let coordinate = { x: +coordinates[0], y: +coordinates[1] };

      board = ClickCell(board, coordinate);
      if (board.fail) return board;
    }
  } else {
    board.peeks = peeks;
  }

  return board;
}

/**
 * Sets the board as lost, and generates the necessary values to populate the failed state
 * @param _board - The board to set as lost
 * @param mine - The coordinate of the mine that the player clicked
 *
 * @returns A board set as lost with a filled in fail property
 */
export function SetBoardAsLost(
  _board: Minesweeper.Board,
  mine: Utility.CoordinatePair
): Minesweeper.FailBoard {
  let board: Minesweeper.FailBoard = {
    ..._board,
    cells: _board.cells.slice(),
    status: Minesweeper.Status.DONE,
    fail: {
      unflaggedMines: [mine],
      incorrectFlags: [],
    },
  };
  board.timing.endedAt = Date.now();
  board.timing.duration = board.timing.endedAt - board.timing.startedAt;

  /* Fill in unflagged mine and incorrect flag arrays */
  for (let y = 0; y < board.size.height; y++) {
    for (let x = 0; x < board.size.width; x++) {
      /* Disregard if cell is the mine that the player clicked on */
      if (x === mine.x && y === mine.y) continue;
      let coordinate = { x, y };
      let cell = GetCellFromBoard(board, coordinate)!;
      if (cell.isBomb && !cell.isFlagged) {
        board.fail.unflaggedMines.push(coordinate);
      } else if (cell.isFlagged && !cell.isBomb) {
        board.fail.incorrectFlags.push(coordinate);
      }
    }
  }

  return board;
}

/**
 * Sets a board as won and fills in the win state
 * @param _board - The board to set as won
 *
 * @returns A board set as won with a filled in won property
 */
export function SetBoardAsWon(_board: Minesweeper.Board): Minesweeper.WinBoard {
  let board: Minesweeper.WinBoard = {
    ..._board,
    cells: _board.cells.slice(),
    status: Minesweeper.Status.DONE,
    win: {
      correctFlags: [],
    },
  };
  board.timing.endedAt = Date.now();
  board.timing.duration = board.timing.endedAt - board.timing.startedAt;

  /* Push all flag coordinates to correct flags array */
  for (let y = 0; y < board.size.height; y++) {
    for (let x = 0; x < board.size.width; x++) {
      let coordinate = { x, y };
      let cell = GetCellFromBoard(board, coordinate)!;
      if (cell.isFlagged) {
        board.win.correctFlags.push(coordinate);
      }
      SetCellOnBoard(
        board,
        { x, y },
        {
          win: {},
        }
      );
    }
  }

  return board;
}

/**
 *
 * @param boardAnimations - The animations ref to push timeouts to
 * @param board - The board to use for the animation
 * @param setOverlayStatus - The setState for the overlay status state
 */
export function AnimateBoardLoss(
  boardAnimations: React.MutableRefObject<{
    overlayToggleTimeout: number | null;
    animationTimeouts: number[];
  }>,
  board: Minesweeper.FailBoard,
  setOverlayStatus: React.Dispatch<React.SetStateAction<boolean>>,
  animationBoardRef: React.MutableRefObject<Minesweeper.Board | undefined>,
  updateBoard: React.Dispatch<Minesweeper.Events.BOARD_EVENT>
) {
  let clmnTime = 0;
  /* Animate mines */
  for (let mine of board.fail.unflaggedMines) {
    boardAnimations.current.animationTimeouts.push(
      setTimeout(() => {
        let clonedBoard: Minesweeper.Board = {
          ...board,
          cells: animationBoardRef.current!.cells.slice(),
        };
        SetCellOnBoard(clonedBoard, mine, {
          isFlipped: true,
          isFlagged: false,
        });
        animationBoardRef.current = clonedBoard;
        updateBoard({ type: "SET_BOARD", board: clonedBoard });
      }, clmnTime)
    );
    clmnTime += Math.random() * 390;
  }
  clmnTime += Math.random() * 410;
  /* Animate all wrong flags */
  boardAnimations.current.animationTimeouts.push(
    setTimeout(() => {
      let clonedBoard: Minesweeper.Board = {
        ...board,
        cells: animationBoardRef.current!.cells.slice(),
      };
      for (let flag of board.fail.incorrectFlags) {
        SetCellOnBoard(clonedBoard, flag, {
          isFlagged: false,
          fail: {
            isWrongFlag: true,
          },
        });
      }
      animationBoardRef.current = clonedBoard;
      updateBoard({ type: "SET_BOARD", board: clonedBoard });
    }, clmnTime)
  );
  clmnTime += 800 + Math.random() * 400;
  boardAnimations.current.overlayToggleTimeout = setTimeout(() => {
    setOverlayStatus(true);
  }, clmnTime);
}

/**
 *
 * @param boardAnimations - The animations ref to push timeouts to
 * @param board - The board to use for the animation
 * @param setOverlayStatus - The setState for the overlay status state
 */
export function AnimateBoardWin(
  boardAnimations: React.MutableRefObject<{
    overlayToggleTimeout: number | null;
    animationTimeouts: number[];
  }>,
  board: Minesweeper.WinBoard,
  setOverlayStatus: React.Dispatch<React.SetStateAction<boolean>>,
  animationBoardRef: React.MutableRefObject<Minesweeper.Board | undefined>,
  updateBoard: React.Dispatch<Minesweeper.Events.BOARD_EVENT>
) {
  /* Wait until tiles are finished */
  let clmnTime = 900;
  /* Animate flags going off of board */
  for (let flag of board.win.correctFlags) {
    boardAnimations.current.animationTimeouts.push(
      setTimeout(() => {
        let clonedBoard: Minesweeper.Board = {
          ...board,
          cells: animationBoardRef.current!.cells.slice(),
        };
        SetCellOnBoard(clonedBoard, flag, {
          isFlagged: false,
        });
        animationBoardRef.current = clonedBoard;
        updateBoard({ type: "SET_BOARD", board: clonedBoard });
      }, clmnTime)
    );
    clmnTime += Math.random() * 140;
  }
  clmnTime += Math.random() * 200;
  boardAnimations.current.overlayToggleTimeout = setTimeout(() => {
    setOverlayStatus(true);
  }, clmnTime);
}
