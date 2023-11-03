import { CheckCircledIcon, CheckIcon, ClockIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Network } from "@certusone/wormhole-sdk";
import { Chip, Tooltip } from "src/components/atoms";
import { formatAppIds, shortAddress } from "src/utils/crypto";
import { getExplorerLink } from "src/utils/wormhole";
import { ChainId } from "src/api";
import "./styles.scss";

type Props = {
  appIds: string[];
  currentNetwork: Network;
  globalToRedeemTx: string | undefined;
  hasAnotherApp: boolean;
  isCCTP: boolean;
  isConnect: boolean;
  isPortal: boolean;
  isTBTC: boolean;
  isTransferWithPayload: boolean;
  isUnknownApp: boolean;
  parsedDestinationAddress: string;
  toChain: ChainId | number;
  vaa: string;
};

const Summary = ({
  appIds,
  currentNetwork,
  globalToRedeemTx,
  hasAnotherApp,
  isCCTP,
  isConnect,
  isPortal,
  isTBTC,
  isTransferWithPayload,
  isUnknownApp,
  parsedDestinationAddress,
  toChain,
  vaa,
}: Props) => {
  // if toChain is on this list we should be able to get destinationTx.
  // (contract-watcher for token bridge & connect txs)
  const canWeGetDestinationTx = [
    ChainId.Aptos,
    ChainId.Avalanche,
    ChainId.Base,
    ChainId.BSC,
    ChainId.Celo,
    ChainId.Ethereum,
    ChainId.Fantom,
    ChainId.Moonbeam,
    ChainId.Oasis,
    ChainId.Polygon,
    ChainId.Terra,
    // ChainId.Arbitrum // should be supported, but BE having problems
    // ChainId.Optimism // should be supported, but BE having problems
    // ChainId.Solana,  // should be supported, but BE having problems
  ].includes(toChain);

  return (
    <div className="tx-information-summary">
      <div>
        <div className="key">Status:</div>
        <div className="value">
          {vaa ? (
            isConnect || isPortal || isCCTP ? (
              globalToRedeemTx ? (
                <StatusCompleted />
              ) : (canWeGetDestinationTx &&
                  !hasAnotherApp &&
                  (!isTransferWithPayload ||
                    (isTransferWithPayload && isConnect) ||
                    (isTransferWithPayload && isTBTC))) ||
                isCCTP ? (
                <StatusPendingRedeem />
              ) : (
                <StatusVaaEmitted />
              )
            ) : (
              <StatusVaaEmitted />
            )
          ) : (
            <StatusInProgress />
          )}
        </div>
      </div>
      <div>
        <div className="key">Origin App:</div>
        <div className="value">{appIds?.length > 0 ? formatAppIds(appIds) : "N/A"}</div>
      </div>
      <div>
        <div className="key">Destination Wallet:</div>
        <div className="value">
          {parsedDestinationAddress ? (
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
        PENDING TO REDEEM
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
