import { Minesweeper } from "../../types";

import clock from "../../data/img/clock_icon.png";
import trophy from "../../data/img/trophy_icon.png";
import lose_screen from "../../data/img/lose_screen.png";
import win_screen from "../../data/img/win_screen.png";
import "./GameOverlay.scss";

interface GameOverlayProps {
  game: {
    status: Minesweeper.Status;
    stats?: {
      duration: number;
      type: "win" | "loss";
    };
  };
  overlayStatus: boolean;
  functions: {
    RestartBoard: () => void;
    SkipAnimation: () => void;
  };
}

const GameOverlay = (props: GameOverlayProps) => {
  /* Other Functions */

  /**
   * Handle click on board (skip)
   */
  function HandleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (e.buttons === 1) {
      return props.functions.SkipAnimation();
    }
  }

  /**
   * Handle restart button click
   */
  function HandleRestart(e: React.MouseEvent) {
    e.preventDefault();
    return props.functions.RestartBoard();
  }

  /* Render */

  /* Add classes */
  let className = "gameOverlay";

  if (props.game.status === Minesweeper.Status.DONE) {
    className += " gameOver";
  }

  if (props.overlayStatus === true) {
    className += " overlayOn";
  }

  /* Handle middle modal */
  let modal: JSX.Element | undefined;

  if (props.overlayStatus === true && props.game.stats) {
    let backgroundImage = "";
    let time = "";
    let bestTime = "–––";

    if (props.game.stats.type === "win") {
      backgroundImage = "url(" + win_screen + ")";
      time = `${Math.min(
        Math.floor(props.game.stats.duration / 1000),
        999
      )}`.padStart(3, "0");
    } else {
      backgroundImage = "url(" + lose_screen + ")";
      time = "–––";
    }

    modal = (
      <>
        <div className="data" style={{ backgroundImage }}>
          <div className="statHolder">
            <div className="statDisplay">
              <div className="statImage">
                <img src={clock}></img>
              </div>
              <span>{time}</span>
            </div>
            <div className="statDisplay">
              <div className="statImage">
                <img src={trophy}></img>
              </div>
              <span>{bestTime}</span>
            </div>
          </div>
        </div>
        <button className="restart" onClick={HandleRestart}>
          Try Again
        </button>
      </>
    );
  }

  return (
    <div className={className} onMouseDown={HandleClick}>
      {modal}
    </div>
  );
};

export default GameOverlay;
