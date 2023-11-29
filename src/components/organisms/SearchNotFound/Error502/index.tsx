import { useEffect } from "react";
import analytics from "src/analytics";
import Error502Image from "src/assets/error502.svg";

type Props = {
  goHome: () => void;
};

const Error502 = ({ goHome }: Props) => {
  useEffect(() => {
    analytics.page({ title: "ERROR_502" });
  }, []);

  return (
    <div className="error-page">
      <div className="error-page-container">
        <h2 className="error-page-container-title">Bad pathway!</h2>
        <div className="error-page-container-image">
          <h3 className="error-page-container-image-text">
            Error code
            <span>502</span>
          </h3>
          <img
            className="error-page-container-image-502"
            src={Error502Image}
            alt="Error 502"
            loading="lazy"
          />
        </div>
        <div className="error-page-container-body">
          <p className="error-page-container-body-description">
            We couldn&apos;t reach the other side, <span>invalid response.</span>
          </p>
          <button className="error-page-container-body-button" onClick={goHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error502;
