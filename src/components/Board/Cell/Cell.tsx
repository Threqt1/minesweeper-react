import { useMemo, useRef } from "react";

import { BorderInfo, MinesweeperCell } from "../../../game/Board";
import { WindowDimensions } from "../../App/App";

import flag from "../../../data/img/flag_icon.png";
import fail from "../../../data/img/incorrect_flag.png";
import "./Cell.scss";

export type CellProps = MinesweeperCell & {
  x: number;
  y: number;
  borderInfo: Partial<{
    [key in BorderInfo]: boolean;
  }>;
  highlighted: boolean;
};

export type CellElementProps = {
  info: CellProps;
  onClick: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
  onPeekStart: (x: number, y: number) => void;
  onPeekEnd: () => void;
  fontSize: WindowDimensions;
};

const Cell = (props: CellElementProps) => {
  const cellRef = useRef<HTMLDivElement>();
  const peeked = useRef<boolean>(false);

  return useMemo(
    () => (
      <div
        ref={cellRef as any}
        onMouseDown={(e) => {
          e.preventDefault();
          if (e.buttons === 1) {
            props.onClick(props.info.x, props.info.y);
          } else if (e.buttons === 2) {
            props.onFlag(props.info.x, props.info.y);
          } else if (e.buttons === 3) {
            peeked.current = true;
            props.onPeekStart(props.info.x, props.info.y);
          }
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          if (e.buttons !== 3 && peeked.current) {
            peeked.current = false;
            props.onPeekEnd();
          }
        }}
        onMouseLeave={(e) => {
          e.preventDefault();
          if (peeked.current) {
            peeked.current = false;
            props.onPeekEnd();
          }
        }}
        className={`cell ${
          props.info.isFlipped
            ? props.info.isBomb
              ? `mine-${props.info.seed % 8}`
              : `flipped-${props.info.seed % 2} ${
                  props.info.minesNear > 0 ? `near-${props.info.minesNear}` : ``
                }`
            : `hidden-${props.info.seed % 2} ${
                props.info.highlighted ? `highlighted` : ``
              }`
        }`}
        data-minesnear={props.info.isFlipped ? props.info.minesNear : undefined}
      >
        <>
          {(() => {
            if (props.info.isFlipped && props.info.isBomb) {
              return <div className="mineCircle"></div>;
            }
          })()}
          <div className="borders">
            {(() => {
              if (props.info.isFlipped) {
                return Object.entries(props.info.borderInfo).map(
                  ([dir, needed]) =>
                    needed ? (
                      <div
                        className={`border-${dir}`}
                        key={`border-${dir}`}
                      ></div>
                    ) : null
                );
              }
            })()}
          </div>
          {(() => {
            if (props.info.isWrong) {
              return (
                <img
                  className="cellImage"
                  style={{
                    width: `${Math.floor(cellRef.current!.clientWidth - 1)}px`,
                    height: `${
                      Math.floor(cellRef.current!.clientHeight) - 1
                    }px`,
                  }}
                  src={fail}
                ></img>
              );
            }
          })()}
          <div
            className={`flagAnimation ${props.info.isFlagged ? "start" : ""}`}
          >
            {(() => {
              if (props.info.isFlagged) {
                return (
                  <img
                    style={{
                      width: `${Math.floor(
                        cellRef.current!.clientWidth - 1
                      )}px`,
                      height: `${
                        Math.floor(cellRef.current!.clientHeight) - 1
                      }px`,
                    }}
                    className="cellImage"
                    src={flag}
                  ></img>
                );
              } else {
                return <></>;
              }
            })()}
          </div>
          <span
            style={{
              fontSize: `${props.fontSize.size}${
                props.fontSize.type === "width" ? "vw" : "vh"
              }`,
            }}
          >
            {props.info.minesNear > 0 && props.info.isFlipped
              ? props.info.minesNear
              : null}
          </span>
        </>
      </div>
    ),
    [props.info, props.fontSize, props.info.borderInfo]
  );
};

export default Cell;
