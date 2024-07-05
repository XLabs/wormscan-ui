import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BaseLayout } from "src/layouts/BaseLayout";
import { ChevronDownIcon } from "src/icons/generic";
import { goToSection } from "../TermsOfUse";
import "../TermsOfUse/styles.scss";

const tableOfContents = [
  { id: "#personal-info-collect", text: "privacyPolicy.header.list.item1" },
  { id: "#minor-personal-info", text: "privacyPolicy.header.list.item2" },
  { id: "#how-use-personal-info", text: "privacyPolicy.header.list.item3" },
  { id: "#general-terms", text: "privacyPolicy.header.list.item4" },
  { id: "#accesing-correcting-updating", text: "privacyPolicy.header.list.item5" },
  { id: "#cookies", text: "privacyPolicy.header.list.item6" },
  { id: "#direct-marketing", text: "privacyPolicy.header.list.item7" },
  { id: "#withdrawing-consent", text: "privacyPolicy.header.list.item8" },
  { id: "#info-security", text: "privacyPolicy.header.list.item9" },
  { id: "#info-eu-data", text: "privacyPolicy.header.list.item10" },
  { id: "#collection-eea", text: "privacyPolicy.header.list.item11" },
  { id: "#ccpa", text: "privacyPolicy.header.list.item12" },
  { id: "#contact-us", text: "privacyPolicy.header.list.item13" },
];

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("");
  const [showContentsMobile, setShowContentsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = "";
      for (const item of tableOfContents) {
        const element = document.querySelector(item.id);
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom > 56) {
          currentSection = item.id;
          break;
        }
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 32) {
        currentSection = tableOfContents[tableOfContents.length - 1].id;
      }

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection]);

  return (
    <BaseLayout>
      <div className="terms-of-use">
        <div className="terms-of-use-content">
          <div className="terms-of-use-content-top">
            <div className="terms-of-use-content-top-header">
              <h1 className="terms-of-use-content-top-header-title">{t("privacyPolicy.title")}</h1>
              <h3 className="terms-of-use-content-top-header-subtitle">
                {t("privacyPolicy.lastRevised")}
              </h3>
            </div>

            <div>
              <p className="terms-of-use-content-top-text">{t("privacyPolicy.header.text1")}</p>
              <p className="terms-of-use-content-top-text">{t("privacyPolicy.header.text2")}</p>
              <p className="terms-of-use-content-top-text">{t("privacyPolicy.header.text3")}</p>
              <div className="terms-of-use-content-top-left-list">
                <ul>
                  <li>{t("privacyPolicy.header.ul.li1")}</li>
                  <li>{t("privacyPolicy.header.ul.li2")}</li>
                </ul>
              </div>
              <p className="terms-of-use-content-top-text">{t("privacyPolicy.header.text4")}</p>
            </div>
          </div>

          <div className="terms-of-use-content-bottom">
            <section>
              <h2 className="terms-of-use-content-bottom-title" id="personal-info-collect">
                {t("privacyPolicy.section1.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section1.text1")}
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">1.</span>
                  <strong>{t("privacyPolicy.section1.point1.text.strong")}</strong>
                  {t("privacyPolicy.section1.point1.text.normal")}
                </p>

                <ul>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point1.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section1.point1.ul.li1.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point1.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section1.point1.ul.li2.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point1.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section1.point1.ul.li3.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point1.ul.li4.strong")}</strong>
                    {t("privacyPolicy.section1.point1.ul.li4.normal")}
                  </li>
                </ul>
              </div>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section1.text2")}
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">2.</span>
                  <strong>{t("privacyPolicy.section1.point2.text.strong")}</strong>
                  {t("privacyPolicy.section1.point2.text.normal")}
                </p>

                <ul>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point2.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section1.point2.ul.li1.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point2.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section1.point2.ul.li2.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point2.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section1.point2.ul.li3.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point2.ul.li4.strong")}</strong>
                    {t("privacyPolicy.section1.point2.ul.li4.normal")}
                  </li>
                </ul>
              </div>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section1.text3")}
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">3.</span>
                  <strong>{t("privacyPolicy.section1.point3.text.strong")}</strong>
                  {t("privacyPolicy.section1.point3.text.normal")}
                </p>

                <ul>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point3.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section1.point3.ul.li1.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point3.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section1.point3.ul.li2.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section1.point3.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section1.point3.ul.li3.normal")}
                  </li>
                </ul>
              </div>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.</span>
                  <strong>{t("privacyPolicy.section1.point4.text.strong")}</strong>
                  {t("privacyPolicy.section1.point4.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="minor-personal-info">
                {t("privacyPolicy.section2.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">{t("privacyPolicy.section2.text")}</p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="how-use-personal-info">
                {t("privacyPolicy.section3.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">{t("privacyPolicy.section3.text")}</p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">1.</span>
                  <strong>{t("privacyPolicy.section3.point1.text.strong")}</strong>
                  {t("privacyPolicy.section3.point1.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">2.</span>
                  <strong>{t("privacyPolicy.section3.point2.text.strong")}</strong>
                  {t("privacyPolicy.section3.point2.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">3.</span>
                  <strong>{t("privacyPolicy.section3.point3.text.strong")}</strong>
                  {t("privacyPolicy.section3.point3.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.</span>
                  <strong>{t("privacyPolicy.section3.point4.text.strong")}</strong>
                  {t("privacyPolicy.section3.point4.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">5.</span>
                  <strong>{t("privacyPolicy.section3.point5.text.strong")}</strong>
                  {t("privacyPolicy.section3.point5.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">6.</span>
                  <strong>{t("privacyPolicy.section3.point6.text.strong")}</strong>
                  {t("privacyPolicy.section3.point6.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">7.</span>
                  <strong>{t("privacyPolicy.section3.point7.text.strong")}</strong>
                  {t("privacyPolicy.section3.point7.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="general-terms">
                {t("privacyPolicy.section4.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section4.text1")}
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">1.</span>
                  <strong>{t("privacyPolicy.section4.point1.text.strong")}</strong>
                  {t("privacyPolicy.section4.point1.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">2.</span>
                  <strong>{t("privacyPolicy.section4.point2.text.strong")}</strong>
                  {t("privacyPolicy.section4.point2.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">3.</span>
                  <strong>{t("privacyPolicy.section4.point3.text.strong")}</strong>
                  {t("privacyPolicy.section4.point3.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.</span>
                  <strong>{t("privacyPolicy.section4.point4.text.strong")}</strong>
                  {t("privacyPolicy.section4.point4.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">5.</span>
                  <strong>{t("privacyPolicy.section4.point5.text.strong")}</strong>
                  {t("privacyPolicy.section4.point5.text.normal")}
                </p>
              </div>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section4.text2")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="accesing-correcting-updating">
                {t("privacyPolicy.section5.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section5.text1")}
              </p>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section5.text2")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="cookies">
                {t("privacyPolicy.section6.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section6.text1")}
              </p>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section6.text2")}
              </p>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section6.text3_1")}
                <a href="http://www.allaboutcookies.org" target="_blank" rel="noreferrer">
                  http://www.allaboutcookies.org
                </a>
                {t("privacyPolicy.section6.text3_2")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="direct-marketing">
                {t("privacyPolicy.section7.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">{t("privacyPolicy.section7.text")}</p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="withdrawing-consent">
                {t("privacyPolicy.section8.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">{t("privacyPolicy.section8.text")}</p>

              <div className="terms-of-use-content-bottom-list">
                <ul>
                  <li className="terms-of-use-content-bottom-text">
                    {t("privacyPolicy.section8.ul.li1")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    {t("privacyPolicy.section8.ul.li2")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    {t("privacyPolicy.section8.ul.li3")}
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="info-security">
                {t("privacyPolicy.section9.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">{t("privacyPolicy.section9.text")}</p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="info-eu-data">
                {t("privacyPolicy.section10.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section10.text1")}
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">1.</span>
                  <strong>{t("privacyPolicy.section10.point1.text.strong")}</strong>
                  {t("privacyPolicy.section10.point1.text.normal")}
                </p>

                <ul>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point1.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section10.point1.ul.li1.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point1.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section10.point1.ul.li2.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point1.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section10.point1.ul.li3.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point1.ul.li4.strong")}</strong>
                    {t("privacyPolicy.section10.point1.ul.li4.normal")}
                  </li>
                </ul>
              </div>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">2.</span>
                  <strong>{t("privacyPolicy.section10.point2.text.strong")}</strong>
                  {t("privacyPolicy.section10.point2.text.normal")}
                </p>

                <ul>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point2.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section10.point2.ul.li1.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point2.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section10.point2.ul.li2.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point2.ul.li3.strong")}</strong>
                    {t("privacyPolicy.section10.point2.ul.li3.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section10.point2.ul.li4.strong")}</strong>
                    {t("privacyPolicy.section10.point2.ul.li4.normal")}
                  </li>
                </ul>
              </div>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section10.text2")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="collection-eea">
                {t("privacyPolicy.section11.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section11.text1")}
              </p>

              <div className="terms-of-use-content-bottom-list">
                <ul>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section11.ul.li1.strong")}</strong>
                    {t("privacyPolicy.section11.ul.li1.normal")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    <strong>{t("privacyPolicy.section11.ul.li2.strong")}</strong>
                    {t("privacyPolicy.section11.ul.li2.normal")}
                  </li>
                </ul>
              </div>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section11.text2")}
              </p>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section11.text3")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="ccpa">
                {t("privacyPolicy.section12.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section12.text")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="contact-us">
                {t("privacyPolicy.section13.title")}
              </h2>

              <p className="terms-of-use-content-bottom-text">
                {t("privacyPolicy.section13.text")}
                <a href="mailto:privacy@xlabs.xyz">privacy@xlabs.xyz</a>
              </p>
            </section>
          </div>
        </div>

        <div className="terms-of-use-aside">
          <div className={`terms-of-use-aside-container ${showContentsMobile ? "show" : ""}`}>
            <h3
              className="terms-of-use-aside-container-title"
              onClick={() => setShowContentsMobile(!showContentsMobile)}
            >
              {t("privacyPolicy.header.list.title")}
              <ChevronDownIcon width={24} />
              <span>:</span>
            </h3>

            <ul>
              {tableOfContents.map(item => (
                <li
                  key={item.id}
                  className={`terms-of-use-aside-container-item ${
                    activeSection === item.id ? "active" : ""
                  }`}
                >
                  <div className="marker" />
                  <p
                    className="text"
                    onClick={() => {
                      goToSection(item.id);
                      setShowContentsMobile(false);
                    }}
                  >
                    {t(item.text)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default PrivacyPolicy;
