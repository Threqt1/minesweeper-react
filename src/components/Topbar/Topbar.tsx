import DifficultyDropdown from "./DifficultyDropdown";
import "./Topbar.scss";

const Navbar = (props: any) => {
  return (
    <nav className="topbar">
      <ul className="topbar-elem topbar-left">
        <li>
          <DifficultyDropdown />
        </li>
      </ul>
      <ul className="topbar-elem navbar-center">
        <li></li>
      </ul>
      <ul className="topbar-elem navbar-right">
        <li></li>
      </ul>
    </nav>
  );
};

export default Navbar;
