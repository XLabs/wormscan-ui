import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BaseLayout } from "src/layouts/BaseLayout";
import { ChevronDownIcon } from "src/icons/generic";
import { NavLink } from "src/components/atoms";
import "./styles.scss";

const tableOfContents = [
  { id: "#acceptance-of-agreement", text: "termsOfUse.page.header.list.item1" },
  { id: "#amendments", text: "termsOfUse.page.header.list.item2" },
  { id: "#definitions-and-other", text: "termsOfUse.page.header.list.item3" },
  { id: "#the-service", text: "termsOfUse.page.header.list.item4" },
  { id: "#privacy", text: "termsOfUse.page.header.list.item5" },
  { id: "#communication-with-users", text: "termsOfUse.page.header.list.item6" },
  { id: "#third-party-links", text: "termsOfUse.page.header.list.item7" },
  { id: "#intellectual-property", text: "termsOfUse.page.header.list.item8" },
  { id: "#indemnification", text: "termsOfUse.page.header.list.item9" },
  { id: "#assumptions-of-risk", text: "termsOfUse.page.header.list.item10" },
  { id: "#limitation-of-liability", text: "termsOfUse.page.header.list.item11" },
  { id: "#term-and-termination", text: "termsOfUse.page.header.list.item12" },
  { id: "#general-terms", text: "termsOfUse.page.header.list.item13" },
];

export const goToSection = (dataTarget: string) => {
  scrollBy({
    top: document.querySelector(dataTarget)?.getBoundingClientRect().top - 64,
    behavior: "smooth",
  });
};

const TermsOfUse = () => {
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
        {showContentsMobile && (
          <div className="terms-of-use-bg" onClick={() => setShowContentsMobile(false)} />
        )}

        <div className="terms-of-use-content">
          <div className="terms-of-use-content-top">
            <div className="terms-of-use-content-top-header">
              <h1 className="terms-of-use-content-top-header-title">
                {t("termsOfUse.page.title")}
              </h1>
              <h3 className="terms-of-use-content-top-header-subtitle">
                {t("termsOfUse.page.lastRevised")}
              </h3>
            </div>

            <div>
              <p className="terms-of-use-content-top-text">{t("termsOfUse.page.header.text1")}</p>
              <p className="terms-of-use-content-top-text">{t("termsOfUse.page.header.text2")}</p>
            </div>
          </div>

          <div className="terms-of-use-content-bottom">
            <section>
              <h2 className="terms-of-use-content-bottom-title" id="acceptance-of-agreement">
                {t("termsOfUse.page.section1.title")}
              </h2>
              <p className="terms-of-use-content-bottom-text">
                {t("termsOfUse.page.section1.text1")}
              </p>
              <p className="terms-of-use-content-bottom-text">
                {t("termsOfUse.page.section1.text2")}
              </p>
              <p className="terms-of-use-content-bottom-text">
                <strong>{t("termsOfUse.page.section1.text3.strong")}</strong>
                {t("termsOfUse.page.section1.text3.normal")}
              </p>
              <p className="terms-of-use-content-bottom-text">
                {t("termsOfUse.page.section1.text4")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="amendments">
                {t("termsOfUse.page.section2.title")}
              </h2>
              <p className="terms-of-use-content-bottom-text">
                {t("termsOfUse.page.section2.text")}
                <a href="mailto:legal@xlabs.xyz">legal@xlabs.xyz.</a>
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="definitions-and-other">
                {t("termsOfUse.page.section3.title")}
              </h2>
              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">3.1.</span>
                  <strong>{t("termsOfUse.page.section3.point1.text.strong")}</strong>
                  {t("termsOfUse.page.section3.point1.text.normal")}
                </p>
                <ul>
                  <li className="terms-of-use-content-bottom-text">
                    {t("termsOfUse.page.section3.point1.ul.li1")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    {t("termsOfUse.page.section3.point1.ul.li2")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    {t("termsOfUse.page.section3.point1.ul.li3")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    {t("termsOfUse.page.section3.point1.ul.li4")}
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    {t("termsOfUse.page.section3.point1.ul.li5")}
                  </li>
                </ul>
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">3.2.</span>
                  <strong>{t("termsOfUse.page.section3.point2.text.strong")}</strong>
                  {t("termsOfUse.page.section3.point2.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="the-service">
                {t("termsOfUse.page.section4.title")}
              </h2>
              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.1.</span>
                  <strong>{t("termsOfUse.page.section4.point1.text.strong")}</strong>
                  {t("termsOfUse.page.section4.point1.text.normal")}
                  <NavLink to={"/privacy-policy"}>
                    {t("termsOfUse.page.section4.point1.text.link")}
                  </NavLink>
                </p>
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.2.</span>
                  <strong>{t("termsOfUse.page.section4.point2.text.strong")}</strong>
                  {t("termsOfUse.page.section4.point2.text.normal")}
                </p>

                <div className="terms-of-use-content-bottom-list">
                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">4.2.1.</span>
                    {t("termsOfUse.page.section4.point2.point1.text")}
                  </p>

                  <div className="terms-of-use-content-bottom-list">
                    <p className="terms-of-use-content-bottom-text">
                      <span className="terms-of-use-content-bottom-text-number">4.2.1.1.</span>
                      <em>{t("termsOfUse.page.section4.point2.point1.point1.text.italic")}</em>
                      {t("termsOfUse.page.section4.point2.point1.point1.text.normal")}
                    </p>

                    <p className="terms-of-use-content-bottom-text">
                      <span className="terms-of-use-content-bottom-text-number">4.2.1.2.</span>
                      <em>{t("termsOfUse.page.section4.point2.point1.point2.text.italic")}</em>
                      {t("termsOfUse.page.section4.point2.point1.point2.text.normal")}
                    </p>
                  </div>
                </div>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.3.</span>
                  <strong>{t("termsOfUse.page.section4.point3.text.strong")}</strong>
                  {t("termsOfUse.page.section4.point3.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.4.</span>
                  <strong>{t("termsOfUse.page.section4.point4.text")}</strong>
                </p>

                <div className="terms-of-use-content-bottom-list">
                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">4.4.1.</span>
                    {t("termsOfUse.page.section4.point4.point1.text")}
                  </p>

                  <ul>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li1")}
                    </li>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li2")}
                    </li>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li3")}
                    </li>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li4")}
                    </li>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li5")}
                    </li>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li6")}
                    </li>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li7")}
                    </li>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li8")}
                    </li>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li9")}
                    </li>
                    <li className="terms-of-use-content-bottom-text">
                      {t("termsOfUse.page.section4.point4.point1.ul.li10")}
                    </li>
                  </ul>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">4.4.2.</span>
                    {t("termsOfUse.page.section4.point4.point2.text")}
                  </p>
                </div>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.5.</span>
                  <strong>{t("termsOfUse.page.section4.point5.text.strong")}</strong>
                  {t("termsOfUse.page.section4.point5.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.6.</span>
                  <strong>{t("termsOfUse.page.section4.point6.text.strong")}</strong>
                  {t("termsOfUse.page.section4.point6.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.7.</span>
                  <strong>{t("termsOfUse.page.section4.point7.text.strong")}</strong>
                  {t("termsOfUse.page.section4.point7.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.8.</span>
                  <strong>{t("termsOfUse.page.section4.point8.text.strong")}</strong>
                  {t("termsOfUse.page.section4.point8.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="privacy">
                {t("termsOfUse.page.section5.title")}
              </h2>
              <p className="terms-of-use-content-bottom-text">
                {t("termsOfUse.page.section5.text1_1")}
                <NavLink to={"/privacy-policy"}>https://wormholescan.io/#/privacy-policy</NavLink>
                {t("termsOfUse.page.section5.text1_2")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="communication-with-users">
                {t("termsOfUse.page.section6.title")}
              </h2>
              <p className="terms-of-use-content-bottom-text">
                {t("termsOfUse.page.section6.text")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="third-party-links">
                {t("termsOfUse.page.section7.title")}
              </h2>
              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">7.1.</span>
                  <strong>{t("termsOfUse.page.section7.point1.text.strong")}</strong>
                  {t("termsOfUse.page.section7.point1.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">7.2.</span>
                  <strong>{t("termsOfUse.page.section7.point2.text.strong")}</strong>
                  {t("termsOfUse.page.section7.point2.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">7.3.</span>
                  <strong>{t("termsOfUse.page.section7.point3.text.strong")}</strong>
                  {t("termsOfUse.page.section7.point3.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="intellectual-property">
                {t("termsOfUse.page.section8.title")}
              </h2>
              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">8.1.</span>
                  <strong>{t("termsOfUse.page.section8.point1.text1.strong")}</strong>
                  {t("termsOfUse.page.section8.point1.text1.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  {t("termsOfUse.page.section8.point1.text2")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <strong>{t("termsOfUse.page.section8.point1.text3.strong")}</strong>
                  {t("termsOfUse.page.section8.point1.text3.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">8.2.</span>
                  <strong>{t("termsOfUse.page.section8.point2.text")}</strong>
                </p>

                <div className="terms-of-use-content-bottom-list">
                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">8.2.1.</span>
                    <strong>{t("termsOfUse.page.section8.point2.point1.text.strong")}</strong>
                    {t("termsOfUse.page.section8.point2.point1.text.normal")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">8.2.2.</span>
                    <strong>{t("termsOfUse.page.section8.point2.point2.text.strong")}</strong>
                    {t("termsOfUse.page.section8.point2.point2.text.normal")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">8.2.3.</span>
                    <strong>{t("termsOfUse.page.section8.point2.point3.text.strong")}</strong>
                    {t("termsOfUse.page.section8.point2.point3.text.normal")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">8.2.4.</span>
                    <strong>{t("termsOfUse.page.section8.point2.point4.text.strong")}</strong>
                    {t("termsOfUse.page.section8.point2.point4.text.normal")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">8.2.5.</span>
                    <strong>{t("termsOfUse.page.section8.point2.point5.text.strong")}</strong>
                    {t("termsOfUse.page.section8.point2.point5.text.normal")}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="indemnification">
                {t("termsOfUse.page.section9.title")}
              </h2>
              <p className="terms-of-use-content-bottom-text">
                {t("termsOfUse.page.section9.text")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="assumptions-of-risk">
                {t("termsOfUse.page.section10.title")}
              </h2>
              <div className="terms-of-use-content-bottom-list terms-of-use-content-bottom-list-big-number">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">10.1.</span>
                  <strong>{t("termsOfUse.page.section10.point1.text.strong")}</strong>
                  {t("termsOfUse.page.section10.point1.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">10.2.</span>
                  <strong>{t("termsOfUse.page.section10.point2.text.strong")}</strong>
                  {t("termsOfUse.page.section10.point2.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">10.3.</span>
                  <strong>{t("termsOfUse.page.section10.point3.text.strong")}</strong>
                  {t("termsOfUse.page.section10.point3.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">10.4.</span>
                  <strong>{t("termsOfUse.page.section10.point4.text.strong")}</strong>
                  {t("termsOfUse.page.section10.point4.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">10.5.</span>
                  <strong>{t("termsOfUse.page.section10.point5.text.strong")}</strong>
                  {t("termsOfUse.page.section10.point5.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="limitation-of-liability">
                {t("termsOfUse.page.section11.title")}
              </h2>
              <div className="terms-of-use-content-bottom-list terms-of-use-content-bottom-list-big-number">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">11.1.</span>
                  <strong>{t("termsOfUse.page.section11.point1.text1.strong")}</strong>
                  {t("termsOfUse.page.section11.point1.text1.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  {t("termsOfUse.page.section11.point1.text2")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">11.2.</span>
                  <strong>{t("termsOfUse.page.section11.point2.text.strong")}</strong>
                  {t("termsOfUse.page.section11.point2.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="term-and-termination">
                {t("termsOfUse.page.section12.title")}
              </h2>
              <p className="terms-of-use-content-bottom-text">
                {t("termsOfUse.page.section12.text")}
              </p>
            </section>

            <section>
              <h2 className="terms-of-use-content-bottom-title" id="general-terms">
                {t("termsOfUse.page.section13.title")}
              </h2>
              <div className="terms-of-use-content-bottom-list terms-of-use-content-bottom-list-big-number">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.1.</span>
                  <strong>{t("termsOfUse.page.section13.point1.text.strong")}</strong>
                  {t("termsOfUse.page.section13.point1.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.2.</span>
                  <strong>{t("termsOfUse.page.section13.point2.text.strong")}</strong>
                  {t("termsOfUse.page.section13.point2.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.3.</span>
                  <strong>{t("termsOfUse.page.section13.point3.text.strong")}</strong>
                  {t("termsOfUse.page.section13.point3.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.</span>
                  <strong>{t("termsOfUse.page.section13.point4.text.strong")}</strong>
                  {t("termsOfUse.page.section13.point4.text.normal")}
                </p>

                <div className="terms-of-use-content-bottom-list">
                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.1.</span>
                    {t("termsOfUse.page.section13.point4.point1.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.2.</span>
                    {t("termsOfUse.page.section13.point4.point2.text1")}{" "}
                    <a href="mailto:legal@xlabs.xyz">legal@xlabs.xyz.</a>
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    {t("termsOfUse.page.section13.point4.point2.text2")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.3.</span>
                    {t("termsOfUse.page.section13.point4.point3.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.4.</span>
                    {t("termsOfUse.page.section13.point4.point4.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.5.</span>
                    {t("termsOfUse.page.section13.point4.point5.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.6.</span>
                    {t("termsOfUse.page.section13.point4.point6.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.7.</span>
                    {t("termsOfUse.page.section13.point4.point7.text")}{" "}
                    <a href="mailto:legal@xlabs.xyz">legal@xlabs.xyz.</a>
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.8.</span>
                    {t("termsOfUse.page.section13.point4.point8.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.9.</span>
                    {t("termsOfUse.page.section13.point4.point9.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.10.</span>
                    {t("termsOfUse.page.section13.point4.point10.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.11.</span>
                    {t("termsOfUse.page.section13.point4.point11.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.12.</span>
                    {t("termsOfUse.page.section13.point4.point12.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.13.</span>
                    {t("termsOfUse.page.section13.point4.point13.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.4.14.</span>
                    {t("termsOfUse.page.section13.point4.point14.text")}
                  </p>
                </div>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.5.</span>
                  <strong>{t("termsOfUse.page.section13.point5.text.strong")}</strong>
                  {t("termsOfUse.page.section13.point5.text.normal")}
                </p>

                <div className="terms-of-use-content-bottom-list">
                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.5.1.</span>
                    {t("termsOfUse.page.section13.point5.point1.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.5.2.</span>
                    {t("termsOfUse.page.section13.point5.point2.text")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">13.5.3.</span>
                    {t("termsOfUse.page.section13.point5.point3.text1")}
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    {t("termsOfUse.page.section13.point5.point3.text2")}
                  </p>
                </div>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.6.</span>
                  <strong>{t("termsOfUse.page.section13.point6.text.strong")}</strong>
                  {t("termsOfUse.page.section13.point6.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.7.</span>
                  <strong>{t("termsOfUse.page.section13.point7.text.strong")}</strong>
                  {t("termsOfUse.page.section13.point7.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.8.</span>
                  <strong>{t("termsOfUse.page.section13.point8.text.strong")}</strong>
                  {t("termsOfUse.page.section13.point8.text.normal")}
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.9.</span>
                  <strong>{t("termsOfUse.page.section13.point9.text.strong")}</strong>
                  {t("termsOfUse.page.section13.point9.text.normal")}
                </p>
              </div>
            </section>

            <section>
              <p className="terms-of-use-content-bottom-text">
                <strong>{t("termsOfUse.page.section14.text.strong")}</strong>
                {t("termsOfUse.page.section14.text.normal")}
                <a href="mailto:legal@xlabs.xyz">legal@xlabs.xyz.</a>
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
              {t("termsOfUse.page.header.list.title")}
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
                  onClick={() => {
                    goToSection(item.id);
                    setShowContentsMobile(false);
                  }}
                >
                  <div className="marker" />
                  <p className="text">{t(item.text)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default TermsOfUse;
