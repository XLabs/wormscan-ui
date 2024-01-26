import { CheckCircledIcon, CheckIcon, ClockIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Network } from "@certusone/wormhole-sdk";
import { Chip, Tooltip } from "src/components/atoms";
import { formatAppIds, shortAddress } from "src/utils/crypto";
import { getExplorerLink } from "src/utils/wormhole";
import { ChainId } from "src/api";
import { IStatus } from "src/consts";
import { GetRedeem } from "./GetRedeem";
import { VerifyRedemption } from "./VerifyRedemption";
import "./styles.scss";

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

  fromChain: ChainId;
  isJustPortalUnknown: boolean;
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
  isJustPortalUnknown,
  txHash,
  vaa,
}: Props) => {
  return (
    <div className="tx-information-summary">
      <div>
        <div className="key">Status:</div>
        <div className="value">
          {STATUS === "EXTERNAL_TX" && <StatusExternalTx />}
          {STATUS === "COMPLETED" && <StatusCompleted />}
          {STATUS === "IN_PROGRESS" && <StatusInProgress />}
          {STATUS === "PENDING_REDEEM" && <StatusPendingRedeem />}
          {STATUS === "VAA_EMITTED" && <StatusVaaEmitted />}
        </div>
      </div>
      <div>
        <div className="key">Origin App:</div>
        <div className="value">{appIds?.length > 0 ? formatAppIds(appIds) : "N/A"}</div>
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
                    Address shown corresponds to a Smart Contract handling the transaction. Funds
                    will be sent to your recipient address.
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

      <GetRedeem
        canTryToGetRedeem={canTryToGetRedeem}
        foundRedeem={foundRedeem}
        getRedeem={getRedeem}
        loadingRedeem={loadingRedeem}
      />

      {STATUS === "VAA_EMITTED" &&
        isJustPortalUnknown &&
        (foundRedeem === false || !canTryToGetRedeem) && (
          <VerifyRedemption
            canTryToGetRedeem={canTryToGetRedeem}
            fromChain={fromChain}
            txHash={txHash}
            vaa={vaa}
          />
        )}
    </div>
  );
};

const StatusInProgress = () => (
  <Chip className="status" color="progress">
    <ClockIcon height={16} width={16} />
    IN PROGRESS
  </Chip>
);

const StatusVaaEmitted = () => (
  <Chip className="status" color="emitted">
    <CheckIcon height={16} width={16} />
    VAA EMITTED
  </Chip>
);

const StatusExternalTx = () => (
  <Chip className="status" color="emitted">
    <CheckIcon height={16} width={16} />
    EXTERNAL TX
  </Chip>
);

const StatusPendingRedeem = () => (
  <Tooltip
    side="right"
    tooltip={
      <div className="status-tooltip">
        Your transaction has been completed on the blockchain, but has not yet been redeemed.
      </div>
    }
    type="info"
  >
    <div>
      <Chip className="status" color="progress">
        <ClockIcon height={16} width={16} />
        PENDING REDEEM
      </Chip>
    </div>
  </Tooltip>
);

const StatusCompleted = () => (
  <Chip className="status" color="completed">
    <CheckCircledIcon height={16} width={16} />
    COMPLETED
  </Chip>
);

export default Summary;
