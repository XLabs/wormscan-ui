import { useState } from "react";
import { NavLink } from "src/components/atoms";
import "./styles.scss";

const PolicyPrivacyBanner = () => {
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
          This website is designed to enhance your experience. By continuing to use this site, you
          consent to our{" "}
          <NavLink className="pp-banner-content-link" to="/privacy-policy">
            Privacy Policy
          </NavLink>
        </p>
      </div>

      <button className="pp-banner-button" type="button" onClick={closeBanner}>
        Close
      </button>
    </div>
  );
};

export default PolicyPrivacyBanner;
