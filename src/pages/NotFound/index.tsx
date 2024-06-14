import { useEffect } from "react";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useNavigateCustom } from "src/utils/hooks";
import analytics from "src/analytics";
import "./styles.scss";

const NotFound = () => {
  useEffect(() => {
    analytics.page({ title: "NOT_FOUND_PAGE" });
  }, []);

  const navigate = useNavigateCustom();

  const goHome = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigate("/");
  };

  return (
    <BaseLayout>
      <div className="not-found-page">
        <div className="not-found-page-container">
          <h1 className="not-found-page-title">Oops!</h1>
          <div className="not-found-page-body">
            <p>
              It seems that this page is lost in the infinite universe, or simply does not exist.
            </p>
            <p>Error code: 404</p>
            <p>We help you come home.</p>
          </div>
          <button className="not-found-page-button" onClick={goHome}>
            Back Home
          </button>
        </div>
      </div>
    </BaseLayout>
  );
};

export default NotFound;
