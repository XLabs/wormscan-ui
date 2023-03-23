import { Tabs } from "src/components/organisms";
import i18n from "src/i18n";

const TXNS_TAB_HEADERS = [
  i18n.t("common.assets").toUpperCase(),
  i18n.t("common.messages").toUpperCase(),
  i18n.t("common.nfts").toUpperCase(),
];

const Information = () => {
  return (
    <section className="txns-information">
      <Tabs
        headers={TXNS_TAB_HEADERS}
        contents={["Asset Content", "Message Content", "NFT Content"]}
      />
    </section>
  );
};

export { Information };
