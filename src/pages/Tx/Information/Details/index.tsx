import { CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { ChainId, Network } from "@certusone/wormhole-sdk";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import { shortAddress } from "src/utils/crypto";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import "./styles.scss";

type Props = {
  amountSent?: string;
  amountSentUSD?: string;
  currentNetwork?: Network;
  destinationDateParsed?: string;
  fee?: string;
  fromChain?: ChainId | number;
  guardianSignaturesCount?: number;
  isUnknownApp?: boolean;
  originDateParsed?: string;
  parsedDestinationAddress?: string;
  parsedEmitterAddress?: string;
  parsedOriginAddress?: string;
  parsedRedeemTx?: string;
  redeemedAmount?: string;
  redeemedAmountUSD?: string;
  symbol?: string;
  toChain?: ChainId | number;
  tokenAddress?: string;
  tokenAmount?: string;
  tokenChain?: ChainId | number;
  totalGuardiansNeeded?: number;
  VAAId?: string;
};

const RenderChildrenOrNA = ({
  condition,
  children,
}: {
  condition: boolean | string | number | undefined;
  children: React.ReactNode;
}) => {
  if (!condition) return <>N/A</>;
  return children;
};

const Details = ({
  amountSent,
  amountSentUSD,
  currentNetwork,
  destinationDateParsed,
  fee,
  fromChain,
  guardianSignaturesCount,
  isUnknownApp,
  parsedDestinationAddress,
  parsedEmitterAddress,
  parsedOriginAddress,
  parsedRedeemTx,
  redeemedAmount,
  symbol,
  toChain,
  tokenAddress,
  tokenAmount,
  tokenChain,
  totalGuardiansNeeded,
  VAAId,
}: Props) => (
  <div className="tx-details">
    <div className="tx-details-group">
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">Source</div>
        <div className="tx-details-group-line-value">
          <RenderChildrenOrNA condition={fromChain}>
            <BlockchainIcon chainId={fromChain} size={24} />
            {getChainName({ chainId: fromChain }).toUpperCase()}
          </RenderChildrenOrNA>
        </div>
      </div>
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">Contract Address</div>
        <div className="tx-details-group-line-value">
          <RenderChildrenOrNA condition={parsedEmitterAddress}>
            <a
              href={getExplorerLink({
                network: currentNetwork,
                chainId: fromChain,
                value: parsedEmitterAddress,
                base: "address",
                isNativeAddress: true,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortAddress(parsedEmitterAddress).toUpperCase()}
            </a>{" "}
            <CopyToClipboard toCopy={parsedEmitterAddress}>
              <CopyIcon />
            </CopyToClipboard>
          </RenderChildrenOrNA>
        </div>
      </div>
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">From</div>
        <div className="tx-details-group-line-value">
          <RenderChildrenOrNA condition={parsedOriginAddress}>
            <a
              href={getExplorerLink({
                network: currentNetwork,
                chainId: fromChain,
                value: parsedOriginAddress,
                base: "address",
                isNativeAddress: true,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortAddress(parsedOriginAddress).toUpperCase()}
            </a>{" "}
            <CopyToClipboard toCopy={parsedOriginAddress}>
              <CopyIcon />
            </CopyToClipboard>
          </RenderChildrenOrNA>
        </div>
      </div>
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">Amount</div>
        <div className="tx-details-group-line-value">
          <RenderChildrenOrNA condition={tokenAmount}>
            {amountSent}{" "}
            {symbol && (
              <a
                href={getExplorerLink({
                  network: currentNetwork,
                  chainId: tokenChain,
                  value: tokenAddress,
                  base: "token",
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {symbol}
              </a>
            )}
            ({amountSentUSD || "-"} USD)
          </RenderChildrenOrNA>
        </div>
      </div>
    </div>
    <div className="tx-details-group">
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">Time</div>
        <div className="tx-details-group-line-value">
          <RenderChildrenOrNA condition={destinationDateParsed}>
            {destinationDateParsed}
          </RenderChildrenOrNA>
        </div>
      </div>
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">Signatures</div>
        <div className="tx-details-group-line-value">
          {guardianSignaturesCount} / {totalGuardiansNeeded}
        </div>
      </div>
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">VAA ID</div>
        <div className="tx-details-group-line-value">
          <RenderChildrenOrNA condition={VAAId}>
            {shortAddress(VAAId)}
            <CopyToClipboard toCopy={VAAId}>
              <CopyIcon />
            </CopyToClipboard>
          </RenderChildrenOrNA>
        </div>
      </div>
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">Redeem Txn</div>
        <div className="tx-details-group-line-value">
          <RenderChildrenOrNA condition={parsedRedeemTx}>
            <a
              href={getExplorerLink({
                network: currentNetwork,
                chainId: toChain,
                value: parsedRedeemTx,
                isNativeAddress: true,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortAddress(parsedRedeemTx.toUpperCase())}
            </a>{" "}
            <CopyToClipboard toCopy={parsedRedeemTx}>
              <CopyIcon />
            </CopyToClipboard>
          </RenderChildrenOrNA>
        </div>
      </div>
    </div>
    <div className="tx-details-group">
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">Destination</div>
        <div className="tx-details-group-line-value">
          <RenderChildrenOrNA condition={toChain}>
            <BlockchainIcon chainId={toChain} size={24} />
            {getChainName({ chainId: toChain }).toUpperCase()}
          </RenderChildrenOrNA>
        </div>
      </div>
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">To</div>
        <div className="tx-details-group-line-value">
          <RenderChildrenOrNA condition={parsedDestinationAddress}>
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
            </a>{" "}
            <CopyToClipboard toCopy={parsedDestinationAddress}>
              <CopyIcon />
            </CopyToClipboard>
          </RenderChildrenOrNA>
          {isUnknownApp && (
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
          )}
        </div>
      </div>
      <div className="tx-details-group-line">
        <div className="tx-details-group-line-key">Redeemed Amount</div>
        <div className="tx-details-group-line-value">
          {Number(fee) ? (
            <>
              {redeemedAmount}{" "}
              {symbol && (
                <a
                  href={getExplorerLink({
                    network: currentNetwork,
                    chainId: tokenChain,
                    value: tokenAddress,
                    base: "token",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {symbol}
                </a>
              )}
            </>
          ) : (
            <RenderChildrenOrNA condition={tokenAmount}>
              {amountSent}{" "}
              {symbol && (
                <a
                  href={getExplorerLink({
                    network: currentNetwork,
                    chainId: tokenChain,
                    value: tokenAddress,
                    base: "token",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {symbol}
                </a>
              )}
              ({amountSentUSD || "-"} USD)
            </RenderChildrenOrNA>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default Details;
