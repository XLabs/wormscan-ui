import SearchNotFoundImage from "src/assets/search-not-found.svg";
import { DISCORD_URL } from "src/consts";

type Props = {
  q: string;
  timer: number;
  goHome: () => void;
};

const Error400 = ({ q, timer, goHome }: Props) => {
  return (
    <div className="error-page">
      <div className="error-page-container">
        <h2 className="error-page-container-title-400">Search not found</h2>
        <div className="error-page-container-image">
          <img
            className="error-page-container-image-400"
            src={SearchNotFoundImage}
            alt="Error 400"
            loading="lazy"
          />
        </div>
        <div className="error-page-container-body">
          <p className="error-page-container-body-description error-page-container-body-description-400">
            Sorry! We traversed all space-time for you, however, this is likely an invalid search
            string because we can&apos;t find any items that match:{" "}
            <span>
              <strong>{q || "empty string"}</strong>
            </span>
          </p>
          <p className="error-page-container-body-description error-page-container-body-description-400">
            We&apos;ll try again in {timer} seconds.
          </p>
          <p className="error-page-container-body-description error-page-container-body-description-400">
            If you think this is a problem with us,
            <span>
              <a className="info-link" href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                please tell us.
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

export default Error400;
