import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavLink } from "src/components/atoms";
import { useLocalStorage } from "src/utils/hooks";
import { CrossIcon, InfoCircleIcon } from "src/icons/generic";
import "./styles.scss";

const TermsOfUseBanner = () => {
  const { t } = useTranslation();

  const [shouldSeeTermsAndCond, setShouldSeeTermsAndCond] = useLocalStorage<boolean>(
    "showTermsAndConds",
    true,
  );

  const [showTermsOfUseBanner, setShowTermsOfUseBanner] = useState(shouldSeeTermsAndCond);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/terms-of-use" || pathname === "/privacy-policy") {
      setShowTermsOfUseBanner(false);
      setShouldSeeTermsAndCond(false);
    }
  }, [pathname, setShouldSeeTermsAndCond]);

  const closeBanner = () => {
    setShowTermsOfUseBanner(false);
    setShouldSeeTermsAndCond(false);
  };

  if (!showTermsOfUseBanner) {
    return null;
  }

  return (
    <div className="terms-banner">
      <InfoCircleIcon />

      <div className="terms-banner-content">
        <p className="terms-banner-content-text">
          {t("termsOfUse.banner.title")}{" "}
          <NavLink className="terms-banner-content-link" to="/terms-of-use">
            {t("termsOfUse.banner.link")}
          </NavLink>
        </p>
      </div>

      <button className="terms-banner-button" type="button" onClick={closeBanner}>
        <CrossIcon />
      </button>
    </div>
  );
};

export default TermsOfUseBanner;
