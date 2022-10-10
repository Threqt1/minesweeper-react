import clock from "../../data/img/clock_icon.png";
import trophy from "../../data/img/trophy_icon.png";
import lose_screen from "../../data/img/lose_screen.png";
import win_screen from "../../data/img/win_screen.png";
import "./GameOverlay.scss";
import { useMemo } from "react";

const GameOverlay = (props: {
  game: {
    status: "start" | "in_progress" | "done";
    stats?: {
      duration: number;
      type: "win" | "loss";
    };
  };
  overlayStatus: boolean;
  onRestart: () => void;
}) => {
  return useMemo(() => {
    return (
      <div
        className={`gameOverlay ${
          props.game.status === "done" ? `gameOver` : ``
        } ${props.overlayStatus === true ? `overlayOn` : ``}`}
      >
        {(() => {
          if (props.overlayStatus === true && props.game.stats)
            return (
              <>
                <div
                  className="data"
                  style={{
                    backgroundImage: `url(${
                      props.game.stats.type === "win" ? win_screen : lose_screen
                    })`,
                  }}
                >
                  <div className="statHolder">
                    <div className="statDisplay">
                      <img src={clock}></img>
                      <span>
                        {props.game.stats.type === "win"
                          ? `${Math.min(
                              Math.floor(props.game.stats.duration / 1000),
                              999
                            )}`.padStart(3, "0")
                          : `–––`}
                      </span>
                    </div>
                    <div className="statDisplay">
                      <img src={trophy}></img>
                      <span>–––</span>
                    </div>
                  </div>
                </div>
                <button className="restart" onClick={props.onRestart}>
                  Try Again
                </button>
              </>
            );
        })()}
      </div>
    );
  }, [props.game.status, props.overlayStatus]);
};

export default GameOverlay;
