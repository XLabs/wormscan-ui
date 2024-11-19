import { Column } from "react-table";
import { ChainId, chainIdToChain } from "@wormhole-foundation/sdk";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import { SwapVerticalIcon, CopyIcon } from "src/icons/generic";
import { useEnvironment } from "src/context/EnvironmentContext";
import { useNavigateCustom, useWindowSize } from "src/utils/hooks";
import { BlockchainIcon, Tooltip, NavLink } from "src/components/atoms";
import { CopyToClipboard, StatusBadge } from "src/components/molecules";
import { Table } from "src/components/organisms";
import { timeAgo } from "src/utils/date";
import { formatNumber } from "src/utils/number";
import { Environment } from "src/utils/environment";
import { getExplorerLink } from "src/utils/wormhole";
import { shortAddress, parseTx } from "src/utils/crypto";
import { BREAKPOINTS, NTT_APP_ID } from "src/consts";
import analytics from "src/analytics";

interface IRecentTransactionsProps {
  isError: boolean;
  isLoading: boolean;
  recentTransactions: GetOperationsOutput[];
  tokenIcon: string;
}

const columnsRecentTransactions: Column[] | any = [
  {
    Header: "STATUS",
    accessor: "status",
  },
  {
    Header: "TX HASH",
    accessor: "txHash",
  },
  {
    Header: "FROM",
    accessor: "from",
  },
  {
    Header: "TO",
    accessor: "to",
  },
  {
    Header: "AMOUNT",
    accessor: "amount",
  },
  {
    Header: "TIME",
    accessor: "time",
  },
];

export const RecentTransactions = ({
  isError,
  isLoading,
  recentTransactions,
  tokenIcon,
}: IRecentTransactionsProps) => {
  const navigate = useNavigateCustom();
  const { environment } = useEnvironment();
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  const stopPropagation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const renderAddress = (data: GetOperationsOutput, isFrom: boolean) => {
    const chainId = isFrom
      ? data.sourceChain?.chainId
      : data.content?.standarizedProperties?.toChain;
    const address = isFrom
      ? data.sourceChain?.from
      : data.content?.standarizedProperties?.toAddress;

    if (!chainId || !address) return null;

    return (
      <div className="recent-transactions-table-item-container">
        <Tooltip tooltip={<div>{chainIdToChain(chainId)}</div>} maxWidth={false} type="info">
          <div>
            <BlockchainIcon chainId={chainId} network={environment.network} />
          </div>
        </Tooltip>
        <a
          href={getExplorerLink({
            network: environment.network,
            chainId,
            value: address,
            base: "address",
            isNativeAddress: true,
          })}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stopPropagation}
        >
          {shortAddress(address).toUpperCase()}
        </a>
        <CopyToClipboard toCopy={address}>
          <CopyIcon />
        </CopyToClipboard>
      </div>
    );
  };

  const parsedRecentTxsData =
    recentTransactions?.map(data => ({
      txHashString: data.sourceChain.transaction.txHash,
      status: (
        <div className="recent-transactions-table-item">
          <h4>STATUS</h4>

          <div className="recent-transactions-table-item-container">
            <StatusBadge size="responsive" status={data.status} />
          </div>
        </div>
      ),
      txHash: (
        <div className="recent-transactions-table-item">
          <h4>TX HASH</h4>

          <div className="recent-transactions-table-item-container">
            <NavLink
              to={`/tx/${parseTx({
                value: data.sourceChain.transaction.txHash,
                chainId: data.sourceChain?.chainId as ChainId,
              })}`}
              onClick={stopPropagation}
            >
              {shortAddress(data.sourceChain.transaction.txHash).toUpperCase()}
            </NavLink>
            <CopyToClipboard toCopy={data.sourceChain.transaction.txHash}>
              <CopyIcon />
            </CopyToClipboard>
          </div>
        </div>
      ),
      from: (
        <div className="recent-transactions-table-item">
          <h4>FROM</h4>

          {renderAddress(data, true)}
        </div>
      ),
      to: (
        <div className="recent-transactions-table-item">
          <h4>TO</h4>

          {renderAddress(data, false)}
        </div>
      ),
      amount: (
        <div className="recent-transactions-table-item">
          <h4>AMOUNT</h4>

          <div className="recent-transactions-table-item-container amount">
            <span>
              {formatNumber(
                data?.data?.tokenAmount
                  ? +data?.data?.tokenAmount
                  : +data?.content?.payload?.parsedPayload?.nttMessage?.trimmedAmount?.amount /
                      1000000 ||
                      +data?.content?.payload?.nttMessage?.trimmedAmount?.amount / 1000000,
              )}
            </span>
            <img src={tokenIcon} alt={`${data?.data?.symbol} Token`} width="16" height="16" />
            {data?.data?.usdAmount && (
              <span className="usd">(${formatNumber(+data?.data?.usdAmount, 2)})</span>
            )}
          </div>
        </div>
      ),
      time: (
        <div className="recent-transactions-table-item">
          <h4>TIME</h4>

          <div className="recent-transactions-table-item-container time">
            {timeAgo(new Date(data.sourceChain?.timestamp))}
          </div>
        </div>
      ),
      viewDetails: data?.sourceChain?.transaction?.txHash && (
        <div className="recent-transactions-table-item">
          <NavLink
            className="recent-transactions-table-item-btn"
            to={`/tx/${parseTx({
              value: data.sourceChain.transaction.txHash,
              chainId: data.sourceChain?.chainId as ChainId,
            })}`}
            onClick={stopPropagation}
          >
            View details
          </NavLink>
        </div>
      ),
    })) || [];

  if (isError) return null;

  return (
    <div className="recent-transactions">
      <div className="recent-transactions-title">
        <SwapVerticalIcon />
        <div>Recent Transactions</div>
        <ViewMore environment={environment}>View All</ViewMore>
      </div>

      <div className="recent-transactions-table">
        <Table
          columns={
            isDesktop
              ? columnsRecentTransactions
              : [
                  ...columnsRecentTransactions,
                  {
                    Header: "VIEW DETAILS",
                    accessor: "viewDetails",
                  },
                ]
          }
          data={parsedRecentTxsData}
          emptyMessage={
            <>
              No recent transaction found; take a look at&nbsp;
              <ViewMore environment={environment}>All Transactions</ViewMore>.
            </>
          }
          isLoading={isLoading}
          numberOfColumns={6}
          numberOfRows={7}
          onRowClick={tx => (tx.txHash ? navigate(`/tx/${tx.txHashString}`) : null)}
        />
      </div>
    </div>
  );
};

const ViewMore = ({
  environment,
  children,
}: {
  environment: Environment;
  children: React.ReactNode;
}) => {
  return (
    <a
      onClick={() => {
        window.scrollTo(0, 0);

        analytics.track("viewMore", {
          network: environment.network,
          selected: "NTT Token Recent Transactions",
        });
      }}
      href={`#/txs?appId=${NTT_APP_ID}`}
    >
      {children}
    </a>
  );
};
