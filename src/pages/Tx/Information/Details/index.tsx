import { CopyIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import "./styles.scss";

const Details = () => {
  return (
    <div className="tx-details">
      <div className="tx-details-group">
        <div className="tx-details-group-keys">
          <div>Source</div>
          <div>Tx Hash</div>
          <div>From</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        <div className="tx-details-group-values">
          <div className="tx-details-group-values-icon">
            <BlockchainIcon size={25} chainId={6} />
          </div>
          <div className="tx-details-group-values-txHash">
            7754EFD799B47044A907EE98F235C1A95051316AFBC6944AF4DD54292C641169
          </div>
          <div className="tx-details-group-values-address">
            19xlz...1kx8w <CopyIcon />
          </div>
          <div className="tx-details-group-values-amount">123.45 AVA</div>
          <div className="tx-details-group-values-status">
            SUCCESS <CheckCircledIcon />
          </div>
        </div>
      </div>
      <div className="tx-details-group">
        <div className="tx-details-group-keys">
          <div>Destination</div>
          <div>Tx Hash</div>
          <div>To</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        <div className="tx-details-group-values">
          <div className="tx-details-group-values-icon">
            <BlockchainIcon size={25} chainId={4} />
          </div>
          <div className="tx-details-group-values-txHash">
            7754EFD799B47044A907EE98F235C1A95051316AFBC6944AF4DD54292C641169
          </div>
          <div className="tx-details-group-values-address">
            2kx8w...19xlz <CopyIcon />
          </div>
          <div className="tx-details-group-values-amount">123.45 BUSD</div>
          <div className="tx-details-group-values-status">
            SUCCESS <CheckCircledIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
