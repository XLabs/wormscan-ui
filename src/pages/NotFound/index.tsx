import { useNavigate } from "react-router-dom";
import { BaseLayout } from "src/layouts/BaseLayout";
import "./styles.scss";

const NotFound = () => {
  const navigate = useNavigate();

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

export { NotFound };
