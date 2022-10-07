import { memo } from "react";
import "./Cell.scss";

interface CellProps {
  isFlagged: boolean;
  isFlipped: boolean;
  isBomb: boolean;
  minesNear: number;
  seed: number;
}

const Cell = (props: {
  info: CellProps;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <div
      onClick={props.onClick}
      className={`cell ${
        props.info.isFlipped
          ? props.info.isBomb
            ? `mine-${props.info.seed % 8}`
            : `flipped-${props.info.seed % 2} ${
                props.info.minesNear > 0 ? `near-${props.info.minesNear}` : ``
              }`
          : `hidden-${props.info.seed % 2}`
      } `}
    >
      {props.info.minesNear > 0 && props.info.isFlipped
        ? props.info.minesNear
        : ""}
    </div>
  );
};

export default Cell;
