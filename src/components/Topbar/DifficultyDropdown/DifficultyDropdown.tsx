import { useState } from "react";
import DifficultyInfo, { Difficulties } from "../../../data/difficulties";
import "./DifficultyDropdown.scss";

type Visiblity = "hidden" | "visible";

const DifficultyDropdown = (props: any) => {
  const [display, setDisplay] = useState<Visiblity>("hidden");
  const [difficulty, setDifficulty] = useState<Difficulties>("Easy");

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
        {difficulty}
      </button>
      <div className="difficultyOptions" style={{ visibility: display }}>
        {(Object.keys(DifficultyInfo) as Difficulties[]).map(
          (currDifficulty) => (
            <div
              className="difficultyOption"
              onClick={() => setDifficulty(currDifficulty)}
              key={currDifficulty}
            >
              <span
                className="difficultyCheckmark"
                style={{
                  visibility:
                    display === "visible" && difficulty === currDifficulty
                      ? "visible"
                      : "hidden",
                }}
              ></span>
              <span className="difficultyName">{currDifficulty}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DifficultyDropdown;
