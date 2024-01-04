import { CheckIcon, Cross2Icon, TargetIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Loader, Tooltip } from "src/components/atoms";
import "./styles.scss";

interface Props {
  canTryToGetRedeem: boolean;
  foundRedeem: boolean;
  loadingRedeem: boolean;
  getRedeem: () => void;
}

export const GetRedeem = ({ canTryToGetRedeem, foundRedeem, loadingRedeem, getRedeem }: Props) => {
  const [shouldShow, setShouldShow] = useState(canTryToGetRedeem);
  const [showCheck, setShowCheck] = useState(false);
  const [showCross, setShowCross] = useState(false);

  useEffect(() => {
    if (foundRedeem === null) return;

    if (foundRedeem) {
      setShowCheck(true);
    } else {
      setShowCross(true);
    }

    setTimeout(() => {
      setShouldShow(false);
    }, 2000);
  }, [foundRedeem]);

  const showTooltip = !loadingRedeem && !showCheck && !showCross;

  return (
    <>
      {shouldShow && (
        <Tooltip
          controlled={!showTooltip}
          open={showTooltip}
          tooltip={<div>Try to find the redeem transaction</div>}
          type="info"
        >
          <div
            style={{
              backgroundColor: showCheck ? "#01bbac26" : showCross ? "#f5202026" : "#ffffff19",
            }}
            onClick={() => !loadingRedeem && getRedeem()}
            className={`getRedeem-button ${loadingRedeem ? "loading" : ""}`}
          >
            <div
              className="getRedeem-button-icon"
              style={{
                opacity: showCheck ? 100 : 0,
              }}
            >
              <CheckIcon width={22} height={22} />
            </div>

            <div
              className="getRedeem-button-icon"
              style={{
                opacity: showCross ? 100 : 0,
              }}
            >
              <Cross2Icon width={22} height={22} />
            </div>

            <div
              className="getRedeem-button-icon"
              style={{
                opacity: !showCross && !showCheck ? 100 : 0,
              }}
            >
              <TargetIcon width={22} height={22} />
            </div>
          </div>
        </Tooltip>
      )}
    </>
  );
};
