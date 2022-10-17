import { CSSProperties, useContext, useRef } from "react";

import { BorderInfo } from "../../../game/Board";
import { Minesweeper, Utility } from "../../../types";

import { FontContext } from "../../TextFitter/TextFitter";

import flag from "../../../data/img/flag_icon.png";
import wrongFlag from "../../../data/img/incorrect_flag.png";
import "./Cell.scss";

interface CellProps {
  cellInfo: Minesweeper.Cell & {
    coordinate: Utility.CoordinatePair;
    borders: BorderInfo;
    peeked: boolean;
  };
  dispatcher: React.Dispatch<Minesweeper.Events.BOARD_EVENT>;
}

/**
 * Represents a cell on the minesweeper board
 * @param props - The props to pass into the component. The cell info and a dispatcher for click events
 * @returns The cell component
 */
const Cell = (props: CellProps) => {
  /* Context */
  const fontSize = useContext(FontContext);

  /* Refs */

  /**
   * A ref to the actual HTML cell element
   */
  const cellRef = useRef<HTMLDivElement>();

  /**
   * A ref which states whether this cell is currently being peeked or not
   */
  const isPeekedRef = useRef<boolean>(false);

  /* Other Functions */

  /**
   * To handle interactions regarding clicking on the cell (click, flag, peek)
   */
  const HandleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    /* If LMB down */
    if (e.buttons === 1) {
      props.dispatcher({
        type: "CLICK_CELL",
        coordinate: props.cellInfo.coordinate,
      });
    } else if (e.buttons === 2) {
      /* If RMB down */
      props.dispatcher({
        type: "FLAG_CELL",
        coordinate: props.cellInfo.coordinate,
      });
    } else if (e.buttons === 3) {
      /* If both down */
      isPeekedRef.current = true;
      props.dispatcher({
        type: "PEEK_CELL",
        coordinate: props.cellInfo.coordinate,
        hasEnded: false,
      });
    }
  };

  /**
   * To handle peeks being ended by releasing LMB/RMB
   */
  const HandleMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    /* If both LMB and RMB aren't being held down at the same time and cell was being peeked */
    if (e.buttons !== 3 && isPeekedRef.current) {
      isPeekedRef.current = false;
      props.dispatcher({
        type: "PEEK_CELL",
        coordinate: props.cellInfo.coordinate,
        hasEnded: true,
      });
    }
  };

  /**
   * To handle peeks being ended by the mouse moving out of cell
   */
  const HandleMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    /* If cell was being peeked */
    if (isPeekedRef.current) {
      isPeekedRef.current = false;
      props.dispatcher({
        type: "PEEK_CELL",
        coordinate: props.cellInfo.coordinate,
        hasEnded: true,
      });
    }
  };

  /* Render */

  let children: JSX.Element[] = [];
  let childrenWithRef: ((
    ref: React.MutableRefObject<HTMLDivElement | undefined>
  ) => JSX.Element)[] = [];
  let className = "cell";

  /* Add classes for basic styling */
  if (props.cellInfo.isFlipped) {
    if (props.cellInfo.isBomb) {
      className += ` mine-${props.cellInfo.seed % 8}`;
      children.push(<div className="mineCircle" key="mineCircle" />);
    } else {
      className += ` flipped-${props.cellInfo.seed % 2}`;
    }
  } else {
    className += ` hidden-${props.cellInfo.seed % 2}`;
  }
  if (props.cellInfo.peeked) {
    className += ` highlighted`;
  }

  /* Handle if the cell is supposed to flash */
  if (props.cellInfo.win) {
    if (props.cellInfo.isBomb) {
      className += ` winFlash`;
    } else {
      className += ` win-${props.cellInfo.seed % 2}`;
    }
  }

  /* Handle borders */
  let borders: JSX.Element[] = [];
  for (let direction of Object.keys(props.cellInfo.borders)) {
    borders.push(
      <div className={`border-${direction}`} key={`borders-${direction}`} />
    );
  }

  children.push(
    <div className="borders" key="borders">
      {borders}
    </div>
  );

  /* Handle Flagging. Wrap in function as we need cell ref for sizing */
  childrenWithRef.push((ref) => {
    let flagImage = undefined;
    if (props.cellInfo.isFlagged && ref.current) {
      flagImage = (
        <img
          style={{
            width: `${Math.floor(ref.current.clientWidth - 1)}px`,
            height: `${Math.floor(ref.current.clientHeight - 1)}px`,
          }}
          className="cellImage"
          src={flag}
          key="flagImage"
        />
      );
    }
    return (
      <div
        className={`flagAnimation ${flagImage ? `start` : ``}`}
        key="flagHolder"
      >
        {flagImage}
      </div>
    );
  });

  /* Handle if the flag was wrong */
  childrenWithRef.push((ref) => {
    let wrongFlagImage = undefined;
    if (props.cellInfo.fail && props.cellInfo.fail.isWrongFlag && ref.current) {
      wrongFlagImage = (
        <img
          style={{
            width: `${Math.floor(ref.current.clientWidth - 1)}px`,
            height: `${Math.floor(ref.current.clientHeight - 1)}px`,
          }}
          className="cellImage"
          src={wrongFlag}
          key="wrongFlagImage"
        />
      );
    }
    return <div key="wrongFlagImageHolder">{wrongFlagImage}</div>;
  });

  /* Handle the adjacent mine text */
  let spanClass = ``;
  let spanText = undefined;

  if (props.cellInfo.adjacentMines > 0 && props.cellInfo.isFlipped) {
    spanClass += `near-${props.cellInfo.adjacentMines} `;
    spanText = props.cellInfo.adjacentMines;
  }

  if (props.cellInfo.win) {
    spanClass += `hideText `;
  }

  children.push(
    <span
      className={spanClass.trim().length === 0 ? undefined : spanClass.trim()}
      key="minesNearSpan"
    >
      {spanText}
    </span>
  );

  /* Set style properties */
  let style: CSSProperties | undefined = undefined;

  /* Set transition based on if its needed or not */
  if (props.cellInfo.win && !props.cellInfo.isBomb) {
    style = { ...(style ?? {}), transition: `background-color 1s linear 0.7s` };
  }

  /* Set font size */
  style = { ...(style ?? {}), fontSize };

  return (
    <div
      ref={cellRef as any}
      className={className.trim()}
      style={style}
      onMouseDown={HandleMouseDown}
      onMouseUp={HandleMouseUp}
      onMouseLeave={HandleMouseLeave}
      key={`cell-${props.cellInfo.coordinate.y}-${props.cellInfo.coordinate.x}`}
    >
      {children}
      {childrenWithRef.map((r) => r(cellRef))}
    </div>
  );
};

export default Cell;
