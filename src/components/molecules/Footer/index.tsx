import { NavLink } from "react-router-dom";
import DiscordIcon from "src/icons/DiscordIcon";
import TwitterIcon from "src/icons/TwitterIcon";
import WormholeBrand from "../WormholeBrand";

import "./styles.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <WormholeBrand width={49} height={43} />

      <div className="footer-links">
        <div className="footer-links-item">
          <NavLink to="/">FAQs</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">Status</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">Bridge</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">Stats</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">Contact us</NavLink>
        </div>
      </div>

      <div className="footer-social">
        Join us:
        <DiscordIcon />
        <TwitterIcon />
      </div>
    </footer>
  );
};

export default Footer;
