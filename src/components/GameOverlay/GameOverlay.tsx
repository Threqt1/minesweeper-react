import "./GameOverlay.scss";

const GameOverlay = (props: {
  gameStatus: "start" | "in_progress" | "done";
  overlayStatus: boolean;
}) => {
  return (
    <div
      className={`gameOverlay ${
        props.gameStatus === "done" ? `gameOver` : ``
      } ${props.overlayStatus === true ? `overlayOn` : ``}`}
    ></div>
  );
};

export default GameOverlay;
