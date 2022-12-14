import flag from "../../../data/img/flag_icon.png";
import "./FlagTracker.scss";

interface FlagTrackerProps {
  flags: number;
}

const FlagTracker = (props: FlagTrackerProps) => {
  return (
    <div className="flagTracker">
      <img className="flagImage" src={flag} />
      <div className="flagAmount">{props.flags}</div>
    </div>
  );
};

export default FlagTracker;
