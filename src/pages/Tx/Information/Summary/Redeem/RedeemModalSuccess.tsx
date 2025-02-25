import { CheckCircle2 } from "src/icons/generic";

const RedeemModalSuccess = () => (
  <div className="redeem-modal">
    <div className="redeem-modal-success-icon">
      <CheckCircle2 width={80} />
    </div>

    <div className="redeem-modal-content" style={{ color: "var(--color-white)" }}>
      <div className="redeem-modal-content-title">
        The tokens are now in the destination wallet.
      </div>

      <div className="redeem-modal-content-info">Transaction will be updated shortly.</div>
    </div>
  </div>
);

export default RedeemModalSuccess;
