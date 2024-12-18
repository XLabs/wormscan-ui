import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CheckIcon, CrossIcon, Cube3DIcon } from "src/icons/generic";
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
    }, 5000);
  }, [foundRedeem]);

  useEffect(() => {
    if (showCross) {
      toast("Executed Transaction Not Found", {
        type: "error",
        theme: "dark",
        style: {
          background: "var(--color-gray-950)",
          color: "var(--color-white-70)",
        },
        autoClose: 4300,
      });
    }
  }, [showCross]);

  if (!shouldShow) return null;

  return (
    <div
      className={`getRedeem ${showCross || showCheck ? "dissapearing" : ""} ${
        showCross ? "cross" : ""
      }`}
      onClick={() => !loadingRedeem && !(showCross || showCheck) && getRedeem()}
      style={{
        cursor: showCross || showCheck ? "default" : "pointer",
      }}
    >
      <div className={`getRedeem-button ${loadingRedeem ? "loading" : ""}`}>
        <div
          className="getRedeem-button-icon"
          style={{
            opacity: showCheck ? 100 : 0,
          }}
        >
          <CheckIcon />
        </div>

        <div
          className="getRedeem-button-icon"
          style={{
            opacity: showCross ? 100 : 0,
          }}
        >
          <CrossIcon />
        </div>

        <div
          className="getRedeem-button-icon"
          style={{
            opacity: !showCross && !showCheck ? 100 : 0,
            transition: "none",
          }}
        >
          <Cube3DIcon width={24} />
        </div>
      </div>
      <div className="getRedeem-find-txt">Search Execution Tx</div>
    </div>
  );
};
