import { CopyIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import WormIcon from "src/icons/wormIcon.svg";
import RelayIcon from "src/icons/relayIcon.svg";
import { GlobalTxOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { getChainName } from "src/utils/wormhole";
import { shortAddress } from "src/utils/string";
import { removeLeadingZeros } from "../../../../utils/string";
import "./styles.scss";

type Props = {
  VAAData: Omit<VAADetail, "vaa"> & { vaa: any };
  globalTxData: GlobalTxOutput;
};

const Overview = ({ VAAData, globalTxData }: Props) => {
  const { emitterAddr, payload, vaa } = VAAData || {};
  const { guardianSignatures } = vaa || {};
  const { amount, fee } = payload || {};
  const emitterAddress: string = "0x" + removeLeadingZeros(emitterAddr);
  const guardianSignaturesCount = guardianSignatures?.length || 0;
  const { id: VAAId, originTx, destinationTx } = globalTxData || {};
  const { chainId: originChainId, timestamp: originTimestamp } = originTx || {};
  const {
    chainId: destinationChainId,
    timestamp: destinationTimestamp,
    from: relayerAddress,
    txHash: redeemTx,
    to: destinationAddress,
  } = destinationTx || {};
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

  return (
    <div className="tx-overview">
      <div className="tx-overview-graph">
        <div className="tx-overview-graph-step">
          <div className="tx-overview-graph-step-name">SOURCE CHAIN</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <BlockchainIcon chainId={originChainId} size={32} />
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Sent from</div>
            <div className="tx-overview-graph-step-description">
              {getChainName({ chainId: originChainId }).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Amount</div>
            <div className="tx-overview-graph-step-description">{amount} SYMBOL ($XX.X USD)</div>
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

        <div className="tx-overview-graph-step">
          <div className="tx-overview-graph-step-name">EMITTER CONTRACT</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <img src={WormIcon} alt="" height={32} />
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Time</div>
            <div className="tx-overview-graph-step-description">{originDate}</div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Contract Address</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">{shortAddress(emitterAddress)}</a>{" "}
              <CopyToClipboard toCopy={emitterAddress}>
                <CopyIcon />
              </CopyToClipboard>
            </div>
          </div>
          <div></div>
        </div>

        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">SIGNED VAA</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-signaturesContainer">
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

        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">RELAYING</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <img src={RelayIcon} alt="" height={32} />
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Time</div>
            <div className="tx-overview-graph-step-description">{destinationDate}</div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Contract Address</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">{shortAddress(relayerAddress)}</a>{" "}
              <CopyToClipboard toCopy={relayerAddress}>
                <CopyIcon />
              </CopyToClipboard>
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Redeem Tx</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">{shortAddress(redeemTx)}</a>{" "}
              <CopyToClipboard toCopy={redeemTx}>
                <CopyIcon />
              </CopyToClipboard>
            </div>
          </div>
        </div>

        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">DESTINATION CHAIN</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <BlockchainIcon chainId={destinationChainId} size={32} />
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Sent to</div>
            <div className="tx-overview-graph-step-description">
              {getChainName({ chainId: destinationChainId }).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Amount</div>
            <div className="tx-overview-graph-step-description">
              {amount - fee} SYMBOL ($XX.X USD)
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Destination wallet</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">{shortAddress(destinationAddress)}</a>{" "}
              <CopyToClipboard toCopy={destinationAddress}>
                <CopyIcon />
              </CopyToClipboard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
