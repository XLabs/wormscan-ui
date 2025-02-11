import { ChainId } from "@wormhole-foundation/sdk";
import { Column, Row } from "react-table";
import { Tooltip } from "src/components/atoms";
import { InfoCircleIcon } from "src/icons/generic";

export interface IDataDashboard {
  availableNotional: number;
  chainId: ChainId;
  maxTransactionSize: number;
  notionalLimit: number;
}

export interface IRowDashboard {
  availableNotional: number;
  chain: React.ReactNode;
  chainId: ChainId;
  chainName: string;
  dailyLimit: React.ReactNode;
  maxTransactionSize: number;
  notionalLimit: number;
  remainingTransactionLimit: React.ReactNode;
  singleTransactionLimit: React.ReactNode;
}

export interface IDataTransaction {
  amount: number;
  chainId: ChainId;
  emmiterAddress: string;
  releaseTime: string;
  sequence: string;
  status: string;
  txHash: string;
  vaaId: string;
}

export interface IRowTransaction {
  amount: React.ReactNode;
  chain: React.ReactNode;
  chainName: string;
  formatedStatus: string;
  parseTxHash: string;
  releaseDate: Date;
  releaseTime: React.ReactNode;
  status: React.ReactNode;
  txHash: React.ReactNode;
  usdAmount: string;
}

export interface ISelectSortBy {
  label: string;
  value: string;
}

export interface ISelectSortLowHigh {
  label: string;
  value: boolean;
}

export const SingleTxLimitTooltip = () => (
  <Tooltip
    className="governor-container-table-title-tooltip"
    maxWidth={false}
    tooltip={
      <div>
        Transactions exceeding this single-transaction threshold activate a 24-hour finality delay
        before being signed by Wormhole Guardians. These transactions are not included in the total
        value counted towards the 24-hour rolling period limit.
      </div>
    }
    type="info"
  >
    <div>
      <InfoCircleIcon />
    </div>
  </Tooltip>
);

export const DailyLimitTooltip = () => (
  <Tooltip
    className="governor-container-table-title-tooltip"
    maxWidth={false}
    tooltip={
      <div>
        Maximum total value of transactions that can be signed without delay in any 24-hour rolling
        period. If this limit is exceeded, additional transactions are delayed until earlier
        transactions age beyond this 24-hour window, thereby freeing up bandwidth to process the
        delayed transactions.
      </div>
    }
    type="info"
  >
    <div>
      <InfoCircleIcon />
    </div>
  </Tooltip>
);

export const RemainingTxLimitTooltip = () => (
  <Tooltip
    className="governor-container-table-title-tooltip"
    maxWidth={false}
    tooltip={
      <div>
        This shows the remaining value of transaction volume that can be processed without delay
        today. Once this limit is reached, further transactions will be delayed until sufficient
        limit is available within the 24-hour rolling window.
      </div>
    }
    type="info"
  >
    <div>
      <InfoCircleIcon />
    </div>
  </Tooltip>
);

export const MinRemainingBar = ({ percentage, color }: { percentage: number; color: string }) => {
  const totalSegments = 13;
  const activeSegments = Math.round((percentage / 100) * totalSegments);

  return (
    <div className="min-remaining-container-bar">
      {Array.from({ length: totalSegments }, (_, i) => (
        <div
          key={i}
          className="min-remaining-container-bar-segment"
          style={{ backgroundColor: i < 1 || i < activeSegments ? color : undefined }}
        />
      ))}
    </div>
  );
};

export const columnsDashboard: Column[] | any = [
  {
    Header: "Chain",
    accessor: "chain",
    sortType: (rowA: Row<IRowDashboard>, rowB: Row<IRowDashboard>) => {
      const a = rowA.original.chainName.toUpperCase();
      const b = rowB.original.chainName.toUpperCase();
      return a.localeCompare(b);
    },
  },
  {
    Header: "Single Transaction Limit",
    Tooltip: <SingleTxLimitTooltip />,
    accessor: "singleTransactionLimit",
    sortType: (rowA: Row<IRowDashboard>, rowB: Row<IRowDashboard>) => {
      return rowA.original.maxTransactionSize - rowB.original.maxTransactionSize;
    },
  },
  {
    Header: "Daily Limit",
    Tooltip: <DailyLimitTooltip />,
    accessor: "dailyLimit",
    sortType: (rowA: Row<IRowDashboard>, rowB: Row<IRowDashboard>) => {
      return rowA.original.notionalLimit - rowB.original.notionalLimit;
    },
  },
  {
    Header: "Remaining Transaction Limit",
    Tooltip: <RemainingTxLimitTooltip />,
    accessor: "remainingTransactionLimit",
    sortType: (rowA: Row<IRowDashboard>, rowB: Row<IRowDashboard>) => {
      return rowA.original.availableNotional - rowB.original.availableNotional;
    },
  },
];

export const columnsTransactions: Column[] | any = [
  {
    Header: "Chain",
    accessor: "chain",
    sortType: (rowA: Row<IRowTransaction>, rowB: Row<IRowTransaction>) => {
      const a = rowA.original.chainName.toUpperCase();
      const b = rowB.original.chainName.toUpperCase();

      return a.localeCompare(b);
    },
  },
  {
    Header: "Tx Hash",
    accessor: "txHash",
    sortType: (rowA: Row<IRowTransaction>, rowB: Row<IRowTransaction>) => {
      const a = rowA.original.parseTxHash.toUpperCase();
      const b = rowB.original.parseTxHash.toUpperCase();

      return a.localeCompare(b);
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    sortType: (rowA: Row<IRowTransaction>, rowB: Row<IRowTransaction>) => {
      return +rowA.original.usdAmount - +rowB.original.usdAmount;
    },
  },
  {
    Header: "Status",
    accessor: "status",
    sortType: (rowA: Row<IRowTransaction>, rowB: Row<IRowTransaction>) => {
      const a = rowA.original.formatedStatus.toUpperCase();
      const b = rowB.original.formatedStatus.toUpperCase();

      return a.localeCompare(b);
    },
  },
  {
    Header: "Release Time",
    accessor: "releaseTime",
    sortType: (rowA: Row<IRowTransaction>, rowB: Row<IRowTransaction>) => {
      const a = new Date(rowA.original.releaseDate);
      const b = new Date(rowB.original.releaseDate);

      return a.getTime() - b.getTime();
    },
  },
];
