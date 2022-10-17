import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { Difficulties, Minesweeper, Utility } from "../../types";

import { DifficultyList } from "../../data/difficulties";
import {
  AnimateBoardLoss,
  AnimateBoardWin,
  ClickCell,
  CreateBoard,
  FlagCell,
  GenerateCellPeeks,
  SetBoardAsWon,
} from "../../game/Board";

import GameOverlay from "../GameOverlay";
import Board from "../Board";
import Topbar from "../Topbar";

import "./App.scss";

/**
 * Represents the overarching app component
 * @returns The app component
 */
const App = () => {
  /* States */

  /**
   * The state for handling difficulty changing
   */
  const [difficulty, setDifficulty] = useState<Difficulties.Difficulty>(
    DifficultyList.Medium
  );

  /**
   * The state for handling the board
   */
  const [board, updateBoard] = useReducer<
    (
      board: Minesweeper.Board,
      update: Minesweeper.Events.BOARD_EVENT
    ) => Minesweeper.Board,
    null
  >(boardReducer, null, () => CreateBoard({ width: 0, height: 0 }, 0));

  /**
   * The state for handling screen resizing
   */
  const [screenSize, setScreenSize] = useState<Utility.WindowDimensions>(() =>
    DetermineWindowSize()
  );

  /**
   * Whether the overlay should display or not
   */
  const [overlayStatus, setOverlayStatus] = useState<boolean>(false);

  /* Refs */

  /**
   * Ref storing information about animation timeouts
   */
  const boardAnimationsRef = useRef<{
    overlayToggleTimeout: number | null;
    animationTimeouts: number[];
  }>({
    overlayToggleTimeout: null,
    animationTimeouts: [],
  });

  /**
   * The ref to preserve the correct board reference across animations
   */
  const animationBoardRef = useRef<Minesweeper.Board>();

  /* Effects */

  /**
   * Setup effect to handle resizing the screen using the ResizeObserver
   */
  useLayoutEffect(() => {
    const ResizeHandler = new ResizeObserver(() => {
      setScreenSize(DetermineWindowSize());
    });
    ResizeHandler.observe(document.body);

    return () => ResizeHandler.disconnect();
  }, []);

  /**
   * Change board on difficulty change
   */
  useEffect(() => {
    if (boardAnimationsRef.current.overlayToggleTimeout)
      clearTimeout(boardAnimationsRef.current.overlayToggleTimeout);
    for (let timeout of boardAnimationsRef.current.animationTimeouts) {
      clearTimeout(timeout);
    }
    setOverlayStatus(false);
    updateBoard({
      type: "SET_BOARD",
      board: CreateBoard(difficulty.boardSize, difficulty.mines),
    });
  }, [difficulty]);

  /**
   * Check if the tiles are 0, if so, change board to won
   */
  useEffect(() => {
    if (
      board.status === Minesweeper.Status.IN_PROGRESS &&
      board.unflippedTiles === 0
    ) {
      updateBoard({ type: "SET_BOARD", board: SetBoardAsWon(board) });
    }
  }, [board.unflippedTiles]);

  /**
   * Start board animations when board is won/loss
   */
  useEffect(() => {
    if (board.status === Minesweeper.Status.DONE) {
      if (boardAnimationsRef.current.overlayToggleTimeout)
        clearTimeout(boardAnimationsRef.current.overlayToggleTimeout);
      for (let timeout of boardAnimationsRef.current.animationTimeouts) {
        clearTimeout(timeout);
      }
      boardAnimationsRef.current.animationTimeouts = [];
      animationBoardRef.current = board;
      if (board.fail) {
        AnimateBoardLoss(
          boardAnimationsRef,
          board as Minesweeper.FailBoard,
          setOverlayStatus,
          animationBoardRef,
          updateBoard
        );
      } else if (board.win) {
        AnimateBoardWin(
          boardAnimationsRef,
          board as Minesweeper.WinBoard,
          setOverlayStatus,
          animationBoardRef,
          updateBoard
        );
      }
    }
  }, [board.status]);

  /* Other Functions */

  /**
   * Restart the board with a new difficulty
   */
  function RestartBoard() {
    setDifficulty(() => {
      return { ...difficulty };
    });
  }

  /**
   * Skip the modal wait
   */
  function SkipAnimation() {
    if (boardAnimationsRef.current.overlayToggleTimeout)
      clearTimeout(boardAnimationsRef.current.overlayToggleTimeout);
    setOverlayStatus(true);
  }

  /**
   * Handle spacebar press (restarts the game)
   */
  function HandleSpaceBar(e: React.KeyboardEvent) {
    if (e.code === "Space") {
      RestartBoard();
    }
  }

  /* Render */

  /* Stats for game overlay */
  let stats: { duration: number; type: "win" | "loss" } | undefined;

  if (board.status === Minesweeper.Status.DONE) {
    stats = {
      duration: board.timing.duration!,
      type: board.fail ? "loss" : "win",
    };
  }

  return (
    <div
      className="gameHolder"
      onContextMenu={(e) =>
        /*To prevent right click action*/
        e.preventDefault()
      }
      onKeyDown={HandleSpaceBar}
      tabIndex={0}
    >
      <GameOverlay
        game={{
          status: board.status,
          stats,
        }}
        overlayStatus={overlayStatus}
        functions={{
          RestartBoard,
          SkipAnimation,
        }}
      />
      <Board
        difficulty={difficulty}
        board={{ board, updateBoard }}
        windowSize={screenSize}
      />
      <Topbar
        difficulty={{ difficulty, setDifficulty }}
        windowSize={screenSize}
        flags={board.flags}
        status={board.status}
      />
    </div>
  );
};

/**
 * Calculates what the current window size is
 * @returns A WindowDimensions object with the lowest size, scaled down, and the type
 */
function DetermineWindowSize(): Utility.WindowDimensions {
  return window.innerHeight > window.innerWidth
    ? { size: window.innerWidth * 0.8, type: "width" }
    : { size: window.innerHeight * 0.8, type: "height" };
}

/**
 * The reducer function for the board state
 * @param board - The board's current state
 * @param update - The update type and information
 * @returns Updates board state
 */
function boardReducer(
  board: Minesweeper.Board,
  update: Minesweeper.Events.BOARD_EVENT
): Minesweeper.Board {
  switch (update.type) {
    case "CLICK_CELL":
      return ClickCell(board, update.coordinate);
    case "FLAG_CELL":
      return FlagCell(board, update.coordinate);
    case "PEEK_CELL":
      return GenerateCellPeeks(board, update.coordinate, update.hasEnded);
    case "SET_BOARD":
      return update.board;
  }
}

export default App;
