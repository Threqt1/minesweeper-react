import Topbar from "../Topbar";
import "./App.scss";

const App = (props: any) => {
  return (
    <div className="gameHolder">
      <div className="game">
        <Topbar />
      </div>
    </div>
  );
};

export default App;
