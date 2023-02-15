import { NavLink } from "react-router-dom";
import WormholeBrand from "../WormholeBrand";
import "./styles.scss";

const Header = () => {
  return (
    <header className="header">
      <WormholeBrand width={49} height={43} />

      <div className="header-navigation">
        <nav>
          <div className="header-navigation-item">
            <NavLink to="/">Status</NavLink>
          </div>

          <div className="header-navigation-item">
            <NavLink to="/">Bridge</NavLink>
          </div>

          <div className="header-navigation-item">
            <NavLink to="/">Stats</NavLink>
          </div>

          <div className="header-navigation-item">
            <NavLink to="/">My history</NavLink>
          </div>
        </nav>

        <div className="header-actions">
          <button className="connect-button">Connect Wallet</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
