import "./Board.scss";
import Cell from "./Cell";

const Board = (props: any) => {
  return <div className="board"></div>;
};

export default Board;

/* {new Array(y).fill(0).map((_, i) => {
        let startSeed = i % 2;
        return (
          <div className="row">
            {new Array(x).fill(0).map((__) => (
              <Cell
                info={{
                  isFlagged: false,
                  isFlipped: false,
                  isBomb: false,
                  minesNear: -1,
                  seed: startSeed++,
                }}
              />
            ))}
          </div>
        );
      })} */
