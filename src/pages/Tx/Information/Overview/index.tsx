import { ExternalLinkIcon, CopyIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import WalletIcon from "src/icons/walletIcon.svg";
import "./styles.scss";

type Props = {};

const Overview = (props: Props) => {
  return (
    <div className="tx-overview ">
      <div className="tx-overview-graph">
        <div className="tx-overview-graph-step">
          <div>Sent from</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <div className="tx-overview-graph-step-iconContainer-icon">
                <img src={WalletIcon} alt="" height={17} />
              </div>
            </div>
          </div>
          <div className="tx-overview-graph-step-information">
            <div className="tx-overview-graph-step-information-title">Source wallet</div>
            <div className="tx-overview-graph-step-information-address">
              0x9262...46b3 <CopyIcon />
            </div>
          </div>
        </div>

        <div className="tx-overview-graph-step start">
          <div>&nbsp;</div>
          <div className="tx-overview-graph-step-iconWrapper content-down">
            <div className="tx-overview-graph-step-iconContainer content-down">
              <div className="tx-overview-graph-step-iconContainer-icon">
                <BlockchainIcon size={25} chainId={6} />
              </div>
            </div>
          </div>
          <div className="tx-overview-graph-step-information large">
            <div className="tx-overview-graph-step-information-title">Source chain</div>
            <div className="tx-overview-graph-step-information-amount">0.01 AVA ($XX.X USD)</div>
            <div className="tx-overview-graph-step-information-address">
              0x9262...46b3 <CopyIcon />
            </div>
            <div className="tx-overview-graph-step-information-link">
              <a href="">
                Show in Avalanche <ExternalLinkIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="tx-overview-graph-step ">
          <div>Emitter Contract</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer ">
              <div className="tx-overview-graph-step-iconContainer-icon">W</div>
            </div>
          </div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
        </div>

        <div className="tx-overview-graph-step end">
          <div>&nbsp;</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-signaturesContainer">
              <div className="tx-overview-graph-step-signaturesContainer-circle"></div>
              <div className="tx-overview-graph-step-signaturesContainer-text">
                <div>Signatures</div>
                <div>12/19</div>
              </div>
            </div>
          </div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
        </div>

        <div className="tx-overview-graph-step blue end">
          <div>&nbsp;</div>
          <div className="tx-overview-graph-step-iconWrapper content-down">
            <div className="tx-overview-graph-step-iconContainer content-down">
              <div className="tx-overview-graph-step-iconContainer-icon">
                <BlockchainIcon size={25} chainId={4} />
              </div>
            </div>
          </div>
          <div className="tx-overview-graph-step-information end large">
            <div className="tx-overview-graph-step-information-title">Destination chain</div>
            <div className="tx-overview-graph-step-information-amount">0.02 BUSD ($XX.X USD)</div>
            <div className="tx-overview-graph-step-information-address">
              0x9262...46b3 <CopyIcon />
            </div>
            <div className="tx-overview-graph-step-information-link">
              <a href="" className="end">
                Show in Binance Smart Chain <ExternalLinkIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="tx-overview-graph-step blue">
          <div>Sent to</div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <div className="tx-overview-graph-step-iconContainer-icon">
                <img src={WalletIcon} alt="" height={17} />
              </div>
            </div>
          </div>
          <div className="tx-overview-graph-step-information end">
            <div className="tx-overview-graph-step-information-title">Destination wallet</div>
            <div className="tx-overview-graph-step-information-address">
              0x9262...46b3 <CopyIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
