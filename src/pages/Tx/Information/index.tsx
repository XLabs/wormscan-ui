import { Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import Overview from "./Overview/index";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import "./styles.scss";

const TXNS_TAB_HEADERS = [
  i18n.t("common.overview").toUpperCase(),
  i18n.t("common.rawData").toUpperCase(),
];

const Information = () => {
  return (
    <section className="tx-information">
      <Tabs
        headers={TXNS_TAB_HEADERS}
        contents={[
          <>
            <div className="tx-information-top-info">
              <div>
                <div className="key">Status:</div>
                <div className="value green">
                  SUCCESS <CheckCircledIcon />
                </div>
              </div>
              <div>
                <div className="key">Transaction Time:</div>
                <div className="value">10 MIN</div>
              </div>
              <div>
                <div className="key">Fee:</div>
                <div className="value">1 AVAX</div>
              </div>
            </div>
            <Overview />
          </>,
          "Raw Data",
        ]}
      />
    </section>
  );
};

export { Information };
