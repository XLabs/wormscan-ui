import "./style.scss";

const MaintenanceMessage = () => {
  return (
    <div className="maintenance-message">
      <div className="maintenance-message-icon">
        <div className="maintenance-message-icon-dot" />
      </div>

      <p className="maintenance-message-text">
        due to maintanace the wormhole scanner will be own on may 15th between 15:00 utc - 18:00 utc
      </p>
    </div>
  );
};

export default MaintenanceMessage;
