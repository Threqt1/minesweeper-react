import { memo } from "react";
import "./Cell.scss";

interface CellProps {
  isFlagged: boolean;
  isFlipped: boolean;
  isBomb: boolean;
  minesNear: number;
  seed: number;
}

const Cell = (props: { info: CellProps }) => {
  return (
    <div
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
      {props.info.minesNear > 0 ? props.info.minesNear : ""}
    </div>
  );
};

export default memo(Cell, (prevProps, nextProps) => {
  return (
    prevProps.info.isFlagged === nextProps.info.isFlagged &&
    prevProps.info.isFlipped === nextProps.info.isFlipped
  );
});
