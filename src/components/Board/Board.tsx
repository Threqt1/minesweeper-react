import { useState } from "react";
import { Difficulty, DifficultyList } from "../../data/difficulties";
import {
  CreateBoard,
  getCoordFromBoard,
  HandleBoardClick,
  MinesweeperBoard,
} from "../../game/Board";
import "./Board.scss";
import Cell from "./Cell";

const DEFAULT_DIFFICULTY = DifficultyList.Medium;

function ConstructRow(
  board: MinesweeperBoard,
  y: number,
  handleClick: (x: number, y: number) => void
) {
  let arr = [];
  for (let x = 0; x < board.width; x++) {
    arr.push(
      <Cell
        info={getCoordFromBoard(board, x, y)}
        key={"cell-" + y + "-" + x}
        onClick={() => handleClick(x, y)}
      />
    );
  }
  return arr;
}

function ConstructBoard(
  board: MinesweeperBoard,
  handleClick: (x: number, y: number) => void
) {
  let arr = [];
  for (let y = 0; y < board.height; y++) {
    arr.push(
      <div className="row" key={"row-" + y}>
        {ConstructRow(board, y, handleClick)}
      </div>
    );
  }
  return arr;
}

const Board = (props: any) => {
  const [board, setBoard] = useState<MinesweeperBoard>(() =>
    CreateBoard(
      DEFAULT_DIFFICULTY.boardSize.x,
      DEFAULT_DIFFICULTY.boardSize.y,
      DEFAULT_DIFFICULTY.mines
    )
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);

  const HandleClick = (x: number, y: number) => {
    let newBoard = HandleBoardClick(board, x, y);
    setBoard(newBoard);
  };

  return <div className="board">{ConstructBoard(board!, HandleClick)}</div>;
};

export default Board;
