import { useState } from "react";
import { chainToChainId } from "@wormhole-foundation/sdk";
import { useSearchParams } from "react-router-dom";
import { Column } from "react-table";
import { useQuery } from "react-query";
import { BaseLayout } from "src/layouts/BaseLayout";
import { BlockchainIcon, CommunityBanner, NavLink, ToggleGroup } from "src/components/atoms";
import {
  ClockIcon,
  NewTabIcon,
  StaticsIncreaseIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "src/icons/generic";
import { Table } from "src/components/organisms";
import { getMultigovProposals } from "src/utils/cryptoToolkit";
import { formatNumber } from "src/utils/number";
import { formatDate } from "src/utils/date";
import "./styles.scss";

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

const statusMap: any = {
  defeated: "Failed",
  executed: "Executed",
  pendingexecution: "Active",
  succeeded: "Passed",
};

const Multigov = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get("view") || "all");

  const {
    isLoading,
    isError,
    data: proposalsResponse,
  } = useQuery("proposals", () => getMultigovProposals(), {});

  const proposals = proposalsResponse?.data?.proposals;

  const filterProposals = (proposals: any[]) => {
    if (activeView === "all") return proposals;

    const statusMapping = {
      active: "pendingexecution",
      passed: "succeeded",
      executed: "executed",
      failed: "defeated",
      cancelled: "cancelled",
      quorumNotMet: "defeated", // Assuming quorum not met maps to defeated
    };

    const targetStatus = statusMapping[activeView as keyof typeof statusMapping];
    return proposals.filter(proposal => proposal.status === targetStatus);
  };

  const parsedProposals =
    proposals &&
    filterProposals(proposals.nodes).map(proposal => {
      const voteStats = proposal.voteStats?.reduce((acc: any, curr: any) => {
        acc[curr.type] = Number(BigInt(curr.votesCount) / BigInt(10 ** 18));
        return acc;
      }, {});

      const proposalName = proposal.metadata?.description?.split("\n")[0].replace(/^# /, "");
      const positiveVotes = voteStats?.for + voteStats?.pendingfor;
      const negativeVotes = voteStats?.against + voteStats?.pendingagainst;

      const status = statusMap[proposal.status];

      return {
        description: (
          <div className="multigov-proposal-description">
            <a
              href={`https://staging.tally.xyz/gov/multigov/proposal/${proposal.onchainId}`}
              className="multigov-proposal-description-name"
              target="_blank"
              rel="noreferrer"
            >
              {proposalName}
            </a>
            <div className="multigov-proposal-description-middle">
              <div>
                <span className="multigov-proposal-description-key">DATE: </span>
                <span className="multigov-proposal-description-value">
                  {formatDate(proposal.start?.timestamp, false)}
                </span>
              </div>

              {/* <div>
                <span className="multigov-proposal-description-key">TO: </span>
                <span className="multigov-proposal-description-value">Dec 14, 2024</span>
              </div> */}

              {status === "Active" && (
                <div className="multigov-proposal-description-time-left">
                  <ClockIcon width={16} />
                  <span>1 month left</span>
                </div>
              )}

              <div className={`multigov-proposal-description-status ${status}`}>{status}</div>
            </div>
            <div className="multigov-proposal-description-network">
              <span className="multigov-proposal-description-key">NETWORK: </span>
              <span className="multigov-proposal-description-value">
                {" "}
                {proposal.governor?.name}
              </span>
            </div>
          </div>
        ),
        positive: (
          <div className="multigov-proposal-positive">
            <ThumbsUpIcon width={24} />
            {formatNumber(positiveVotes)}
          </div>
        ),
        negative: (
          <div className="multigov-proposal-negative">
            <ThumbsDownIcon width={24} />
            {formatNumber(negativeVotes)}
          </div>
        ),
        totalVotes: formatNumber(positiveVotes + negativeVotes),
      };
    });

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
          data={parsedProposals || []}
          emptyMessage={
            <>{isError ? "Something went wrong fetching proposals" : "No proposals found"}</>
          }
          isLoading={isLoading}
          numberOfColumns={4}
          numberOfRows={7}
          onRowClick={data => {
            const descriptionAnchor = data?.description?.props?.children[0];
            if (descriptionAnchor) {
              window.open(descriptionAnchor.props.href, "_blank");
            }
          }}
        />

        <div className="multigov-more-proposals">
          <a
            href="https://staging.tally.xyz/gov/multigov/proposals"
            target="_blank"
            rel="noreferrer"
          >
            More proposals
            <NewTabIcon width={24} />
          </a>
        </div>

        <CommunityBanner />
      </section>
    </BaseLayout>
  );
};

export default Multigov;
