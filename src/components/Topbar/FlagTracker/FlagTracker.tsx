import flag from "../../../data/img/flag_icon.png";
import "./FlagTracker.scss";

const FlagTrackers = (props: { flags: number }) => {
  return (
    <div className="flagTracker">
      <img className="flagImage" src={flag} />
      <div className="flagAmount">{props.flags}</div>
    </div>
  );
};

export default FlagTrackers;
