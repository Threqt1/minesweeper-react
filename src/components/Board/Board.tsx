import { useEffect, useState } from "react";
import {
  Difficulties,
  Difficulty,
  DifficultyInfo,
} from "../../data/difficulties";
import {
  CreateBoard,
  getCoordFromBoard,
  HandleBoardClick,
  MinesweeperBoard,
} from "../../game/Board";
import ResizeText from "../ResizeText";
import "./Board.scss";
import Cell from "./Cell";

function ConstructRow(
  board: MinesweeperBoard,
  y: number,
  handleClick: (x: number, y: number) => void,
  fontSize: number
) {
  let arr = [];
  for (let x = 0; x < board.width; x++) {
    arr.push(
      <Cell
        info={getCoordFromBoard(board, x, y)}
        key={"cell-" + y + "-" + x}
        onClick={() => handleClick(x, y)}
        fontSize={fontSize}
      />
    );
  }
  return arr;
}

function ConstructBoard(
  board: MinesweeperBoard,
  handleClick: (x: number, y: number) => void,
  fontSize: number
) {
  let arr = [];
  for (let y = 0; y < board.height; y++) {
    arr.push(
      <div className="row" key={"row-" + y}>
        {ConstructRow(board, y, handleClick, fontSize)}
      </div>
    );
  }
  return arr;
}

const determineSize = () => {
  return window.innerHeight > window.innerWidth
    ? window.innerWidth
    : window.innerHeight;
};

const Board = (props: { difficulty: Difficulty }) => {
  const [board, setBoard] = useState<MinesweeperBoard>(() =>
    CreateBoard(
      props.difficulty.boardSize.x,
      props.difficulty.boardSize.y,
      props.difficulty.mines
    )
  );

  const [screenSize, setScreenSize] = useState<number>(() => determineSize());
  const [fontSize, setFontSize] = useState<
    Partial<Record<Difficulties, number>>
  >({});

  useEffect(() => {
    const ResizeHandler = new ResizeObserver((_, __) => {
      setScreenSize(determineSize());
    });
    ResizeHandler.observe(document.body);

    return () => ResizeHandler.disconnect();
  }, []);

  useEffect(() => {
    if (!fontSize[props.difficulty.name]) {
      fontSize[props.difficulty.name] = -1;
    }
    setBoard(
      CreateBoard(
        props.difficulty.boardSize.x,
        props.difficulty.boardSize.y,
        props.difficulty.mines
      )
    );
  }, [props.difficulty.name]);

  const HandleClick = (x: number, y: number) => {
    let newBoard = HandleBoardClick(board, x, y);
    setBoard(newBoard);
  };

  return (
    <>
      <div
        className="board"
        style={{
          width: 0.8 * screenSize,
        }}
      >
        {ConstructBoard(
          board!,
          HandleClick,
          (fontSize[props.difficulty.name] ?? -1) > -1
            ? fontSize[props.difficulty.name]!
            : 0
        )}
      </div>
      {(() => {
        if ((fontSize[props.difficulty.name] ?? -1) < 0) {
          return (
            <ResizeText
              width={Math.floor(
                (0.8 * screenSize) / props.difficulty.boardSize.x
              )}
              setFontSize={setFontSize}
              difficulty={props.difficulty.name}
            />
          );
        }
      })()}
    </>
  );
};

export default Board;
