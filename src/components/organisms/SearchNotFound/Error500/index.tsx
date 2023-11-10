import AstronautImage from "src/assets/astronaut.svg";
import Error500Image from "src/assets/error500.svg";

type Props = {
  goHome: () => void;
};

const Error500 = ({ goHome }: Props) => {
  return (
    <div className="error-page error-page-bg-500">
      <div className="error-page-container">
        <h2 className="error-page-container-title">
          Houston, <span>we have a problem!</span>
        </h2>
        <div className="error-page-container-image">
          <img
            className="error-page-container-image-500"
            src={Error500Image}
            alt="Error 500"
            loading="lazy"
          />
          <img
            className="error-page-container-image-astronaut"
            src={AstronautImage}
            alt=""
            loading="lazy"
          />
        </div>
        <div className="error-page-container-body">
          <p className="error-page-container-body-description error-page-container-body-description-500">
            While traversing time and space we&apos;ve encountered an issue, we&apos;ll overcome it
            shortly.
          </p>
          <p className="error-page-container-body-code">Error code: 500</p>
          <button className="error-page-container-body-button" onClick={goHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error500;
