import { useEffect, useLayoutEffect, useState } from "react";

import Topbar from "../Topbar";
import Board from "../Board";

import { Difficulty, DifficultyList } from "../../data/difficulties";
import { CreateBoard, MinesweeperBoard } from "../../game/Board";

import "./App.scss";

export const DEFAULT_DIFFICULTY = DifficultyList.Medium;

export type WindowDimensions = {
  size: number;
  type: "width" | "height";
};

const determineSize = (): WindowDimensions => {
  return window.innerHeight > window.innerWidth
    ? { size: window.innerWidth, type: "width" }
    : { size: window.innerHeight, type: "height" };
};

const App = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [board, setBoard] = useState<MinesweeperBoard>(() =>
    CreateBoard(0, 0, 0)
  );
  const [screenSize, setScreenSize] = useState<WindowDimensions>(() =>
    determineSize()
  );

  useLayoutEffect(() => {
    setBoard(
      CreateBoard(
        difficulty.boardSize.x,
        difficulty.boardSize.y,
        difficulty.mines
      )
    );
  }, [difficulty.name]);

  useEffect(() => {
    const ResizeHandler = new ResizeObserver((_, __) => {
      setScreenSize(determineSize());
    });
    ResizeHandler.observe(document.body);

    return () => ResizeHandler.disconnect();
  }, []);

  return (
    <div className="gameHolder">
      <Topbar
        difficulty={{
          difficulty,
          setDifficulty,
        }}
        screenSize={screenSize}
        flags={board.flags}
        started={board.generated}
      />
      <Board
        difficulty={difficulty}
        board={{ board, setBoard }}
        screenSize={screenSize}
      />
    </div>
  );
};

export default App;
