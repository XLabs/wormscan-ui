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
import { BREAKPOINTS } from "src/consts";
import { colorStatus } from "src/conts";
import "./styles.scss";

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
  const emitterAddress: string = isEVMChain(emitterChainId)
    ? "0x" + removeLeadingZeros(emitterAddr)
    : emitterAddr;
  const guardianSignaturesCount = guardianSignatures?.length || 0;
  const signatureContainerMaskDegree = Math.abs(
    360 - (360 - guardianSignaturesCount * FRACTION_DEGREE),
  );
  const signatureStyles: CSSProperties & { "--m2": string } = {
    "--m2": `calc(${signatureContainerMaskDegree}deg)`,
  };
  const { id: VAAId, originTx, destinationTx } = globalTxData || {};
  const { chainId: originChainId, timestamp: originTimestamp } = originTx || {};
  const {
    chainId: destinationChainId,
    timestamp: destinationTimestamp,
    from: relayerAddress,
    txHash: rawRedeemTx,
    to: destinationAddress,
  } = destinationTx || {};
  const redeemTx = isEVMChain(destinationChainId as ChainId)
    ? String(rawRedeemTx).startsWith("0x")
      ? rawRedeemTx
      : "0x" + rawRedeemTx
    : rawRedeemTx;
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
            <div>
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
            <div>
              {/* API does not provide this data */}
              {/* <div className="tx-overview-graph-step-title">Source wallet</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">(?)</a>{" "}
              <CopyToClipboard toCopy="(?)">
                <CopyIcon />
              </CopyToClipboard>
            </div> */}
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
                    value: emitterAddress,
                    base: "address",
                  })}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortAddress(emitterAddress)}
                </a>{" "}
                <CopyToClipboard toCopy={emitterAddress}>
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
            {txStatus === "SUCCESSFUL" && (
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
                        value: relayerAddress,
                        base: "address",
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(relayerAddress)}
                    </a>{" "}
                    <CopyToClipboard toCopy={relayerAddress}>
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
                        value: redeemTx,
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(redeemTx)}
                    </a>{" "}
                    <CopyToClipboard toCopy={redeemTx}>
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
                <div>
                  <div className="tx-overview-graph-step-title">Amount</div>
                  <div className="tx-overview-graph-step-description">
                    {amountReceived} {symbol} ({amountReceivedUSD || "-"} USD)
                  </div>
                </div>
                <div>
                  <div className="tx-overview-graph-step-title">Destination wallet</div>
                  <div className="tx-overview-graph-step-description">
                    <a
                      href={getExplorerLink({
                        chainId: destinationChainId,
                        value: destinationAddress,
                        base: "address",
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(destinationAddress)}
                    </a>{" "}
                    <CopyToClipboard toCopy={destinationAddress}>
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
