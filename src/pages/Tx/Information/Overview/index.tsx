import { CopyIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import WalletIcon from "src/icons/walletIcon.svg";
import WormIcon from "src/icons/WormIcon.svg";
import RelayIcon from "src/icons/RelayIcon.svg";
import "./styles.scss";

type Props = {};

const Overview = (props: Props) => {
  return (
    <div className="tx-overview">
      <div className="tx-overview-graph">
        <div className="tx-overview-graph-step">
          <div className="tx-overview-graph-step-name">SOURCE CHAIN</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <BlockchainIcon chainId={6} size={32} />
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Sent from</div>
            <div className="tx-overview-graph-step-description">AVALANCHE</div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Amount</div>
            <div className="tx-overview-graph-step-description">100 AVAX ($XX.X USD)</div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Source wallet</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">0x9262...46b3</a>{" "}
              <CopyToClipboard toCopy="0x9262...46b3">
                <CopyIcon />
              </CopyToClipboard>
            </div>
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
            <div className="tx-overview-graph-step-description">Jan 22, 2022 at 14:20</div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Contract Address</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">0x9262...46b3</a>{" "}
              <CopyToClipboard toCopy="0x9262...46b3">
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
                <div className="tx-overview-graph-step-signaturesContainer-text-number">12/19</div>
                <div className="tx-overview-graph-step-signaturesContainer-text-description">
                  Signatures
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="tx-overview-graph-step-title">VAA ID</div>
            <div className="tx-overview-graph-step-description">
              5/0000...0003{" "}
              <CopyToClipboard toCopy="5/0000...0003">
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
            <div className="tx-overview-graph-step-description">Jan 22, 2022 at 14:30</div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Contract Address</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">0x9262...46b3</a>{" "}
              <CopyToClipboard toCopy="0x9262...46b3">
                <CopyIcon />
              </CopyToClipboard>
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Redeem Tx</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">0x9262...46b3</a>{" "}
              <CopyToClipboard toCopy="0x9262...46b3">
                <CopyIcon />
              </CopyToClipboard>
            </div>
          </div>
        </div>

        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">DESTINATION CHAIN</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <BlockchainIcon chainId={4} size={32} />
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Sent to</div>
            <div className="tx-overview-graph-step-description">BINANCE SMART CHAIN</div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Amount</div>
            <div className="tx-overview-graph-step-description">98 AVAX ($XX.X USD)</div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Source wallet</div>
            <div className="tx-overview-graph-step-description">
              <a href="#">0x9262...46b3</a>{" "}
              <CopyToClipboard toCopy="0x9262...46b3">
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
