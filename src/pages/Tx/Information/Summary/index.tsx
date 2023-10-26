import { CheckCircledIcon, ClockIcon, InfoCircledIcon } from "@radix-ui/react-icons";
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
  isCCTPConnectOrPortalApp: boolean;
  isUnknownApp: boolean;
  parsedDestinationAddress: string;
  toChain: ChainId | number;
  vaa: string;
};

const StatusCompleted = () => (
  <Chip className="status" color="completed">
    <CheckCircledIcon height={16} width={16} />
    COMPLETED
  </Chip>
);

const StatusWaitingRedeem = () => (
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
      <Chip className="status" color="waiting">
        WAITING TO REDEEM
      </Chip>
    </div>
  </Tooltip>
);

const StatusInProgress = () => (
  <Chip className="status" color="progress">
    <ClockIcon height={16} width={16} />
    IN PROGRESS
  </Chip>
);

const Summary = ({
  appIds,
  currentNetwork,
  globalToRedeemTx,
  isCCTPConnectOrPortalApp,
  isUnknownApp,
  parsedDestinationAddress,
  toChain,
  vaa,
}: Props) => (
  <div className="tx-information-summary">
    <div>
      <div className="key">Status:</div>
      <div className="value">
        {vaa ? (
          isCCTPConnectOrPortalApp && !isUnknownApp ? (
            globalToRedeemTx ? (
              <StatusCompleted />
            ) : (
              <StatusWaitingRedeem />
            )
          ) : (
            <StatusCompleted />
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
                  Address shown corresponds to a Smart Contract handling the transaction. Funds will
                  be sent to your recipient address.
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

export default Summary;
