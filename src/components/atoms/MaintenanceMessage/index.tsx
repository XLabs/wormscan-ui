import "./style.scss";

const MaintenanceMessage = () => {
  return (
    <div className="maintenance-message">
      <div className="maintenance-message-icon">
        <div className="maintenance-message-icon-dot" />
      </div>

      <p className="maintenance-message-text">
        Due to maintenance, the WormholeScan will be on May 15th from 15:00 UTC to 18:00 UTC.
      </p>
    </div>
  );
};

export default MaintenanceMessage;
