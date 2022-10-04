import DifficultyDropdown from "./DifficultyDropdown";
import FlagTracker from "./FlagTracker";
import TimeTracker from "./TimeTracker";
import VolumeToggle from "./VolumeToggle";
import "./Topbar.scss";

const Navbar = (props: any) => {
  return (
    <nav className="topbar">
      <ul className="topbar-elem topbar-left">
        <li>
          <DifficultyDropdown />
        </li>
      </ul>
      <ul className="topbar-elem topbar-center">
        <li>
          <FlagTracker />
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
