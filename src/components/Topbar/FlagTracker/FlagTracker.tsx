import { useState } from "react";
import flag from "../../../data/img/flag_icon.png";
import "./FlagTracker.scss";

const FlagTrackers = (props: any) => {
  const [flags, setFlags] = useState(0);

  return (
    <div className="flagTracker">
      <img className="flagImage" src={flag} />
      <div className="flagAmount">{flags}</div>
    </div>
  );
};

export default FlagTrackers;
