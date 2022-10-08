import DifficultyDropdown from "./DifficultyDropdown";
import FlagTracker from "./FlagTracker";
import TimeTracker from "./TimeTracker";
import VolumeToggle from "./VolumeToggle";

import { Difficulty } from "../../data/difficulties";
import { WindowDimensions } from "../App/App";

import "./Topbar.scss";

const Navbar = (props: {
  difficulty: {
    difficulty: Difficulty;
    setDifficulty: (difficulty: Difficulty) => void;
  };
  screenSize: WindowDimensions;
  flags: number;
}) => {
  return (
    <nav
      style={{
        width: 0.8 * props.screenSize.size,
      }}
      className="topbar"
    >
      <ul className="topbar-elem topbar-left">
        <li>
          <DifficultyDropdown difficulty={props.difficulty} />
        </li>
      </ul>
      <ul className="topbar-elem topbar-center">
        <li>
          <FlagTracker flags={props.flags} />
        </li>
        <li>
          <TimeTracker />
        </li>
      </ul>
      <ul className="topbar-elem topbar-right">
        <li>
          <VolumeToggle />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
