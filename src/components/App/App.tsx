import { createContext, useState } from "react";

import Topbar from "../Topbar";
import Board from "../Board";
import "./App.scss";
import { Difficulty, DifficultyList } from "../../data/difficulties";

export const DEFAULT_DIFFICULTY = DifficultyList.Medium;

const App = (props: any) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);

  return (
    <div className="gameHolder">
      <Topbar
        difficulty={{
          difficulty,
          setDifficulty,
        }}
      />
      <Board difficulty={difficulty} />
    </div>
  );
};

export default App;
