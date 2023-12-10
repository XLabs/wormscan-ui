import { useEffect } from "react";
import analytics from "src/analytics";
import ErrorGeneralImage from "src/assets/errorGeneral.svg";
import { DISCORD_URL } from "src/consts";
import "../styles.scss";

const ErrorGeneral = () => {
  useEffect(() => {
    analytics.page({ title: "ERROR_GENERAL" });
  }, []);

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="error-page error-page-bg-general">
      <div className="error-page-container">
        <h2 className="error-page-container-title">
          <span>Something</span>
          <span>unexpected</span>
          <span>happened</span>
        </h2>
        <div className="error-page-container-image">
          <img
            className="error-page-container-image-general"
            src={ErrorGeneralImage}
            alt="Error 500"
            loading="lazy"
          />
        </div>
        <div className="error-page-container-body">
          <p className="error-page-container-body-description">Please check again later.</p>
          <p className="error-page-container-body-description">
            If the problem persists,{" "}
            <em className="error-page-container-body-description-mobile">please reach</em>
            <span>
              <em className="error-page-container-body-description-desktop">please reach</em> out to
              us on{" "}
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                discord.
              </a>
            </span>
          </p>
          <button className="error-page-container-body-button" onClick={reloadPage}>
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorGeneral;
