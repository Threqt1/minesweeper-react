import Topbar from "../Topbar";
import Board from "../Board";
import "./App.scss";

const App = (props: any) => {
  return (
    <div className="gameHolder">
      <Topbar />
      <Board />
    </div>
  );
};

export default App;
