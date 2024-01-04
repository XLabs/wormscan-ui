import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavLink } from "src/components/atoms";
import "./styles.scss";

const TermsOfUseBanner = () => {
  const { t } = useTranslation();
  const [showTermsOfUseBanner, setShowTermsOfUseBanner] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/terms-of-use") {
      setShowTermsOfUseBanner(false);
    }
  }, [pathname]);

  const closeBanner = () => {
    setShowTermsOfUseBanner(false);
  };

  if (!showTermsOfUseBanner) {
    return null;
  }

  return (
    <div className="terms-banner">
      <div className="terms-banner-content">
        <p className="terms-banner-content-text">
          {t("termsOfUse.title")}{" "}
          <NavLink className="terms-banner-content-link" to="/terms-of-use">
            {t("termsOfUse.link")}
          </NavLink>
        </p>
      </div>

      <button className="terms-banner-button" type="button" onClick={closeBanner}>
        Close
      </button>
    </div>
  );
};

export default TermsOfUseBanner;
