import { useEffect, useState } from "react";

import ResizeText from "../ResizeText";
import Cell from "./Cell";

import { Difficulties, Difficulty } from "../../data/difficulties";
import {
  getCoordFromBoard,
  HandleBoardClick,
  HandleBoardFlag,
  HandleCellBorders,
  MinesweeperBoard,
} from "../../game/Board";
import { WindowDimensions } from "../App/App";
import { CellElementProps } from "./Cell/Cell";

import "./Board.scss";

function ConstructRow(
  board: MinesweeperBoard,
  y: number,
  props: Omit<CellElementProps, "info">
) {
  let arr = [];
  for (let x = 0; x < board.width; x++) {
    arr.push(
      <Cell
        info={{
          ...getCoordFromBoard(board, x, y),
          x,
          y,
          borderInfo: HandleCellBorders(board, x, y),
        }}
        key={"y" + y + "-x" + x}
        {...props}
      />
    );
  }
  return arr;
}

function ConstructBoard(
  board: MinesweeperBoard,
  props: Omit<CellElementProps, "info">
) {
  let arr = [];
  for (let y = 0; y < board.height; y++) {
    arr.push(
      <div className="row" key={"row-" + y}>
        {ConstructRow(board, y, props)}
      </div>
    );
  }
  return arr;
}

const Board = (props: {
  difficulty: Difficulty;
  board: {
    board: MinesweeperBoard;
    setBoard: React.Dispatch<React.SetStateAction<MinesweeperBoard>>;
  };
  screenSize: WindowDimensions;
}) => {
  const [_fontSize, _setFontSize] = useState<
    Partial<{
      [key in `${Difficulties}_${keyof WindowDimensions}`]:
        | number
        | "width"
        | "height";
    }>
  >({});

  const setFontSize = (
    difficulty: Difficulty | null,
    info: WindowDimensions = { size: 0, type: "width" }
  ) => {
    if (difficulty === null || info.size <= 0) {
      _setFontSize({});
    } else {
      _setFontSize((oldSizes) => {
        let newProps = {
          [`${difficulty.name}_size`]: info.size,
          [`${difficulty.name}_type`]: info.type,
        };
        return { ...oldSizes, ...newProps };
      });
    }
  };

  const fontSize = (
    difficulty: Difficulty
  ): {
    size: number;
    type: "width" | "height";
  } => {
    let size = _fontSize[`${difficulty.name}_size`] ?? 0;
    let type = _fontSize[`${difficulty.name}_type`] ?? "width";
    return { size: size as number, type: type as "width" | "height" };
  };

  const HandleClick = (x: number, y: number) => {
    props.board.setBoard(HandleBoardClick(props.board.board, x, y).board);
  };

  const HandleFlag = (x: number, y: number) => {
    props.board.setBoard(HandleBoardFlag(props.board.board, x, y));
  };

  useEffect(() => {
    if (fontSize(props.difficulty).size <= 0) {
      setFontSize(props.difficulty, {
        size: 0,
        type: props.screenSize.type,
      });
    }
  }, [props.difficulty.name]);

  useEffect(() => {
    setFontSize(null);
  }, [props.screenSize.type]);

  return (
    <>
      <div
        className="board"
        style={{
          width: 0.8 * props.screenSize.size,
        }}
      >
        {ConstructBoard(props.board.board, {
          fontSize: fontSize(props.difficulty),
          onClick: HandleClick,
          onFlag: HandleFlag,
        })}
      </div>
      {(() => {
        if (fontSize(props.difficulty).size <= 0) {
          return (
            <ResizeText
              size={{
                size: Math.floor(
                  (0.8 * props.screenSize.size) / props.difficulty.boardSize.x
                ),
                type: props.screenSize.type,
              }}
              setFontSize={setFontSize}
              difficulty={props.difficulty}
            />
          );
        }
      })()}
    </>
  );
};

export default Board;
