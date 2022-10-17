/* GENERAL TYPES */

import { PeekedCells } from "./game/Board";

/**
 * Namespace for utility types to prevent type conflicts
 */
export namespace Utility {
  /**
   * Represents the size the board should be while respecting the 1/1 aspect ratio.
   */
  export interface WindowDimensions {
    /**
     * The size, in pixels, of the window
     */
    size: number;

    /**
     * Whether the size property represents width or height
     */
    type: "width" | "height";
  }

  /**
   * Represents a coordinate pair (x, y)
   */
  export interface CoordinatePair {
    /**
     * The X coordinate
     */
    x: number;

    /**
     * The Y coordinate
     */
    y: number;
  }

  /**
   * Represents a size (width, height)
   */
  export interface Size {
    /**
     * The width
     */
    width: number;

    /**
     * The height
     */
    height: number;
  }
}

/* DIFFICULTY TYPES */

/**
 * Namespace for difficulty types to prevent type conflicts
 */
export namespace Difficulties {
  /**
   * Represents all the valid difficulties implemented in the game
   */
  export type Difficulties = "Easy" | "Medium" | "Hard";

  /**
   * Represents a difficulty object
   * name: The name of the difficulty. Refer to the Difficulties type
   * boardSize: Represents the size of the board.
   * mines: The number of mines on the board
   */
  export interface Difficulty {
    /**
     * The name of the difficulty
     *
     * @remarks Refer to the {@link Difficulies.Difficulties| difficulties type} for more information
     */
    name: Difficulties;

    /**
     * The size of the board
     *
     * @remarks Refer to the {@link Utility.Size| size type} for more information
     */
    boardSize: Utility.Size;

    /**
     * The number of mines on the board
     */
    mines: number;
  }

  /**
   * Represents a map that maps the name of the difficulty to its corresponding information
   */
  export type DifficultyInfo = {
    [key in Difficulties]: Difficulty;
  };
}

/* FONT SIZE TYPES */

/**
 * Namespace to hold all font-related types
 */
export namespace Fonts {
  /**
   * Represents the type of the font size state
   */
  export type FontSizes = Partial<Record<Difficulties.Difficulties, number>> & {
    /**
     * If the font size is in vw or vh
     */
    type: "width" | "height";
  };

  /**
   * Represents all possible font events
   */
  export namespace Events {
    /**
     * Represents the event for resetting all font data
     */
    export interface RESET_FONTS {
      type: "RESET_FONTS";
    }

    /**
     * Represents the event for updating a font size
     */
    export interface UPDATE_FONTS {
      type: "UPDATE_FONTS";
      /**
       * The difficulty to update font size for
       */
      difficulty: Difficulties.Difficulties;
      /**
       * The new font size
       */
      newSize: number;
    }

    /**
     * Update the type of the font
     */
    export interface UPDATE_FONTS_TYPE {
      type: "UPDATE_FONTS_TYPE";
      /**
       * The new type for fonts (vh or vw)
       */
      newType: "width" | "height";
    }

    export type FONTS_EVENT = RESET_FONTS | UPDATE_FONTS | UPDATE_FONTS_TYPE;
  }
}

/* MINESWEEPER GAME TYPES */

/**
 * Namespace for Minesweeper Game types to prevent name conflicts
 */
export namespace Minesweeper {
  /**
   * Represents a cell in a Minesweeper board
   */
  export interface Cell {
    /**
     * Represents if the cell is flipped or not
     */
    isFlipped: boolean;

    /**
     * Represents if the cell is a bomb or not
     */
    isBomb: boolean;

    /**
     * Represents if the cell is flagged or not
     */
    isFlagged: boolean;

    /**
     * Represents information about the fail state for a cell
     *
     * @remarks Only avaliable when the board is set to a fail state as well
     */
    fail?: {
      isWrongFlag: boolean;
    };

    /**
     * Represents information about the win state for a cell
     *
     * @remrks Only avaliable when the board is set to a win state as well
     */
    win?: {};

    /**
     * The amount of mines adjacent to the cell
     */
    adjacentMines: number;

    /**
     * A number for generating alternating colors and such on the board
     *
     * @remarks Mainly used for CSS class selection
     *
     * @internal
     */
    seed: number;
  }

  /**
   * Enum to represent the current status of the board
   */
  export enum Status {
    /**
     * Represents the start state, when the board is initialized but not populated
     */
    START,
    /**
     * Represents the in progress state, when the board is being interacted with
     */
    IN_PROGRESS,
    /**
     * Represents the done state, when the game is finished and the board is closed to user input
     */
    DONE,
  }

  /**
   * Represents a Minesweeper board
   */
  export interface Board {
    /**
     * An array of cells in the board, represented as a 1D array
     *
     * @remarks Refer to the {@link Minesweeper.Cell| cell type} for more information
     */
    cells: Cell[];

    /**
     * The number of unflipped tiles, not counting mines, on the board
     */
    unflippedTiles: number;

    /**
     * The size of the board
     *
     * @remarks Refer to the {@link Utility.Size| size type} for more information
     */
    size: Utility.Size;

    /**
     * The number of flags avaliable to place on the board
     */
    flags: number;

    /**
     * Properties related to timing the board
     */
    timing: {
      /**
       * The time, in milliseconds, when the board was started
       */
      startedAt: number;

      /**
       * The time, in millseconds, when the board reached the DONE state
       *
       * @remarks Refer to the {@link Minesweeper.Status| board status enum} for more information on states
       */
      endedAt?: number;

      /**
       * The duration between the board's IN_PROGRESS state and its DONE state
       *
       * @remarks Refer to the {@link Minesweeper.Status| board status enum} for more information on states
       */
      duration?: number;
    };

    /**
     * The current status of the board
     *
     * @remarks Refer to the {@link Minesweeper.Status| board status enum} for more information
     */
    status: Minesweeper.Status;

    /**
     * Represents the board as a "failed" board
     *
     * @remarks If this property is present, the board is considered as failed, and the properties will always be filled out for animation purposes
     */
    fail?: {
      /**
       * An array containing the coordinates of all the unflagged mines
       *
       * @remarks For animation purposes. Refer to the {@link Utility.CoordinatePair| coordinate pair type} for more information.
       */
      unflaggedMines: Utility.CoordinatePair[];

      /**
       * An array containing the coordinates of all the incorrect flags, or flags that were not on mines
       *
       * @remarks For animation purposes. Refer to the {@link Utility.CoordinatePair| coordinate pair type} for more information.
       */
      incorrectFlags: Utility.CoordinatePair[];
    };

    /**
     * Represents the board as a "won" board
     *
     * @remarks If this property is present, the board is considered as won, and the properties will always be filled out for animation purposes
     */
    win?: {
      /**
       * An array containing the coordinates of all the flags
       *
       * @remarks For animation purposes. Refer to the {@link Utility.CoordinatePair| coordinate pair type} for more information.
       */
      correctFlags: Utility.CoordinatePair[];
    };

    /**
     * Represents the cells currently being peeked on the board
     */
    peeks: PeekedCells;
  }

  /**
   * A type alias for a board that has been marked as failed
   */
  export type FailBoard = Required<Omit<Minesweeper.Board, "win">>;

  /**
   * A type alias for a board that has been marked as won
   */
  export type WinBoard = Required<Omit<Minesweeper.Board, "fail">>;

  /**
   * An enum representing all possible board events
   */
  export namespace Events {
    /**
     * The base properties that are passed with every event
     */
    interface BASE_EVENT {
      /**
       * The coordinate of the cell
       */
      coordinate: Utility.CoordinatePair;
    }

    /**
     * Represents the event information that is passed when a cell is clicked
     */
    export interface CLICK_CELL extends BASE_EVENT {
      type: "CLICK_CELL";
    }

    /**
     * Represents the event information that is passed when a cell is flagged
     */
    export interface FLAG_CELL extends BASE_EVENT {
      type: "FLAG_CELL";
    }

    /**
     * Represents the event information that is passed when a cell is peeked
     */
    export interface PEEK_CELL extends BASE_EVENT {
      type: "PEEK_CELL";
      /**
       * Whether the peek has ended or started
       */
      hasEnded: boolean;
    }

    export interface SET_BOARD {
      type: "SET_BOARD";
      /**
       * The board to set as the new board
       */
      board: Minesweeper.Board;
    }

    /**
     * Discriminated union representing all the possible board events
     */
    export type BOARD_EVENT = CLICK_CELL | FLAG_CELL | PEEK_CELL | SET_BOARD;
  }
}

/* ENUMS */

/**
 * Represents different border values
 */
export enum BorderTypes {
  BOTTOM_LEFT = "bottomLeft",
  LEFT = "left",
  TOP_LEFT = "topLeft",
  TOP = "top",
  TOP_RIGHT = "topRight",
  RIGHT = "right",
  BOTTOM_RIGHT = "bottomRight",
  BOTTOM = "bottom",
}
