import { BaseLayout } from "src/layouts/BaseLayout";
import { BlockchainIcon, CommunityBanner, NavLink, ToggleGroup } from "src/components/atoms";
import { StaticsIncreaseIcon } from "src/icons/generic";
import { chainToChainId } from "@wormhole-foundation/sdk";
import "./styles.scss";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Table } from "src/components/organisms";
import { Column } from "react-table";

const columnsProposals: Column[] | any = [
  {
    Header: "DESCRIPTION",
    accessor: "description",
  },
  {
    Header: "POSITIVE",
    accessor: "positive",
  },
  {
    Header: "NEGATIVE",
    accessor: "negative",
  },
  {
    Header: "TOTAL VOTES",
    accessor: "totalVotes",
  },
];

const Multigov = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get("view") || "all");

  return (
    <BaseLayout>
      <section className="multigov">
        <div className="multigov-header">
          <div className="multigov-header-left">
            <div className="multigov-header-left-title">
              <StaticsIncreaseIcon width={24} />
              MultiGov
            </div>

            <div className="multigov-header-left-supported">
              Supported on:
              <BlockchainIcon
                background="var(--color-white-10)"
                colorless
                chainId={chainToChainId("Arbitrum")}
                network="Mainnet"
              />
              <BlockchainIcon
                background="var(--color-white-10)"
                colorless
                chainId={chainToChainId("Solana")}
                network="Mainnet"
              />
              <BlockchainIcon
                background="var(--color-white-10)"
                colorless
                chainId={chainToChainId("Optimism")}
                network="Mainnet"
              />
              <BlockchainIcon
                background="var(--color-white-10)"
                colorless
                chainId={chainToChainId("Ethereum")}
                network="Mainnet"
              />
              <BlockchainIcon
                background="var(--color-white-10)"
                colorless
                chainId={chainToChainId("Base")}
                network="Mainnet"
              />
              <NavLink className="multigov-link" to="/analytics/ntt/wormhole/W">
                W Dashboard
              </NavLink>
            </div>
          </div>

          <div className="multigov-header-right">
            <div>
              The Wormhole DAO is the first to adopt MultiGov, enabling W holders to create, vote
              on, and execute governance proposals on any supported chain.
              <a
                href="https://www.tally.xyz/gov/Wormhole"
                target="_blank"
                rel="noreferrer"
                className="multigov-link"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>

        <div className="multigov-title">
          <StaticsIncreaseIcon width={24} />
          <h2 className="multigov-title-text">Most recent published proposals</h2>
        </div>

        <ToggleGroup
          ariaLabel="Select Proposal status"
          items={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Passed", value: "passed" },
            { label: "Executed", value: "executed" },
            { label: "Quorum not met", value: "quorumNotMet" },
            { label: "Failed", value: "failed" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          onValueChange={value => {
            setActiveView(value);
            setSearchParams(prev => {
              prev.set("view", value);
              return prev;
            });
          }}
          value={activeView}
        />

        <Table
          className="multigov-table"
          columns={columnsProposals}
          data={[]}
          emptyMessage={<>No proposals found</>}
          isLoading={false}
          numberOfColumns={4}
          numberOfRows={7}
          onRowClick={data => {
            console.log(data);
          }}
        />

        <br />
        <br />
        <br />

        <CommunityBanner />
      </section>
    </BaseLayout>
  );
};

export default Multigov;
