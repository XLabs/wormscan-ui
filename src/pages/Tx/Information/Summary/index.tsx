import { ToggleGroup } from "src/components/atoms";
import { ChainId } from "@wormhole-foundation/sdk";
import { IStatus } from "src/consts";
import { GetRedeem } from "./GetRedeem";
import { VerifyRedemption } from "./VerifyRedemption";
import "./styles.scss";

type Props = {
  canTryToGetRedeem: boolean;
  foundRedeem: boolean;
  fromChain: ChainId | number;
  getRedeem: () => Promise<void>;
  isJustPortalUnknown: boolean;
  loadingRedeem: boolean;
  setShowOverview: (view: "overview" | "advanced" | "progress") => void;
  showOverview: string;
  showVerifyRedemption: boolean;
  startDate: Date | string;
  status: IStatus;
  txHash: string;
  vaa: string;
};

const Summary = ({
  canTryToGetRedeem,
  foundRedeem,
  fromChain,
  getRedeem,
  isJustPortalUnknown,
  loadingRedeem,
  setShowOverview,
  showOverview,
  showVerifyRedemption,
  startDate,
  status,
  txHash,
  vaa,
}: Props) => {
  return (
    <div className="tx-information-summary">
      <ToggleGroup
        ariaLabel="Select view"
        items={[
          { label: "Overview", value: "overview", ariaLabel: "overview" },
          { label: "Advanced", value: "advanced", ariaLabel: "advanced" },
          { label: "Progress", value: "progress", ariaLabel: "progress" },
        ]}
        onValueChange={value => setShowOverview(value)}
        value={showOverview}
      />

      <div className="tx-information-summary-info">
        {status !== "completed" && (
          <GetRedeem
            canTryToGetRedeem={canTryToGetRedeem}
            foundRedeem={foundRedeem}
            getRedeem={getRedeem}
            loadingRedeem={loadingRedeem}
          />
        )}

        {/* Resume Transaction button, only after 15 minutes */}
        {showVerifyRedemption &&
          startDate &&
          new Date().getTime() - new Date(startDate).getTime() >= 15 * 60 * 1000 &&
          (foundRedeem === false || (!canTryToGetRedeem && !foundRedeem)) && (
            <VerifyRedemption
              canTryToGetRedeem={canTryToGetRedeem}
              fromChain={fromChain}
              isJustPortalUnknown={isJustPortalUnknown}
              txHash={txHash}
              vaa={vaa}
            />
          )}
      </div>
    </div>
  );
};

export default Summary;
