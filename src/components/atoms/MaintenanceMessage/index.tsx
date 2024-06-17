import "./style.scss";

const MaintenanceMessage = () => {
  return (
    <div className="maintenance-message">
      <div className="maintenance-message-bg" />
      <div className="maintenance-message-content">
        <div className="maintenance-message-content-icon">
          <div className="maintenance-message-content-icon-dot" />
        </div>

        <p className="maintenance-message-content-text">
          Due to maintenance, the WormholeScan will be unavailable on July 15th between 15:00 -
          18:00 UTC
        </p>
      </div>
    </div>
  );
};

export default MaintenanceMessage;
