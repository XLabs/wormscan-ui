import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "src/components/atoms";
import "./styles.scss";

const PrivacyPolicyBanner = () => {
  const { t } = useTranslation();
  const [showPolicyPrivacyBanner, setShowPolicyPrivacyBanner] = useState(true);

  const closeBanner = () => {
    setShowPolicyPrivacyBanner(false);
  };

  if (!showPolicyPrivacyBanner) {
    return null;
  }

  return (
    <div className="pp-banner">
      <div className="pp-banner-content">
        <p className="pp-banner-content-text">
          {t("privacyPolicy.title")} {t("privacyPolicy.link")}
          {/* TODO: Uncomment this when the privacy policy page is ready
            <NavLink className="pp-banner-content-link" to="/privacy-policy">
              {t("privacyPolicy.link")}
            </NavLink> 
          */}
        </p>
      </div>

      <button className="pp-banner-button" type="button" onClick={closeBanner}>
        Close
      </button>
    </div>
  );
};

export default PrivacyPolicyBanner;
