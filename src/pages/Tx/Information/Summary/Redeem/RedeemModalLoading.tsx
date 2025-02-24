import { Loader } from "src/components/atoms";

const RedeemModalLoading = ({
  shouldShowDisclaimer = false,
}: {
  shouldShowDisclaimer: boolean;
}) => (
  <div className="redeem-modal">
    <Loader />

    {shouldShowDisclaimer && (
      <div className="redeem-modal-content">
        <div className="redeem-modal-content-title">
          <p>Transaction in progress, please do not clone or refresh this modal.</p>
          <p>This will only take a moment.</p>
        </div>
      </div>
    )}
  </div>
);

export default RedeemModalLoading;
