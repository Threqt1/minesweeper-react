import { Difficulties, Minesweeper, Utility } from "../../types";

import DifficultyDropdown from "./DifficultyDropdown";
import FlagTracker from "./FlagTracker";
import TimeTracker from "./TimeTracker";
import VolumeToggle from "./VolumeToggle";

import "./Topbar.scss";
import { useMemo } from "react";

interface TopbarProps {
  difficulty: {
    difficulty: Difficulties.Difficulty;
    setDifficulty: React.Dispatch<
      React.SetStateAction<Difficulties.Difficulty>
    >;
  };
  windowSize: Utility.WindowDimensions;
  flags: number;
  status: Minesweeper.Status;
}

/**
 * Represents the bar on top of the field with information about the game
 */
const Topbar = (props: TopbarProps) => {
  /* Wrap in useMemo for performance */
  return useMemo(() => {
    return (
      <nav
        style={{
          width: props.windowSize.size,
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
            <TimeTracker status={props.status} />
          </li>
        </ul>
        <ul className="topbar-elem topbar-right">
          <li>
            <VolumeToggle />
          </li>
        </ul>
      </nav>
    );
  }, [
    props.windowSize,
    props.difficulty.difficulty,
    props.flags,
    props.status,
  ]);
};

export default Topbar;
