import { GenerateCellBorders, GetCellFromBoard } from "../../game/Board";
import { Difficulties, Minesweeper, Utility } from "../../types";

import TextFitter from "../TextFitter";
import Cell from "./Cell";

import "./Board.scss";

interface BoardProps {
  difficulty: Difficulties.Difficulty;
  board: {
    board: Minesweeper.Board;
    updateBoard: React.Dispatch<Minesweeper.Events.BOARD_EVENT>;
  };
  windowSize: Utility.WindowDimensions;
}

/**
 * Represents the minesweeper board
 * @param props - The props to pass into the component. Includes difficulty, the board state, and the screen size
 * @returns The Board component
 */
const Board = (props: BoardProps) => {
  /* Render */

  /* Generate rows and populate them with cells */
  let rows: JSX.Element[] = [];

  for (let y = 0; y < props.board.board.size.height; y++) {
    let cellsForRow: JSX.Element[] = [];
    for (let x = 0; x < props.board.board.size.width; x++) {
      let coordinate = { x, y };
      let borders = GenerateCellBorders(props.board.board, coordinate);
      cellsForRow.push(
        <Cell
          cellInfo={{
            ...GetCellFromBoard(props.board.board, coordinate)!,
            borders,
            coordinate,
            peeked: !!props.board.board.peeks[`${x},${y}`],
          }}
          dispatcher={props.board.updateBoard}
          key={`cell-${x}-${y}`}
        />
      );
    }
    rows.push(
      <div className="row" key={`row-${y}`}>
        {cellsForRow}
      </div>
    );
  }

  return (
    <div className="board" style={{ width: props.windowSize.size }}>
      <TextFitter difficulty={props.difficulty} windowSize={props.windowSize}>
        {rows}
      </TextFitter>
    </div>
  );
};

export default Board;
