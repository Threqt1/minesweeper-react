import { useEffect, useState } from "react";

import clock from "../../../data/img/clock_icon.png";
import "./TimeTracker.scss";

const TimeTracker = (props: { started: boolean }) => {
  const [time, setTime] = useState(0);

  const tick = () => {
    setTime((oldTime) => oldTime + 1);
  };

  let interval: number;

  useEffect(() => {
    setTime(0);
    if (props.started) {
      interval = setInterval(() => tick(), 1000);
      return () => clearInterval(interval);
    }
  }, [props.started]);

  useEffect(() => {
    if (time >= 999) {
      clearInterval(interval);
    }
  }, [time]);

  return (
    <div className="timeTracker">
      <img className="timeImage" src={clock} />
      <div className="timeAmount">{`${time}`.padStart(3, "0")}</div>
    </div>
  );
};

export default TimeTracker;
