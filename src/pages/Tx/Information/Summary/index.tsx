import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Tooltip } from "src/components/atoms";
import { formatAppIds, shortAddress } from "src/utils/crypto";
import { getExplorerLink } from "src/utils/wormhole";
import { ChainId } from "@wormhole-foundation/sdk";
import { IStatus } from "src/consts";
import { GetRedeem } from "./GetRedeem";
import { VerifyRedemption } from "./VerifyRedemption";
import { StatusBadge } from "src/components/molecules";
import "./styles.scss";
import { Network } from "@wormhole-foundation/sdk";

type Props = {
  appIds: string[];
  currentNetwork: Network;
  isUnknownApp: boolean;
  parsedDestinationAddress: string;
  STATUS: IStatus;
  toChain: ChainId;

  canTryToGetRedeem: boolean;
  foundRedeem: boolean;
  getRedeem: () => Promise<void>;
  loadingRedeem: boolean;

  fromChain: ChainId | number;
  isAttestation: boolean;
  isJustPortalUnknown: boolean;
  isConnect: boolean;
  isGateway: boolean;
  txHash: string;
  vaa: string;
};

const Summary = ({
  appIds,
  currentNetwork,
  isUnknownApp,
  parsedDestinationAddress,
  STATUS,
  toChain,

  canTryToGetRedeem,
  foundRedeem,
  getRedeem,
  loadingRedeem,

  fromChain,
  isAttestation,
  isJustPortalUnknown,
  isConnect,
  isGateway,
  txHash,
  vaa,
}: Props) => {
  const showVerifyRedemption =
    STATUS === "VAA_EMITTED" &&
    (isJustPortalUnknown || isConnect || isGateway) &&
    (foundRedeem === false || (!canTryToGetRedeem && !foundRedeem));

  return (
    <div className="tx-information-summary">
      <div className="tx-information-summary-status">
        <div className="key">Status:</div>
        <div className="value">
          <StatusBadge STATUS={STATUS} />
        </div>
      </div>

      <div className="tx-information-summary-info">
        {!isAttestation && (
          <>
            <div>
              <div className="key">Origin App:</div>
              <div className="value value-origin-app">
                {appIds?.length > 0 ? formatAppIds(appIds) : "N/A"}
              </div>
            </div>

            <div>
              <div className="key">Destination Address:</div>
              <div className="value">
                {parsedDestinationAddress ? (
                  <Tooltip
                    maxWidth={false}
                    tooltip={<div>{parsedDestinationAddress.toUpperCase()}</div>}
                    type="info"
                  >
                    <a
                      href={getExplorerLink({
                        network: currentNetwork,
                        chainId: toChain,
                        value: parsedDestinationAddress,
                        base: "address",
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortAddress(parsedDestinationAddress).toUpperCase()}
                    </a>
                  </Tooltip>
                ) : (
                  "N/A"
                )}
                {isUnknownApp && (
                  <div className="value-tooltip">
                    <Tooltip
                      tooltip={
                        <div>
                          Address shown corresponds to a Smart Contract handling the transaction.
                          Funds will be sent to your recipient address.
                        </div>
                      }
                      type="info"
                    >
                      <InfoCircledIcon />
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

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
