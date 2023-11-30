import { useEffect } from "react";
import analytics from "src/analytics";
import Error503Image from "src/assets/error503.svg";
import { DISCORD_URL } from "src/consts";

type Props = {
  goHome: () => void;
};

const Error503 = ({ goHome }: Props) => {
  useEffect(() => {
    analytics.page({ title: "ERROR_503" });
  }, []);

  return (
    <div className="error-page error-page-bg-503">
      <div className="error-page-container">
        <h2 className="error-page-container-title">Systems down!</h2>
        <div className="error-page-container-image">
          <h3 className="error-page-container-image-text">
            Error code
            <span>503</span>
          </h3>
          <img
            className="error-page-container-image-500"
            src={Error503Image}
            alt="Error 503"
            loading="lazy"
          />
        </div>
        <div className="error-page-container-body">
          <p className="error-page-container-body-description">
            The universe may be infinite but our capabilities aren&apos;t, unfortunately.
            <span>
              We are currently experiencing service <span>unavailability.</span>
            </span>
          </p>
          <p className="error-page-container-body-description">
            If the problem persists, please reach
            <span>
              out to us on{" "}
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                discord.
              </a>
            </span>
          </p>
          <button className="error-page-container-body-button" onClick={goHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error503;
