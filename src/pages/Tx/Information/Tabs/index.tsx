import { ListBulletIcon } from "@radix-ui/react-icons";
import { Tooltip } from "src/components/atoms";
import OverviewIcon from "src/icons/OverviewIcon";
import "./styles.scss";

type TabsProps = {
  isGenericRelayerTx: boolean;
  setShowOverview: (show: boolean) => void;
  setShowOverviewDetail: (show: boolean) => void;
  showOverview: boolean;
  showOverviewDetail: boolean;
};

const Tabs = ({
  isGenericRelayerTx,
  setShowOverview,
  setShowOverviewDetail,
  showOverview,
  showOverviewDetail,
}: TabsProps) => (
  <div className="tx-tabs">
    <button
      className={`tx-tabs-trigger ${showOverview ? "tx-tabs-trigger-active" : ""}`}
      aria-label="Overview"
      onClick={() => setShowOverview(true)}
    >
      OVERVIEW
    </button>
    <button
      className={`tx-tabs-trigger ${!showOverview ? "tx-tabs-trigger-active" : ""}`}
      aria-label="Raw data"
      onClick={() => setShowOverview(false)}
    >
      RAW DATA
    </button>

    {showOverview && !isGenericRelayerTx && (
      <div className="tx-tabs-sub-list">
        <div className="tx-tabs-sub-list-title">Views</div>

        <div className="tx-tabs-sub-list-divider">
          <Tooltip
            tooltip={<div className="tx-tabs-sub-list-divider-tooltip">Overview</div>}
            type="info"
          >
            <button
              className={`tx-tabs-sub-list-divider-button ${
                !showOverviewDetail ? "tx-tabs-sub-list-divider-button-active" : ""
              }`}
              aria-label="Overview"
              onClick={() => setShowOverviewDetail(false)}
            >
              <OverviewIcon height={24} width={24} />
            </button>
          </Tooltip>
        </div>
        <div className="tx-tabs-sub-list-divider">
          <Tooltip
            tooltip={<div className="tx-tabs-sub-list-divider-tooltip">Details</div>}
            type="info"
          >
            <button
              className={`tx-tabs-sub-list-divider-button ${
                showOverviewDetail ? "tx-tabs-sub-list-divider-button-active" : ""
              }`}
              aria-label="Details list"
              onClick={() => setShowOverviewDetail(true)}
            >
              <ListBulletIcon height={24} width={24} />
            </button>
          </Tooltip>
        </div>
      </div>
    )}
  </div>
);

export default Tabs;
