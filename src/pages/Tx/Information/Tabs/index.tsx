import { useEffect, useState } from "react";
import { ListBulletIcon } from "@radix-ui/react-icons";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import OverviewIcon from "src/icons/OverviewIcon";
import { Tooltip } from "src/components/atoms";
import { BREAKPOINTS } from "src/consts";
import analytics from "src/analytics";
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
}: TabsProps) => {
  const [openTooltips, setOpenTooltips] = useState([false, false]);
  const { width } = useWindowSize();
  const isMobileOrTablet = width < BREAKPOINTS.desktop;

  useEffect(() => {
    if (!openTooltips.includes(true)) return;

    const timeout = setTimeout(() => {
      setOpenTooltips([false, false]);
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [openTooltips]);

  const openTooltip = (index: number) => {
    const newTooltips = [false, false];
    newTooltips[index] = true;
    setOpenTooltips(newTooltips);
  };

  const [openTooltip1, openTooltip2] = openTooltips;

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
        aria-label="Raw data"
        onClick={() => {
          analytics.track("txView", {
            selected: "raw",
          });
          setShowOverview(false);
        }}
      >
        RAW DATA
      </button>

      {showOverview && (
        <div className="tx-tabs-sub-list">
          <div className="tx-tabs-sub-list-title">Views</div>

          <div
            className="tx-tabs-sub-list-divider"
            onClick={isMobileOrTablet ? () => openTooltip(0) : undefined}
          >
            <Tooltip
              tooltip={<div className="tx-tabs-sub-list-divider-tooltip">Overview</div>}
              type="info"
              open={openTooltip1}
              controlled={isMobileOrTablet}
            >
              <button
                className={`tx-tabs-sub-list-divider-button ${
                  !showOverviewDetail ? "tx-tabs-sub-list-divider-button-active" : ""
                }`}
                aria-label="Overview"
                onClick={() => {
                  analytics.track("overviewView", {
                    selected: "overview",
                  });
                  setShowOverviewDetail(false);
                }}
              >
                <OverviewIcon height={24} width={24} />
              </button>
            </Tooltip>
          </div>
          <div
            className="tx-tabs-sub-list-divider"
            onClick={isMobileOrTablet ? () => openTooltip(1) : undefined}
          >
            <Tooltip
              tooltip={<div className="tx-tabs-sub-list-divider-tooltip">Details</div>}
              type="info"
              open={openTooltip2}
              controlled={isMobileOrTablet}
            >
              <button
                className={`tx-tabs-sub-list-divider-button ${
                  showOverviewDetail ? "tx-tabs-sub-list-divider-button-active" : ""
                }`}
                aria-label="Details list"
                onClick={() => {
                  analytics.track("overviewView", {
                    selected: "details",
                  });
                  setShowOverviewDetail(true);
                }}
              >
                <ListBulletIcon height={24} width={24} />
              </button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tabs;
