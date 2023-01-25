import { DiscordLogoIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { WormholeIcon } from "src/components/atoms";
import "./styles.scss";

const Header = () => {
  return (
    <div className="header">
      <div className="header-title">
        <WormholeIcon size={54} />
        <span>EXPLORER</span>
      </div>

      <div className="header-options">
        <div className="header-options-item">
          <QuestionMarkCircledIcon className="faq-icon" />
          <span className="header-options-text">FAQ</span>
        </div>

        <div className="header-options-item">
          <DiscordLogoIcon className="discord-icon" />
          <span className="header-options-text">DISCORD</span>
        </div>

        <div className="header-options-item">
          <div className="connect-button">Connect Wallet</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
