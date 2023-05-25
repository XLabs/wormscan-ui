import { useMemo } from "react";
import { Table, Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import { Column } from "react-table";
import "./styles.scss";

const TXNS_TAB_HEADERS = [
  i18n.t("common.assets").toUpperCase(),
  i18n.t("common.messages").toUpperCase(),
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
  const columns: Column<TransactionOutput>[] = useMemo(
    () => [
      {
        Header: "TXN HASH",
        accessor: "txnHash",
      },
      {
        Header: "TYPE",
        accessor: "type",
      },
      {
        Header: "STATUS",
        accessor: "status",
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
        style: { textAlign: "right" },
      },
      {
        Header: "TIME",
        accessor: "time",
        style: { textAlign: "right" },
      },
    ],
    [],
  );

  const data: TransactionOutput[] = useMemo(
    () => [
      {
        txnHash: "0x1234567890",
        type: "Asset",
        status: "Success",
        from: "0x1234567890",
        to: "0x1234567890",
        amount: 100,
        time: "2021-01-01 00:00:00",
      },
      {
        txnHash: "0x1234567890",
        type: "Asset",
        status: "Success",
        from: "0x1234567890",
        to: "0x1234567890",
        amount: 100,
        time: "2021-01-01 00:00:00",
        style: { textAlign: "right" },
      },
      {
        txnHash: "0x1234567890",
        type: "Asset",
        status: "Success",
        from: "0x1234567890",
        to: "0x1234567890",
        amount: 100,
        time: "2021-01-01 00:00:00",
      },
    ],
    [],
  );

  return (
    <section className="txs-information">
      <Tabs
        headers={TXNS_TAB_HEADERS}
        contents={[
          <>
            <div className="txs-information-table-results">23,346,643 Results</div>
            <Table columns={columns} data={data} />
          </>,
          "Message Content",
        ]}
      />
    </section>
  );
};

export { Information };
