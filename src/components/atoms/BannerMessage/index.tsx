import NavLink from "../NavLink";
import "./style.scss";

const MaintenanceMessage = () => {
  return (
    <div className="banner-message">
      <div className="banner-message-bg" />
      <div className="banner-message-content">
        <div className="banner-message-content-icon">
          <div className="banner-message-content-icon-dot" />
        </div>

        <p className="banner-message-content-text">
          Due to maintenance, the WormholeScan will be unavailable on July 15th between 15:00 -
          18:00 UTC
        </p>
      </div>
    </div>
  );
};

const SubmitProtocolMessage = () => {
  return (
    <div className="banner-message">
      <div className="banner-message-bg" />
      <div className="banner-message-content">
        <div className="banner-message-content-icon">
          <div className="banner-message-content-icon-dot" />
        </div>

        <p className="banner-message-content-text">
          Now you can submit your protocol to WormholeScan using our
          <NavLink to="/developers/submit">
            <span className="banner-message-content-text-link">Submit Your Protocol</span>
          </NavLink>
          tool.
        </p>
      </div>
    </div>
  );
};

export default SubmitProtocolMessage;
