import { useMemo } from "react";
import { Table, Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import { Column } from "react-table";
import "./styles.scss";
import Overview from "./Overview/index";
import Details from "./Details";

const TXNS_TAB_HEADERS = [
  i18n.t("common.overview").toUpperCase(),
  i18n.t("common.details").toUpperCase(),
  i18n.t("common.rawData").toUpperCase(),
];

interface TransactionOutput {
  txnHash: string;
  type: string;
  status: string;
  from: string;
  to: string;
  amount: number;
  time: string;
}
const Information = () => {
  return (
    <section className="txns-information">
      <Tabs headers={TXNS_TAB_HEADERS} contents={[<Overview />, <Details />, "Raw Data"]} />
    </section>
  );
};

export { Information };
