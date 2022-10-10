import { useEffect, useLayoutEffect, useRef, useState } from "react";

import Topbar from "../Topbar";
import Board from "../Board";

import { Difficulty, DifficultyList } from "../../data/difficulties";
import {
  CreateBoard,
  flipCoordOnBoard,
  markCoordWrongOnBoard,
  MinesweeperBoard,
  removeFlagOnBoard,
} from "../../game/Board";

import "./App.scss";
import GameOverlay from "../GameOverlay";

export const DEFAULT_DIFFICULTY = DifficultyList.Medium;

export type WindowDimensions = {
  size: number;
  type: "width" | "height";
};

const determineSize = (): WindowDimensions => {
  return window.innerHeight > window.innerWidth
    ? { size: window.innerWidth * 0.8, type: "width" }
    : { size: window.innerHeight * 0.8, type: "height" };
};

const App = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);

  const [board, setBoard] = useState<MinesweeperBoard>(() =>
    CreateBoard(0, 0, 0)
  );

  const [overlayStatus, setOverlayStatus] = useState<boolean>(false);

  const [screenSize, setScreenSize] = useState<WindowDimensions>(() =>
    determineSize()
  );

  const boardAnimationTimeouts = useRef<{
    overlayOnTimeout: number | null;
    animationTimeouts: number[];
  }>({
    overlayOnTimeout: null,
    animationTimeouts: [],
  });

  useEffect(() => {
    if (boardAnimationTimeouts.current.overlayOnTimeout)
      clearTimeout(boardAnimationTimeouts.current.overlayOnTimeout);
    for (let timeout of boardAnimationTimeouts.current.animationTimeouts)
      clearTimeout(timeout);
    setBoard(
      CreateBoard(
        difficulty.boardSize.x,
        difficulty.boardSize.y,
        difficulty.mines
      )
    );
  }, [difficulty.name]);

  let animBoardRef = useRef<MinesweeperBoard>();

  useEffect(() => {
    if (board.status === "done") {
      if (boardAnimationTimeouts.current.overlayOnTimeout)
        clearTimeout(boardAnimationTimeouts.current.overlayOnTimeout);
      for (let timeout of boardAnimationTimeouts.current.animationTimeouts)
        clearTimeout(timeout);
      animBoardRef.current = board;
      if (board.fail) {
        let clmnTime = 0;
        for (let mine of board.fail.mines) {
          boardAnimationTimeouts.current.animationTimeouts.push(
            setTimeout(() => {
              let newBoard = flipCoordOnBoard(
                animBoardRef.current!,
                mine[0],
                mine[1]
              );
              animBoardRef.current = newBoard;
              setBoard(newBoard);
            }, clmnTime)
          );
          clmnTime += Math.random() * 550;
        }
        clmnTime += Math.random() * 600;
        for (let flag of board.fail.incorrectFlags) {
          boardAnimationTimeouts.current.animationTimeouts.push(
            setTimeout(() => {
              let newBoard = markCoordWrongOnBoard(
                animBoardRef.current!,
                flag[0],
                flag[1]
              );
              animBoardRef.current = newBoard;
              setBoard(newBoard);
            }, clmnTime)
          );
        }
        clmnTime += 800 + Math.random() * 400;
        boardAnimationTimeouts.current.overlayOnTimeout = setTimeout(() => {
          setOverlayStatus(true);
        }, clmnTime);
      } else if (board.win) {
        let clmnTime = 900;
        for (let flag of board.win.correctFlags) {
          boardAnimationTimeouts.current.animationTimeouts.push(
            setTimeout(() => {
              let newBoard = removeFlagOnBoard(
                animBoardRef.current!,
                flag[0],
                flag[1]
              );
              animBoardRef.current = newBoard;
              setBoard(newBoard);
            }, clmnTime)
          );
          clmnTime += Math.random() * 200;
        }
        clmnTime += Math.random() * 200;
        boardAnimationTimeouts.current.overlayOnTimeout = setTimeout(() => {
          setOverlayStatus(true);
        }, clmnTime);
      }
    }
  }, [board.status]);

  useLayoutEffect(() => {
    const ResizeHandler = new ResizeObserver((_, __) => {
      setScreenSize(determineSize());
    });
    ResizeHandler.observe(document.body);

    return () => ResizeHandler.disconnect();
  }, []);

  const RestartBoard = () => {
    setOverlayStatus(false);
    if (boardAnimationTimeouts.current.overlayOnTimeout)
      clearTimeout(boardAnimationTimeouts.current.overlayOnTimeout);
    for (let timeout of boardAnimationTimeouts.current.animationTimeouts)
      clearTimeout(timeout);
    setBoard(
      CreateBoard(
        difficulty.boardSize.x,
        difficulty.boardSize.y,
        difficulty.mines
      )
    );
  };

  return (
    <div
      className="gameHolder"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <GameOverlay
        game={{
          status: board.status,
          stats:
            board.status === "done"
              ? {
                  duration: board.duration!,
                  type: board.win ? "win" : "loss",
                }
              : undefined,
        }}
        overlayStatus={overlayStatus}
        onRestart={RestartBoard}
      />
      <Board
        difficulty={difficulty}
        board={{ board, setBoard }}
        screenSize={{
          size: screenSize.size,
          type: screenSize.type,
        }}
      />
      <Topbar
        difficulty={{
          difficulty,
          setDifficulty,
        }}
        screenSize={screenSize}
        flags={board.flags}
        status={board.status}
      />
    </div>
  );
};

export default App;
