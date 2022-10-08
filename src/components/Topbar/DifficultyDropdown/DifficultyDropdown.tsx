import { useState } from "react";

import { Difficulty, DifficultyList } from "../../../data/difficulties";

import "./DifficultyDropdown.scss";

type Visiblity = "hidden" | "visible";

const DifficultyDropdown = (props: {
  difficulty: {
    difficulty: Difficulty;
    setDifficulty: (difficulty: Difficulty) => void;
  };
}) => {
  const [display, setDisplay] = useState<Visiblity>("hidden");

  const toggleDropdownVisibility = (currVisibility: Visiblity) =>
    currVisibility === "hidden" ? "visible" : "hidden";

  return (
    <div className="difficultyDropdown">
      <button
        className="difficultyButton"
        onClick={() => {
          setDisplay(toggleDropdownVisibility);
        }}
      >
        {props.difficulty.difficulty.name}
      </button>
      <div className="difficultyOptions" style={{ visibility: display }}>
        {(Object.values(DifficultyList) as Difficulty[]).map(
          (currDifficulty) => (
            <div
              className="difficultyOption"
              onClick={() => {
                props.difficulty.setDifficulty(currDifficulty);
                setDisplay(toggleDropdownVisibility);
              }}
              key={currDifficulty.name}
            >
              <span
                className="difficultyCheckmark"
                style={{
                  visibility:
                    display === "visible" &&
                    props.difficulty.difficulty.name === currDifficulty.name
                      ? "visible"
                      : "hidden",
                }}
              ></span>
              <span className="difficultyName">{currDifficulty.name}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DifficultyDropdown;
