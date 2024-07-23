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
  isConnect: boolean;
  isGateway: boolean;
  isJustPortalUnknown: boolean;
  loadingRedeem: boolean;
  setShowOverview: (showOverview: boolean) => void;
  showOverview: boolean;
  STATUS: IStatus;
  txHash: string;
  vaa: string;
};

const Summary = ({
  canTryToGetRedeem,
  foundRedeem,
  fromChain,
  getRedeem,
  isConnect,
  isGateway,
  isJustPortalUnknown,
  loadingRedeem,
  setShowOverview,
  showOverview,
  STATUS,
  txHash,
  vaa,
}: Props) => {
  const showVerifyRedemption =
    STATUS === "VAA_EMITTED" &&
    (isJustPortalUnknown || isConnect || isGateway) &&
    (foundRedeem === false || (!canTryToGetRedeem && !foundRedeem));

  return (
    <div className="tx-information-summary">
      <ToggleGroup
        ariaLabel="Select view"
        items={[
          { label: "Overview", value: "overview", ariaLabel: "overview" },
          { label: "Advanced", value: "advanced", ariaLabel: "advanced" },
        ]}
        onValueChange={() => setShowOverview(!showOverview)}
        value={showOverview ? "overview" : "advanced"}
      />

      <div className="tx-information-summary-info">
        {STATUS !== "COMPLETED" && (
          <GetRedeem
            canTryToGetRedeem={canTryToGetRedeem}
            foundRedeem={foundRedeem}
            getRedeem={getRedeem}
            loadingRedeem={loadingRedeem}
          />
        )}

        {showVerifyRedemption && (
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
