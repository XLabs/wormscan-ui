import { useRef, useState } from "react";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Table, Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import { Column } from "react-table";
import client from "src/api/Client";
import { useInfiniteQuery } from "react-query";
import { Order } from "@xlabs-libs/wormscan-sdk";
import { parseAddress, parseTx, shortAddress } from "src/utils/crypto";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { BlockchainIcon, Loader } from "src/components/atoms";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import { CopyIcon } from "@radix-ui/react-icons";
import { formatCurrency } from "src/utils/number";
import { timeAgo } from "src/utils/date";
import { ChainId } from "@certusone/wormhole-sdk";
import { colorStatus } from "src/consts";
import { useIntersectionObserver } from "src/utils/hooks/useIntersectionObserver";
import "./styles.scss";
import { useNavigate } from "react-router-dom";

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

interface TransactionOutput {
  id: string;
  txHash: React.ReactNode;
  from: React.ReactNode;
  to: React.ReactNode;
  status: React.ReactNode;
  amount: number | string;
  time: Date | string;
}

const Information = () => {
  const navigate = useNavigate();
  const [parsedTxsData, setParsedTxsData] = useState<TransactionOutput[] | undefined>(undefined);
  const ref = useRef<HTMLDivElement | null>(null);
  useIntersectionObserver({
    target: ref,
    onIntersect: () => {
      // console.log("onIntersect");
    },
  });

  const pagination = {
    page: 0,
    pageSize: 50,
    sortOrder: Order.DESC,
  };

  const stopBubbling = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const {
    isLoading: txsDataIsLoading,
    isFetching: txsDataIsFetching,
    error: txsError,
    data: txsData,
  } = useInfiniteQuery(
    ["getTxs", pagination],
    () =>
      client.search.getTransactions({
        pagination,
      }),
    {
      refetchInterval: 10000,
      onSuccess: data => {
        const tempRows: TransactionOutput[] = [];
        const { pages } = data || {};
        pages?.length > 0
          ? pages?.forEach(page => {
              page?.length > 0 &&
                page?.forEach(tx => {
                  const {
                    id,
                    txHash,
                    originChain,
                    destinationAddress,
                    destinationChain,
                    timestamp,
                    tokenAmount,
                    symbol,
                    status,
                  } = tx || {};
                  // Here we are using the emiiterAddres as the `FROM (Origin Address)`
                  // TODO: Change to the real Origin Address / source wallet
                  const emitterAddress = id.split("/")[1];

                  const parseTxHash = parseTx({
                    value: txHash,
                    chainId: originChain as ChainId,
                  });
                  const parsedEmitterAddress = parseAddress({
                    value: emitterAddress,
                    chainId: originChain as ChainId,
                  });
                  const parsedToAddress = parseAddress({
                    value: destinationAddress,
                    chainId: destinationChain as ChainId,
                  });
                  const timestampDate = new Date(timestamp);
                  const row = {
                    id: txHash,
                    txHash: (
                      <div className="tx-hash">
                        <a
                          href={getExplorerLink({
                            chainId: originChain,
                            value: parseTxHash,
                            isNativeAddress: true,
                          })}
                          target="_blank"
                          rel="noreferrer"
                          onClick={stopBubbling}
                        >
                          {shortAddress(parseTxHash)}
                        </a>
                        <CopyToClipboard toCopy={parseTxHash}>
                          <CopyIcon />
                        </CopyToClipboard>
                      </div>
                    ),
                    from: (
                      <div className="tx-from">
                        <BlockchainIcon chainId={originChain} size={24} />
                        <div>
                          {getChainName({ chainId: originChain })}
                          <div className="tx-from-address">
                            <a
                              href={getExplorerLink({
                                chainId: originChain,
                                value: parsedEmitterAddress,
                                base: "address",
                                isNativeAddress: true,
                              })}
                              target="_blank"
                              rel="noreferrer"
                              onClick={stopBubbling}
                            >
                              {shortAddress(parsedEmitterAddress)}
                            </a>

                            <CopyToClipboard toCopy={parsedEmitterAddress}>
                              <CopyIcon />
                            </CopyToClipboard>
                          </div>
                        </div>
                      </div>
                    ),
                    to: (
                      <div className="tx-to">
                        {destinationChain ? (
                          <>
                            <BlockchainIcon chainId={destinationChain} size={24} />
                            <div>
                              {getChainName({ chainId: destinationChain })}
                              <div className="tx-from-address">
                                <a
                                  href={getExplorerLink({
                                    chainId: destinationChain,
                                    value: parsedToAddress,
                                    base: "address",
                                    isNativeAddress: true,
                                  })}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={stopBubbling}
                                >
                                  {shortAddress(parsedToAddress)}
                                </a>

                                <CopyToClipboard toCopy={parsedToAddress}>
                                  <CopyIcon />
                                </CopyToClipboard>
                              </div>
                            </div>
                          </>
                        ) : (
                          "-"
                        )}
                      </div>
                    ),
                    status: (
                      <div
                        className={`tx-status ${colorStatus[String(status).toLocaleUpperCase()]}`}
                      >
                        {String(status).toLocaleUpperCase()} <CheckCircledIcon />
                      </div>
                    ),
                    amount: tokenAmount ? formatCurrency(Number(tokenAmount)) + " " + symbol : "-",
                    time: (timestampDate && timeAgo(timestampDate)) || "-",
                  };

                  tempRows.push(row);
                });
            })
          : [];

        setParsedTxsData(tempRows);
      },
    },
  );

  const showFullLoader = (txsDataIsLoading && txsDataIsFetching) || !parsedTxsData;

  const onRowClick = (row: TransactionOutput) => {
    const { id: txHash } = row || {};
    txHash && navigate(`/tx/${txHash}`);
  };

  return (
    <>
      <section className="txs-information">
        {showFullLoader ? (
          <div className="txs-information-loader">
            <Loader />
          </div>
        ) : (
          <div>
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
            <div ref={ref}></div>
          </div>
        )}
      </section>
    </>
  );
};

export { Information };
