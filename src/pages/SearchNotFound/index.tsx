import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BaseLayout } from "src/layouts/BaseLayout";
import SearchNotFoundImage from "src/assets/search-not-found.svg";
import { DISCORD_URL } from "src/consts";
import "./styles.scss";

const SearchNotFound = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");
  const navigate = useNavigate();

  const goHome = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigate("/");
  };

  return (
    <BaseLayout>
      <div className="search-not-found-page">
        <div className="search-not-found-page-container">
          <div className="search-not-found-page-content">
            <h1 className="search-not-found-page-title">Search not found</h1>
            <div className="search-not-found-page-image-mobile">
              <img src={SearchNotFoundImage} alt="" />
            </div>
            <div className="search-not-found-page-body">
              <p>
                Sorry! We traversed all space-time for you, however, this is likely an invalid
                search string because we can&apos;t find any items that match:{" "}
              </p>
              <div className="search-not-found-page-body-id">
                <strong>{q || "empty string"}</strong>
              </div>
            </div>
            <div className="search-not-found-page-support">
              <p>If you think this is a problem with us, </p>
              <div>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                  please tell us.
                </a>
              </div>
            </div>
            <div>
              <button className="search-not-found-page-button" onClick={goHome}>
                Back Home
              </button>
            </div>
          </div>

          <div className="search-not-found-page-image-desktop">
            <img src={SearchNotFoundImage} alt="" />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export { SearchNotFound };
