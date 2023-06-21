import { CopyIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import WormIcon from "src/icons/wormIcon.svg";
import RelayIcon from "src/icons/relayIcon.svg";
import {
  GetTokenOutput,
  GetTokenPriceOutput,
  GlobalTxOutput,
  VAADetail,
} from "@xlabs-libs/wormscan-sdk";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { removeLeadingZeros } from "../../../../utils/string";
import { TxStatus } from "src/types";
import { shortAddress, formatUnits } from "src/utils/crypto";
import { formatCurrency } from "src/utils/number";
import { CSSProperties } from "react";
import { ChainId, isEVMChain } from "@certusone/wormhole-sdk";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { BREAKPOINTS, colorStatus } from "src/consts";
import "./styles.scss";
import { parseTx, parseAddress } from "../../../../utils/crypto";

// 360 degree / 19 total signatures
// A fraction of 360 degrees (360 / 19) = 18.9 est.
const FRACTION_DEGREE = 18.9;

type Props = {
  VAAData: Omit<VAADetail, "vaa"> & { vaa: any };
  globalTxData: GlobalTxOutput;
  txStatus: TxStatus;
  tokenDataResponse: {
    tokenDataIsLoading: boolean;
    tokenDataError: unknown;
    tokenData: GetTokenOutput;
  };
  tokenPriceResponse: {
    tokenPriceIsLoading: boolean;
    tokenPriceError: unknown;
    tokenPrice: GetTokenPriceOutput;
  };
};

const Overview = ({
  VAAData,
  globalTxData,
  txStatus,
  tokenDataResponse,
  tokenPriceResponse,
}: Props) => {
  const size = useWindowSize();
  const isMobile = size.width < BREAKPOINTS.tablet;
  const { emitterAddr, emitterChainId, payload, vaa } = VAAData || {};
  const { guardianSignatures } = vaa || {};
  const { amount, fee, tokenAddress, tokenChain } = payload || {};
  const parsedEmitterAddress = parseAddress({
    value: emitterAddr,
    chainId: emitterChainId as ChainId,
  });
  const guardianSignaturesCount = guardianSignatures?.length || 0;
  const signatureContainerMaskDegree = Math.abs(
    360 - (360 - guardianSignaturesCount * FRACTION_DEGREE),
  );
  const signatureStyles: CSSProperties & { "--m2": string } = {
    "--m2": `calc(${signatureContainerMaskDegree}deg)`,
  };
  const { id: VAAId, originTx, destinationTx } = globalTxData || {};
  const {
    chainId: originChainId,
    timestamp: originTimestamp,
    from: originAddress,
  } = originTx || {};

  const parsedOriginAddress = parseAddress({
    value: originAddress,
    chainId: originChainId as ChainId,
  });
  const {
    chainId: destinationChainId,
    timestamp: destinationTimestamp,
    from: relayerAddress,
    txHash: redeemTx,
    to: destinationAddress,
  } = destinationTx || {};
  const parsedRelayerAddress = parseAddress({
    value: relayerAddress,
    chainId: destinationChainId as ChainId,
  });
  const parsedRedeemTx = parseTx({ value: redeemTx, chainId: destinationChainId as ChainId });
  const parsedDestinationAddress = parseAddress({
    value: destinationAddress,
    chainId: destinationChainId as ChainId,
  });
  const originDate = new Date(originTimestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const destinationDate = new Date(destinationTimestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const { symbol, decimals } = tokenDataResponse?.tokenData || {};
  const { usd } = tokenPriceResponse?.tokenPrice || {};

  const amountSentParsed = formatUnits(amount, decimals);
  const amountSent = formatCurrency(Number(amountSentParsed));
  const amountSentUSD = usd && formatCurrency(Number(amountSentParsed) * usd);

  const amountReceivedParsed = formatUnits(amount - fee, decimals);
  const amountReceived = formatCurrency(Number(amountReceivedParsed));
  const amountReceivedUSD = usd && formatCurrency(Number(amountReceivedParsed) * usd);

  const originDateParsed = originDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");
  const destinationDateParsed = destinationDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");

  return (
    <div className="tx-overview">
      <div className="tx-overview-graph">
        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">
            <div>SOURCE CHAIN</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              {originChainId && <BlockchainIcon chainId={originChainId} size={32} />}
            </div>
          </div>
          <div className="tx-overview-graph-step-data-container">
            <div>
              <div className="tx-overview-graph-step-title">Sent from</div>
              <div className="tx-overview-graph-step-description">
                {originChainId && getChainName({ chainId: originChainId }).toUpperCase()}
              </div>
            </div>
            <div style={{ order: amount ? 1 : 2 }}>
              {amount && (
                <>
                  <div className="tx-overview-graph-step-title">Amount</div>
                  <div className="tx-overview-graph-step-description">
                    {amountSent}{" "}
                    <a
                      href={getExplorerLink({
                        chainId: tokenChain,
                        value: tokenAddress,
                        base: "token",
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {symbol}
                    </a>
                    ({amountSentUSD || "-"} USD)
                  </div>
                </>
              )}
            </div>
            <div style={{ order: amount ? 2 : 1 }}>
              {parsedOriginAddress && (
                <>
                  <div className="tx-overview-graph-step-title">Source wallet</div>
                  <div className="tx-overview-graph-step-description">
                    <a
                      href={getExplorerLink({
                        chainId: originChainId,
                        value: parsedOriginAddress,
                        base: "address",
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(parsedOriginAddress)}
                    </a>{" "}
                    <CopyToClipboard toCopy={parsedOriginAddress}>
                      <CopyIcon />
                    </CopyToClipboard>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">
            <div>EMITTER CONTRACT</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <img src={WormIcon} alt="" height={32} />
            </div>
          </div>
          <div className="tx-overview-graph-step-data-container">
            <div>
              <div className="tx-overview-graph-step-title">Time</div>
              <div className="tx-overview-graph-step-description">{originDateParsed}</div>
            </div>
            <div>
              <div className="tx-overview-graph-step-title">Contract Address</div>
              <div className="tx-overview-graph-step-description">
                <a
                  href={getExplorerLink({
                    chainId: originChainId,
                    value: parsedEmitterAddress,
                    base: "address",
                    isNativeAddress: true,
                  })}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortAddress(parsedEmitterAddress)}
                </a>{" "}
                <CopyToClipboard toCopy={parsedEmitterAddress}>
                  <CopyIcon />
                </CopyToClipboard>
              </div>
            </div>
            <div></div>
          </div>
        </div>

        <div className={`tx-overview-graph-step ${colorStatus[txStatus]}`}>
          <div className="tx-overview-graph-step-name">
            <div>SIGNED VAA</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-signaturesContainer" style={signatureStyles}>
              <div className="tx-overview-graph-step-signaturesContainer-circle"></div>
              <div className="tx-overview-graph-step-signaturesContainer-text">
                <div className="tx-overview-graph-step-signaturesContainer-text-number">
                  {guardianSignaturesCount}/19
                </div>
                <div className="tx-overview-graph-step-signaturesContainer-text-description">
                  Signatures
                </div>
              </div>
            </div>
          </div>

          <div className="tx-overview-graph-step-data-container signatures">
            <div>
              <div className="tx-overview-graph-step-title">VAA ID</div>
              <div className="tx-overview-graph-step-description">
                {shortAddress(VAAId)}
                <CopyToClipboard toCopy={VAAId}>
                  <CopyIcon />
                </CopyToClipboard>
              </div>
            </div>
            <div></div>
            <div></div>
          </div>
        </div>

        <div className={`tx-overview-graph-step ${colorStatus[txStatus]}`}>
          <div className="tx-overview-graph-step-name">
            <div>RELAYING</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <img src={RelayIcon} alt="" height={32} />
            </div>
          </div>
          <div className="tx-overview-graph-step-data-container">
            {txStatus === "COMPLETED" && (
              <>
                <div>
                  <div className="tx-overview-graph-step-title">Time</div>
                  <div className="tx-overview-graph-step-description">{destinationDateParsed}</div>
                </div>
                <div>
                  <div className="tx-overview-graph-step-title">Contract Address</div>
                  <div className="tx-overview-graph-step-description">
                    <a
                      href={getExplorerLink({
                        chainId: destinationChainId,
                        value: parsedRelayerAddress,
                        base: "address",
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(parsedRelayerAddress)}
                    </a>{" "}
                    <CopyToClipboard toCopy={parsedRelayerAddress}>
                      <CopyIcon />
                    </CopyToClipboard>
                  </div>
                </div>
                <div>
                  <div className="tx-overview-graph-step-title">Redeem Tx</div>
                  <div className="tx-overview-graph-step-description">
                    <a
                      href={getExplorerLink({
                        chainId: destinationChainId,
                        value: parsedRedeemTx,
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(parsedRedeemTx)}
                    </a>{" "}
                    <CopyToClipboard toCopy={parsedRedeemTx}>
                      <CopyIcon />
                    </CopyToClipboard>
                  </div>
                </div>
              </>
            )}
            {txStatus === "ONGOING" && (
              <>
                <div>
                  <div className={`tx-overview-graph-step-description ${colorStatus[txStatus]}`}>
                    Waiting for Relay
                  </div>
                </div>
                <div></div>
                <div></div>
              </>
            )}
            {txStatus === "FAILED" && (
              <>
                <div>
                  <div className={`tx-overview-graph-step-description ${colorStatus[txStatus]}`}>
                    Error
                  </div>
                </div>
                <div></div>
                <div></div>
              </>
            )}
          </div>
        </div>

        {destinationTx && (
          <>
            <div className="tx-overview-graph-step green">
              <div className="tx-overview-graph-step-name">
                <div>{isMobile ? "DEST. CHAIN" : "DESTINATION CHAIN"}</div>
              </div>
              <div className="tx-overview-graph-step-iconWrapper">
                <div className="tx-overview-graph-step-iconContainer">
                  {destinationChainId && <BlockchainIcon chainId={destinationChainId} size={32} />}
                </div>
              </div>
              <div className="tx-overview-graph-step-data-container">
                <div>
                  <div className="tx-overview-graph-step-title">Sent to</div>
                  <div className="tx-overview-graph-step-description">
                    {destinationChainId &&
                      getChainName({ chainId: destinationChainId }).toUpperCase()}
                  </div>
                </div>
                <div style={{ order: amount ? 1 : 2 }}>
                  {amount && (
                    <>
                      <div className="tx-overview-graph-step-title">Amount</div>
                      <div className="tx-overview-graph-step-description">
                        {amountReceived} {symbol} ({amountReceivedUSD || "-"} USD)
                      </div>
                    </>
                  )}
                </div>
                <div style={{ order: amount ? 2 : 1 }}>
                  <div className="tx-overview-graph-step-title">Destination wallet</div>
                  <div className="tx-overview-graph-step-description">
                    <a
                      href={getExplorerLink({
                        chainId: destinationChainId,
                        value: parsedDestinationAddress,
                        base: "address",
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(parsedDestinationAddress)}
                    </a>{" "}
                    <CopyToClipboard toCopy={parsedDestinationAddress}>
                      <CopyIcon />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Overview;
