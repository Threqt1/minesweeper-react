import { useState } from "react";
import clock from "../../../data/img/clock_icon.png";
import "./TimeTracker.scss";

const TimeTracker = (props: any) => {
  const [time, setTime] = useState(0);

  return (
    <div className="timeTracker">
      <img className="timeImage" src={clock} />
      <div className="timeAmount">{`${time}`.padStart(3, "0")}</div>
    </div>
  );
};

export default TimeTracker;
