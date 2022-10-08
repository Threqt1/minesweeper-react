import DifficultyDropdown from "./DifficultyDropdown";
import FlagTracker from "./FlagTracker";
import TimeTracker from "./TimeTracker";
import VolumeToggle from "./VolumeToggle";
import "./Topbar.scss";
import { Difficulty } from "../../data/difficulties";
import { useEffect, useState } from "react";

const determineSize = () => {
  return window.innerHeight > window.innerWidth
    ? window.innerWidth
    : window.innerHeight;
};

const Navbar = (props: {
  difficulty: {
    difficulty: Difficulty;
    setDifficulty: (difficulty: Difficulty) => void;
  };
}) => {
  const [screenSize, setScreenSize] = useState<number>(() => determineSize());
  const updateScreenSize = (ev: UIEvent) =>
    setScreenSize(() => determineSize());

  useEffect(() => {
    window.addEventListener("resize", updateScreenSize);

    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  });

  return (
    <nav
      style={{
        width: 0.8 * screenSize,
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
