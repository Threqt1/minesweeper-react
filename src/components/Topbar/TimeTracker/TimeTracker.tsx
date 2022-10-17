import { useEffect, useRef, useState } from "react";

import { Minesweeper } from "../../../types";

import clock from "../../../data/img/clock_icon.png";
import "./TimeTracker.scss";

interface TimeTrackerProps {
  status: Minesweeper.Status;
}

const TimeTracker = (props: TimeTrackerProps) => {
  /* States */

  /**
   * State for tracking the current time displayed
   */
  const [time, setTime] = useState(0);

  /* Refs */

  /**
   * A ref to represent the interval that's incrementing counter
   */
  let interval = useRef<number>();

  /* Other Functions */

  /**
   * Increment the timer
   */
  const tick = () => {
    setTime((oldTime) => oldTime + 1);
  };

  /* Effects */

  /**
   * Effect to manage intervals based on the prop.status value
   */
  useEffect(() => {
    switch (props.status) {
      case Minesweeper.Status.START:
        setTime(0);
        break;
      case Minesweeper.Status.IN_PROGRESS:
        interval.current = setInterval(() => tick(), 1000);
        break;
      case Minesweeper.Status.DONE:
        if (interval.current && interval.current > -1)
          clearInterval(interval.current);
        break;
    }
    return () => clearInterval(interval.current);
  }, [props.status]);

  /**
   * Effect to stop interval if time exceeds capacity
   */
  useEffect(() => {
    if (time >= 999) {
      clearInterval(interval.current);
      interval.current = -1;
    }
  }, [time]);

  /* Render */

  return (
    <div className="timeTracker">
      <img className="timeImage" src={clock} />
      <div className="timeAmount">{`${time}`.padStart(3, "0")}</div>
    </div>
  );
};

export default TimeTracker;
