import { useTranslation } from "react-i18next";
import { BaseLayout } from "src/layouts/BaseLayout";
import "./styles.scss";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const handleClick = (dataTarget: string) => {
    scrollBy({
      top: document.querySelector(dataTarget)?.getBoundingClientRect().top - 16,
      behavior: "smooth",
    });
  };

  return (
    <BaseLayout>
      <div className="privacy-policy">
        <div className="privacy-policy-content">
          <div className="privacy-policy-content-top">
            <div className="privacy-policy-content-top-header">
              <h1 className="privacy-policy-content-top-header-title">
                {t("privacyPolicy.title")}
              </h1>
              <h3 className="privacy-policy-content-top-header-subtitle">
                {t("privacyPolicy.lastRevised")}
              </h3>
            </div>

            <div>
              <p className="privacy-policy-content-top-text">{t("privacyPolicy.header.text1")}</p>
              <p className="privacy-policy-content-top-text">{t("privacyPolicy.header.text2")}</p>
              <p className="privacy-policy-content-top-text">{t("privacyPolicy.header.text3")}</p>
              <div className="privacy-policy-content-top-left-list">
                <ul>
                  <li>{t("privacyPolicy.header.ul.li1")}</li>
                  <li>{t("privacyPolicy.header.ul.li2")}</li>
                </ul>
              </div>
              <p className="privacy-policy-content-top-text">{t("privacyPolicy.header.text4")}</p>
            </div>

            <div className="privacy-policy-content-top-list">
              <h3 className="privacy-policy-content-top-list-title">
                {t("privacyPolicy.header.list.title")}
              </h3>

              <ul>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#personal-info-collect")}>
                    {t("privacyPolicy.header.list.item1")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#minor-personal-info")}>
                    {t("privacyPolicy.header.list.item2")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#how-use-personal-info")}>
                    {t("privacyPolicy.header.list.item3")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#general-terms")}>
                    {t("privacyPolicy.header.list.item4")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#accesing-correcting-updating")}>
                    {t("privacyPolicy.header.list.item5")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#cookies")}>
                    {t("privacyPolicy.header.list.item6")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#direct-marketing")}>
                    {t("privacyPolicy.header.list.item7")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#withdrawing-consent")}>
                    {t("privacyPolicy.header.list.item8")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#info-security")}>
                    {t("privacyPolicy.header.list.item9")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#info-eu-data")}>
                    {t("privacyPolicy.header.list.item10")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#collection-eea")}>
                    {t("privacyPolicy.header.list.item11")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#ccpa")}>
                    {t("privacyPolicy.header.list.item12")}
                  </p>
                </li>
                <li className="privacy-policy-content-top-list-item">
                  <p onClick={() => handleClick("#contact-us")}>
                    {t("privacyPolicy.header.list.item13")}
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div className="privacy-policy-content-bottom">
            <section>
              <h2 className="privacy-policy-content-bottom-title" id="personal-info-collect">
                {t("privacyPolicy.section1.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section1.text1")}
              </p>

              <div className="privacy-policy-content-bottom-list">
                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">1.</span>
                  <strong>{t("privacyPolicy.section1.point1.text.strong")}</strong>
                  {t("privacyPolicy.section1.point1.text.normal")}
                </p>

                <ul>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point1.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section1.point1.ul.li1.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point1.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section1.point1.ul.li2.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point1.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section1.point1.ul.li3.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point1.ul.li4.strong")}</strong>
                    {t("privacyPolicy.section1.point1.ul.li4.normal")}
                  </li>
                </ul>
              </div>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section1.text2")}
              </p>

              <div className="privacy-policy-content-bottom-list">
                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">2.</span>
                  <strong>{t("privacyPolicy.section1.point2.text.strong")}</strong>
                  {t("privacyPolicy.section1.point2.text.normal")}
                </p>

                <ul>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point2.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section1.point2.ul.li1.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point2.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section1.point2.ul.li2.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point2.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section1.point2.ul.li3.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point2.ul.li4.strong")}</strong>
                    {t("privacyPolicy.section1.point2.ul.li4.normal")}
                  </li>
                </ul>
              </div>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section1.text3")}
              </p>

              <div className="privacy-policy-content-bottom-list">
                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">3.</span>
                  <strong>{t("privacyPolicy.section1.point3.text.strong")}</strong>
                  {t("privacyPolicy.section1.point3.text.normal")}
                </p>

                <ul>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point3.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section1.point3.ul.li1.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point3.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section1.point3.ul.li2.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point3.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section1.point3.ul.li3.normal")}
                  </li>
                </ul>
              </div>

              <div className="privacy-policy-content-bottom-list">
                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">4.</span>
                  <strong>{t("privacyPolicy.section1.point4.text.strong")}</strong>
                  {t("privacyPolicy.section1.point4.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="minor-personal-info">
                {t("privacyPolicy.section2.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section2.text")}
              </p>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="how-use-personal-info">
                {t("privacyPolicy.section3.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section3.text")}
              </p>

              <div className="privacy-policy-content-bottom-list">
                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">1.</span>
                  <strong>{t("privacyPolicy.section3.point1.text.strong")}</strong>
                  {t("privacyPolicy.section3.point1.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">2.</span>
                  <strong>{t("privacyPolicy.section3.point2.text.strong")}</strong>
                  {t("privacyPolicy.section3.point2.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">3.</span>
                  <strong>{t("privacyPolicy.section3.point3.text.strong")}</strong>
                  {t("privacyPolicy.section3.point3.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">4.</span>
                  <strong>{t("privacyPolicy.section3.point4.text.strong")}</strong>
                  {t("privacyPolicy.section3.point4.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">5.</span>
                  <strong>{t("privacyPolicy.section3.point5.text.strong")}</strong>
                  {t("privacyPolicy.section3.point5.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">6.</span>
                  <strong>{t("privacyPolicy.section3.point6.text.strong")}</strong>
                  {t("privacyPolicy.section3.point6.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">7.</span>
                  <strong>{t("privacyPolicy.section3.point7.text.strong")}</strong>
                  {t("privacyPolicy.section3.point7.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="general-terms">
                {t("privacyPolicy.section4.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section4.text1")}
              </p>

              <div className="privacy-policy-content-bottom-list">
                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">1.</span>
                  <strong>{t("privacyPolicy.section4.point1.text.strong")}</strong>
                  {t("privacyPolicy.section4.point1.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">2.</span>
                  <strong>{t("privacyPolicy.section4.point2.text.strong")}</strong>
                  {t("privacyPolicy.section4.point2.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">3.</span>
                  <strong>{t("privacyPolicy.section4.point3.text.strong")}</strong>
                  {t("privacyPolicy.section4.point3.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">4.</span>
                  <strong>{t("privacyPolicy.section4.point4.text.strong")}</strong>
                  {t("privacyPolicy.section4.point4.text.normal")}
                </p>

                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">5.</span>
                  <strong>{t("privacyPolicy.section4.point5.text.strong")}</strong>
                  {t("privacyPolicy.section4.point5.text.normal")}
                </p>
              </div>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section4.text2")}
              </p>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="accesing-correcting-updating">
                {t("privacyPolicy.section5.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section5.text1")}
              </p>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section5.text2")}
              </p>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="cookies">
                {t("privacyPolicy.section6.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section6.text1")}
              </p>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section6.text2")}
              </p>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section6.text3_1")}
                <a href="http://www.allaboutcookies.org" target="_blank" rel="noreferrer">
                  http://www.allaboutcookies.org
                </a>
                {t("privacyPolicy.section6.text3_2")}
              </p>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="direct-marketing">
                {t("privacyPolicy.section7.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section7.text")}
              </p>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="withdrawing-consent">
                {t("privacyPolicy.section8.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section8.text")}
              </p>

              <ul>
                <li className="privacy-policy-content-bottom-text">
                  {t("privacyPolicy.section8.ul.li1")}
                </li>
                <li className="privacy-policy-content-bottom-text">
                  {t("privacyPolicy.section8.ul.li2")}
                </li>
                <li className="privacy-policy-content-bottom-text">
                  {t("privacyPolicy.section8.ul.li3")}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="info-security">
                {t("privacyPolicy.section9.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section9.text")}
              </p>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="info-eu-data">
                {t("privacyPolicy.section10.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section10.text1")}
              </p>

              <div className="privacy-policy-content-bottom-list">
                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">1.</span>
                  <strong>{t("privacyPolicy.section10.point1.text.strong")}</strong>
                  {t("privacyPolicy.section10.point1.text.normal")}
                </p>

                <ul>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point1.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section10.point1.ul.li1.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point1.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section10.point1.ul.li2.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point1.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section10.point1.ul.li3.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point1.ul.li4.strong")}</strong>
                    {t("privacyPolicy.section10.point1.ul.li4.normal")}
                  </li>
                </ul>
              </div>

              <div className="privacy-policy-content-bottom-list">
                <p className="privacy-policy-content-bottom-text">
                  <span className="privacy-policy-content-bottom-text-number">2.</span>
                  <strong>{t("privacyPolicy.section10.point2.text.strong")}</strong>
                  {t("privacyPolicy.section10.point2.text.normal")}
                </p>

                <ul>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point2.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section10.point2.ul.li1.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point2.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section10.point2.ul.li2.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point2.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section10.point2.ul.li3.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point2.ul.li4.strong")}</strong>
                    {t("privacyPolicy.section10.point2.ul.li4.normal")}
                  </li>
                </ul>
              </div>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section10.text2")}
              </p>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="collection-eea">
                {t("privacyPolicy.section11.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section11.text1")}
              </p>

              <div className="privacy-policy-content-bottom-list">
                <ul>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section11.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section11.ul.li1.normal")}
                  </li>
                  <li className="privacy-policy-content-bottom-text">
                    <strong>{t("privacyPolicy.section11.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section11.ul.li2.normal")}
                  </li>
                </ul>
              </div>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section11.text2")}
              </p>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section11.text3")}
              </p>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="ccpa">
                {t("privacyPolicy.section12.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section12.text")}
              </p>
            </section>

            <section>
              <h2 className="privacy-policy-content-bottom-title" id="contact-us">
                {t("privacyPolicy.section13.title")}
              </h2>

              <p className="privacy-policy-content-bottom-text">
                {t("privacyPolicy.section13.text")}
                <a href="mailto:privacy@xlabs.xyz">privacy@xlabs.xyz</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default PrivacyPolicy;
