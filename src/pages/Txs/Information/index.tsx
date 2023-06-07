import { useMemo } from "react";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Table, Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import { Column } from "react-table";
import client from "src/api/Client";
import { useQuery } from "react-query";
import { Order } from "@xlabs-libs/wormscan-sdk";
import { parseAddress, parseTx, shortAddress } from "src/utils/crypto";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { BlockchainIcon, Loader } from "src/components/atoms";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import { CopyIcon } from "@radix-ui/react-icons";
import { formatUnits } from "src/utils/crypto";
import { formatCurrency } from "src/utils/number";
import { timeAgo } from "src/utils/date";
import { ChainId } from "@certusone/wormhole-sdk";
import "./styles.scss";

const TXS_TAB_HEADERS = [
  i18n.t("common.txs").toUpperCase(),
  i18n.t("common.messages").toUpperCase(),
];

interface TransactionOutput {
  txHash: React.ReactNode;
  from: React.ReactNode;
  to: React.ReactNode;
  status: React.ReactNode;
  amount: number | string;
  time: Date | string;
}
const Information = () => {
  const columns: Column<TransactionOutput>[] = useMemo(
    () => [
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
    ],
    [],
  );

  const pagination = {
    page: 0,
    pageSize: 50,
    sortOrder: Order.DESC,
  };

  const {
    isLoading: VAAsDataIsLoading,
    error: VAAsError,
    data: VAAsData,
  } = useQuery(["getVAAs", pagination], () =>
    client.guardianNetwork.getVAA({
      query: { parsedPayload: true },
      pagination,
    }),
  );

  const parsedVAAsData =
    VAAsData?.length > 0
      ? VAAsData.map(vaa => {
          const { txHash, emitterChainId, emitterAddr, timestamp, payload } = vaa || {};
          const { amount = 0, toAddress, toChain } = payload || {};
          const parseTxHash = parseTx({
            value: txHash,
            chainId: emitterChainId,
          });
          const parsedEmitterAddress = parseAddress({
            value: emitterAddr,
            chainId: emitterChainId,
          });
          const parsedToAddress = parseAddress({
            value: toAddress,
            chainId: toChain as ChainId,
          });
          const timestampDate = new Date(timestamp);
          return {
            txHash: (
              <div className="tx-hash">
                <a
                  href={getExplorerLink({
                    chainId: emitterChainId,
                    value: parseTxHash,
                    isNativeAddress: true,
                  })}
                  target="_blank"
                  rel="noreferrer"
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
                <BlockchainIcon chainId={emitterChainId} size={24} />
                <div>
                  {getChainName({ chainId: emitterChainId })}
                  <div className="tx-from-address">
                    <a
                      href={getExplorerLink({
                        chainId: emitterChainId,
                        value: parsedEmitterAddress,
                        base: "address",
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noreferrer"
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
                {toChain ? (
                  <>
                    <BlockchainIcon chainId={toChain} size={24} />
                    <div>
                      {getChainName({ chainId: toChain })}
                      <div className="tx-from-address">
                        <a
                          href={getExplorerLink({
                            chainId: toChain,
                            value: parsedToAddress,
                            base: "address",
                            isNativeAddress: true,
                          })}
                          target="_blank"
                          rel="noreferrer"
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
            status:
              (
                <div className="tx-status green">
                  COMPLETED <CheckCircledIcon />
                </div>
              ) || "-",
            amount: Number(formatCurrency(Number(formatUnits(amount)))) + " (?)",
            time: (timestampDate && timeAgo(timestampDate)) || "-",
          };
        })
      : [];

  return (
    <section className="txs-information">
      {VAAsDataIsLoading ? (
        <div className="txs-information-loader">
          <Loader />
        </div>
      ) : (
        <Tabs
          headers={TXS_TAB_HEADERS}
          contents={[
            <>
              <div className="txs-information-table-results">(?) Results</div>
              <Table columns={columns} data={parsedVAAsData} className="assets" />
            </>,
            "Message Content",
          ]}
        />
      )}
    </section>
  );
};

export { Information };
