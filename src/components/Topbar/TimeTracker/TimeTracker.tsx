import { useEffect, useRef, useState } from "react";

import clock from "../../../data/img/clock_icon.png";
import "./TimeTracker.scss";

const TimeTracker = (props: { status: "start" | "in_progress" | "done" }) => {
  const [time, setTime] = useState(0);
  let interval = useRef<number>();

  const tick = () => {
    setTime((oldTime) => oldTime + 1);
  };

  useEffect(() => {
    switch (props.status) {
      case "start":
        setTime(0);
        break;
      case "in_progress":
        interval.current = setInterval(() => tick(), 1000);
        break;
      case "done":
        if (interval.current && interval.current > -1)
          clearInterval(interval.current);
        break;
    }
    return () => clearInterval(interval.current);
  }, [props.status]);

  useEffect(() => {
    if (time >= 999) {
      clearInterval(interval.current);
      interval.current = -1;
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
