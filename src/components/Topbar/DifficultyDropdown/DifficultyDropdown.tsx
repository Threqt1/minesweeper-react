import { useState } from "react";

import { DifficultyList } from "../../../data/difficulties";
import { Difficulties } from "../../../types";

import "./DifficultyDropdown.scss";

interface DifficultyDropdownProps {
  difficulty: {
    difficulty: Difficulties.Difficulty;
    setDifficulty: React.Dispatch<
      React.SetStateAction<Difficulties.Difficulty>
    >;
  };
}

/**
 * A type to represent the visibility of the dropdown
 */
type Visiblity = "hidden" | "visible";

const DifficultyDropdown = (props: DifficultyDropdownProps) => {
  /* States */

  /**
   * State to represent if the dropdown is visible or hidden
   */
  const [visibility, setVisibility] = useState<Visiblity>("hidden");

  /* Other Functions */

  /**
   * Toggle the visibility of the dropdown
   * @param currVisibility - The current visibility
   * @returns The new visibility
   */
  const toggleVisibility = (currVisibility: Visiblity) =>
    currVisibility === "hidden" ? "visible" : "hidden";

  /**
   * Sets the board difficulty as the chosen difficulty
   * @param difficulty The new difficulty to set
   * @returns void
   */
  const setNewDifficulty = (difficulty: Difficulties.Difficulty) =>
    props.difficulty.setDifficulty(difficulty);

  /* Render */

  /* Generate difficulties */
  let difficultyElements: JSX.Element[] = [];

  for (let difficulty of Object.values(DifficultyList)) {
    /* Determine if the checkmark should be visible */
    let checkmarkVisibility: Visiblity = "hidden";
    if (
      visibility === "visible" &&
      props.difficulty.difficulty.name === difficulty.name
    )
      checkmarkVisibility = "visible";
    /* Real rendering */
    difficultyElements.push(
      <div
        className="difficultyOption"
        onClick={() => {
          /* Set new difficulty and toggle off */
          setNewDifficulty(difficulty);
          setVisibility((currVisibility) => toggleVisibility(currVisibility));
        }}
        key={difficulty.name}
      >
        <span
          className="difficultyCheckmark"
          style={{ visibility: checkmarkVisibility }}
        />
        <span className="difficultyName">{difficulty.name}</span>
      </div>
    );
  }

  return (
    <div className="difficultyDropdown">
      <button
        className="difficultyButton"
        onClick={() =>
          setVisibility((currVisibility) => toggleVisibility(currVisibility))
        }
      >
        {props.difficulty.difficulty.name}
      </button>
      <div className="difficultyOptions" style={{ visibility }}>
        {difficultyElements}
      </div>
    </div>
  );
};

export default DifficultyDropdown;
