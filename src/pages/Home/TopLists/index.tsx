import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TopAssetListItem, TopChainListItem } from "src/components/molecules";
import { TopList } from "src/components/organisms";
import "./styles.scss";

const RANGE_LIST = [
  { label: "30 days", value: "30" },
  { label: "60 days", value: "60" },
  { label: "90 days", value: "90" },
];

const TOP_CHAIN_DATA = [
  {
    from_chain: {
      id: 2,
      name: "Ethereum",
    },
    to_chain: {
      id: 4,
      name: "BNB Smart Chain",
    },
    transactions: 2603,
  },
  {
    from_chain: {
      id: 2,
      name: "Ethereum",
    },
    to_chain: {
      id: 5,
      name: "Polygon",
    },
    transactions: 2603,
  },
  {
    from_chain: {
      id: 1,
      name: "Solana",
    },
    to_chain: {
      id: 2,
      name: "Ethereum",
    },
    transactions: 2603,
  },
  {
    from_chain: {
      id: 5,
      name: "Polygon",
    },
    to_chain: {
      id: 2,
      name: "Ethereum",
    },
    transactions: 2603,
  },
  {
    from_chain: {
      id: 4,
      name: "BNB Smart Chain",
    },
    to_chain: {
      id: 2,
      name: "Ethereum",
    },
    transactions: 2603,
  },
  {
    from_chain: {
      id: 1,
      name: "Solana",
    },
    to_chain: {
      id: 5,
      name: "Polygon",
    },
    transactions: 2603,
  },
  {
    from_chain: {
      id: 5,
      name: "Polygon",
    },
    to_chain: {
      id: 1,
      name: "Solana",
    },
    transactions: 2603,
  },
];

const TOP_ASSET_DATA = [
  {
    from_chain: {
      id: 2,
      name: "Ethereum",
    },
    to_asset: {
      symbol: "wUSDC",
      contract_address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    },
    transactions: 4091183194,
  },
  {
    from_chain: {
      id: 4,
      name: "BNB Smart Chain",
    },
    to_asset: {
      symbol: "wUSDC",
      contract_address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    },
    transactions: 5591183194,
  },
  {
    from_chain: {
      id: 1,
      name: "Solana",
    },
    to_asset: {
      symbol: "wUSDC",
      contract_address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    },
    transactions: 4091183194,
  },
  {
    from_chain: {
      id: 5,
      name: "Polygon",
    },
    to_asset: {
      symbol: "wUSDC",
      contract_address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    },
    transactions: 5591183194,
  },
  {
    from_chain: {
      id: 2,
      name: "Ethereum",
    },
    to_asset: {
      symbol: "wUSDC",
      contract_address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    },
    transactions: 4091183194,
  },
  {
    from_chain: {
      id: 4,
      name: "BNB Smart Chain",
    },
    to_asset: {
      symbol: "wUSDC",
      contract_address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    },
    transactions: 5591183194,
  },
  {
    from_chain: {
      id: 2,
      name: "Ethereum",
    },
    to_asset: {
      symbol: "wUSDC",
      contract_address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    },
    transactions: 4091183194,
  },
];

const TopLists = () => {
  const { t } = useTranslation();

  const [selectedTopChainTimeRange, setSelectedTopChainTimeRange] = useState<string>(
    RANGE_LIST[0].value,
  );
  const [selectedTopAssetTimeRange, setSelectedTopAssetTimeRange] = useState<string>(
    RANGE_LIST[0].value,
  );

  return (
    <section className="home-top-lists">
      <TopList
        title={t("home.topLists.chains.title")}
        subtitle={t("home.topLists.chains.subtitle")}
        filterOptions={{
          items: RANGE_LIST,
          ariaLabel: "Select Time Range",
          className: "home-top-lists-select",
        }}
        value={selectedTopChainTimeRange}
        onValueChange={setSelectedTopChainTimeRange}
      >
        {TOP_CHAIN_DATA?.length > 0 &&
          TOP_CHAIN_DATA.map(({ from_chain, to_chain, transactions }) => {
            const { id: fromId } = from_chain;
            const { id: toId } = to_chain;

            return (
              <TopChainListItem
                key={`${fromId}-${toId}`}
                from_chain={from_chain}
                to_chain={to_chain}
                transactions={transactions}
              />
            );
          })}
      </TopList>

      <TopList
        title={t("home.topLists.assets.title")}
        subtitle={t("home.topLists.assets.subtitle")}
        filterOptions={{
          items: RANGE_LIST,
          ariaLabel: "Select Time Range",
          className: "home-top-lists-select",
        }}
        value={selectedTopAssetTimeRange}
        onValueChange={setSelectedTopAssetTimeRange}
      >
        {TOP_ASSET_DATA?.length > 0 &&
          TOP_ASSET_DATA.map(({ from_chain, to_asset, transactions }) => {
            const { symbol } = to_asset;
            return (
              <TopAssetListItem
                key={symbol}
                from_chain={from_chain}
                to_asset={to_asset}
                transactions={transactions}
              />
            );
          })}
      </TopList>
    </section>
  );
};

export { TopLists };
