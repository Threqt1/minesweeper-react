import { useRef } from "react";

import { WindowDimensions } from "../../App/App";

import flag from "../../../data/img/flag_icon.png";
import "./Cell.scss";

interface CellProps {
  x: number;
  y: number;
  isFlagged: boolean;
  isFlipped: boolean;
  isBomb: boolean;
  minesNear: number;
  seed: number;
}

export type CellElementProps = {
  info: CellProps;
  onClick: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
  fontSize: WindowDimensions;
};

const Cell = (props: CellElementProps) => {
  const cellRef = useRef<HTMLDivElement>();

  return (
    <div
      ref={cellRef as any}
      onClick={(e) => {
        e.preventDefault();
        props.onClick(props.info.x, props.info.y);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        props.onFlag(props.info.x, props.info.y);
      }}
      className={`cell ${
        props.info.isFlipped
          ? props.info.isBomb
            ? `mine-${props.info.seed % 8}`
            : `flipped-${props.info.seed % 2} ${
                props.info.minesNear > 0 ? `near-${props.info.minesNear}` : ``
              }`
          : `hidden-${props.info.seed % 2}`
      }`}
    >
      <>
        <div className={`flagAnimation ${props.info.isFlagged ? "start" : ""}`}>
          {(() => {
            if (props.info.isFlagged) {
              return (
                <img
                  style={{
                    width: `${Math.floor(cellRef.current!.clientWidth - 1)}px`,
                    height: `${
                      Math.floor(cellRef.current!.clientHeight) - 1
                    }px`,
                  }}
                  className="flag"
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
  );
};

export default Cell;
