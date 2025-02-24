import { AlertTriangle } from "src/icons/generic";

const RedeemModalError = ({ error }: { error: string }) => (
  <div className="redeem-modal">
    <div className="redeem-modal-error-icon">
      <AlertTriangle width={80} />
    </div>

    <div className="redeem-modal-content">
      <div className="redeem-modal-content-title">Transaction failed.</div>

      <div className="redeem-modal-content-info">{error}</div>
    </div>
  </div>
);

export default RedeemModalError;
