import { Table, Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import { Column } from "react-table";
import { useNavigate } from "react-router-dom";
import { TransactionOutput } from "..";
import "./styles.scss";

const TXS_TAB_HEADERS = [
  i18n.t("common.txs").toUpperCase(),
  // i18n.t("common.messages").toUpperCase(),
];

const columns: Column<TransactionOutput>[] | any = [
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
    Header: "STATUS",
    accessor: "status",
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
];

interface Props {
  parsedTxsData: TransactionOutput[] | undefined;
}

const Information = ({ parsedTxsData }: Props) => {
  const navigate = useNavigate();

  const onRowClick = (row: TransactionOutput) => {
    const { id: txHash } = row || {};
    txHash && navigate(`/tx/${txHash}`);
  };

  return (
    <>
      <section className="txs-information">
        <Tabs
          headers={TXS_TAB_HEADERS}
          contents={[
            <>
              {/* <div className="txs-information-table-results">(?) Results</div> */}
              <Table
                columns={columns}
                data={parsedTxsData}
                className="txs"
                onRowClick={onRowClick}
              />
            </>,
          ]}
        />
      </section>
    </>
  );
};

export { Information };
