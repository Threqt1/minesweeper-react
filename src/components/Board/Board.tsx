import { useEffect, useState } from "react";

import ResizeText from "../ResizeText";
import Cell from "./Cell";

import { Difficulties, Difficulty } from "../../data/difficulties";
import {
  getCoordFromBoard,
  HandleBoardClick,
  HandleBoardFlag,
  HandleBoardFlippingPeekCells,
  HandleBoardLoss,
  HandleBoardPeeks,
  HandleBoardWin,
  HandleCellBorders,
  MinesweeperBoard,
} from "../../game/Board";
import { WindowDimensions } from "../App/App";
import { CellElementProps } from "./Cell/Cell";

import "./Board.scss";

function ConstructRow(
  board: MinesweeperBoard,
  y: number,
  props: Omit<CellElementProps, "info">,
  peeks: {
    [key: `${number},${number}`]: boolean;
  }
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
          highlighted: peeks[`${x},${y}`] ?? false,
        }}
        key={x + "," + y}
        {...props}
      />
    );
  }
  return arr;
}

function ConstructBoard(
  board: MinesweeperBoard,
  props: Omit<CellElementProps, "info">,
  peeks: {
    [key: `${number},${number}`]: boolean;
  }
) {
  let arr = [];
  for (let y = 0; y < board.height; y++) {
    arr.push(
      <div className="row" key={"row-" + y}>
        {ConstructRow(board, y, props, peeks)}
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

  const [peeks, setPeeks] = useState<{
    [key: `${number},${number}`]: boolean;
  }>({});

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
    let click = HandleBoardClick(props.board.board, x, y);
    if (click.code === "fail") {
      props.board.setBoard(HandleBoardLoss(click.board, x, y));
    } else {
      props.board.setBoard(click.board);
    }
  };

  const HandleFlag = (x: number, y: number) => {
    props.board.setBoard(HandleBoardFlag(props.board.board, x, y));
  };

  const HandlePeekStart = (x: number, y: number) => {
    let possiblePeeks = HandleBoardPeeks(props.board.board, x, y);
    if (!possiblePeeks) return;
    if (possiblePeeks.shouldFlip) {
      let peekedBoard = HandleBoardFlippingPeekCells(
        props.board.board,
        possiblePeeks.cells
      );
      if (peekedBoard.code === "fail") {
        props.board.setBoard(
          HandleBoardLoss(peekedBoard.board, peekedBoard.x, peekedBoard.y)
        );
      } else {
        props.board.setBoard(peekedBoard.board);
      }
    } else {
      setPeeks(possiblePeeks.cells);
    }
  };

  const HandlePeekEnd = () => {
    setPeeks({});
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
    if (
      props.board.board.status === "in_progress" &&
      props.board.board.unflippedTiles === 0
    ) {
      props.board.setBoard(HandleBoardWin(props.board.board));
    }
  }, [props.board.board.unflippedTiles]);

  useEffect(() => {
    setFontSize(null);
  }, [props.screenSize.type]);

  return (
    <>
      <div
        className="board"
        style={{
          width: props.screenSize.size,
        }}
      >
        {ConstructBoard(
          props.board.board,
          {
            fontSize: fontSize(props.difficulty),
            onClick: HandleClick,
            onFlag: HandleFlag,
            onPeekStart: HandlePeekStart,
            onPeekEnd: HandlePeekEnd,
          },
          peeks
        )}
      </div>
      {(() => {
        if (fontSize(props.difficulty).size <= 0) {
          return (
            <ResizeText
              size={{
                size: Math.floor(
                  props.screenSize.size / props.difficulty.boardSize.x
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
