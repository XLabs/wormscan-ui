import { NavLink } from "react-router-dom";
import { WormholeIcon } from "src/components/atoms";
import "./styles.scss";

const Header = () => {
  return (
    <header className="header">
      <div className="header-title">
        <WormholeIcon width={49} height={43} />
        <span>WORMSCAN</span>
      </div>

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
          <div className="connect-button">Connect Wallet</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
