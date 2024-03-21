import analytics from "src/analytics";
import "./styles.scss";

type TabsProps = {
  setShowOverview: (show: boolean) => void;
  showOverview: boolean;
};

const Tabs = ({ setShowOverview, showOverview }: TabsProps) => {
  return (
    <div className="tx-tabs">
      <button
        className={`tx-tabs-trigger ${showOverview ? "tx-tabs-trigger-active" : ""}`}
        aria-label="Overview"
        onClick={() => {
          analytics.track("txView", {
            selected: "overview",
          });
          setShowOverview(true);
        }}
      >
        OVERVIEW
      </button>

      <button
        className={`tx-tabs-trigger ${!showOverview ? "tx-tabs-trigger-active" : ""}`}
        aria-label="Advanced View"
        onClick={() => {
          // TODO analytics, change raw to advanced?
          analytics.track("txView", {
            selected: "raw",
          });
          setShowOverview(false);
        }}
      >
        ADVANCED VIEW
      </button>
    </div>
  );
};

export default Tabs;
