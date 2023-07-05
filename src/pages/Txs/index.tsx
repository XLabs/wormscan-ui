import { CopyIcon } from "@radix-ui/react-icons";
import { ChainId, Order } from "@xlabs-libs/wormscan-sdk";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { getClient } from "src/api/Client";
import { BlockchainIcon, Loader } from "src/components/atoms";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import { BaseLayout } from "src/layouts/BaseLayout";
import { parseAddress, parseTx, shortAddress } from "src/utils/crypto";
import { timeAgo } from "src/utils/date";
import { formatCurrency } from "src/utils/number";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { Information } from "./Information";
import { Top } from "./Top";
import StatusBadge from "src/components/molecules/StatusBadge";
import { NETWORK, TxStatus } from "../../types";
import "./styles.scss";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import Link from "src/components/atoms/Link";

export interface TransactionOutput {
  id: string;
  txHash: React.ReactNode;
  from: React.ReactNode;
  to: React.ReactNode;
  status: React.ReactNode;
  amount: number | string;
  time: Date | string;
}

export const PAGE_SIZE = 50;
const REFETCH_TIME = 1000 * 10;

const Txs = () => {
  const navigate = useNavigateCustom();
  const [searchParams] = useSearchParams();
  const address = searchParams.get("address");
  const network = searchParams.get("network") as NETWORK;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState<boolean>(false);
  const [addressChainId, setAddressChainId] = useState<ChainId | undefined>(undefined);
  const [parsedTxsData, setParsedTxsData] = useState<TransactionOutput[] | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setIsLoading(true);
  }, [address]);

  useEffect(() => {
    if (!network) return;

    setIsLoading(true);
    setCurrentPage(1);
  }, [network]);

  const getTransactionInput = {
    query: {
      ...(address && { address }),
    },
    pagination: {
      page: currentPage - 1,
      pageSize: PAGE_SIZE,
      sortOrder: Order.DESC,
    },
  };

  useQuery(
    ["getTxs", getTransactionInput],
    () => getClient().search.getTransactions(getTransactionInput),
    {
      refetchInterval: () => (currentPage === 1 ? REFETCH_TIME : false),
      onError: () => {
        navigate(`/search-not-found?q=${address || "Txs"}`);
      },
      onSuccess: txs => {
        const tempRows: TransactionOutput[] = [];
        const originAddress = txs?.[0]?.originAddress;
        const originChainId = txs?.[0]?.originChain;
        const destinationChainId = txs?.[0]?.destinationChain;
        const addressChainId =
          String(address).toLowerCase() === String(originAddress).toLowerCase()
            ? originChainId
            : destinationChainId;

        txs?.length > 0
          ? txs?.forEach(tx => {
              const {
                txHash,
                originAddress,
                originChain,
                destinationAddress,
                destinationChain,
                timestamp,
                tokenAmount,
                symbol,
                status,
              } = tx || {};

              const parseTxHash = parseTx({
                value: txHash,
                chainId: originChain as ChainId,
              });
              const parsedOriginAddress = parseAddress({
                value: originAddress,
                chainId: originChain as ChainId,
              });
              const parsedDestinationAddress = parseAddress({
                value: destinationAddress,
                chainId: destinationChain as ChainId,
              });
              const timestampDate = new Date(timestamp);
              const row = {
                id: txHash,
                txHash: (
                  <div className="tx-hash">
                    {parseTxHash ? (
                      <>
                        <Link to={`/tx/${txHash}`} target="_blank">
                          {shortAddress(parseTxHash)}
                        </Link>
                        <CopyToClipboard toCopy={parseTxHash}>
                          <CopyIcon />
                        </CopyToClipboard>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                ),
                from: (
                  <div className="tx-from">
                    <BlockchainIcon chainId={originChain} size={24} />
                    <div>
                      {getChainName({ chainId: originChain })}
                      {parsedOriginAddress && (
                        <div className="tx-from-address">
                          <a
                            href={getExplorerLink({
                              chainId: originChain,
                              value: parsedOriginAddress,
                              base: "address",
                              isNativeAddress: true,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shortAddress(parsedOriginAddress)}
                          </a>

                          <CopyToClipboard toCopy={parsedOriginAddress}>
                            <CopyIcon />
                          </CopyToClipboard>
                        </div>
                      )}
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
                                value: parsedDestinationAddress,
                                base: "address",
                                isNativeAddress: true,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {shortAddress(parsedDestinationAddress)}
                            </a>

                            <CopyToClipboard toCopy={parsedDestinationAddress}>
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
                  <div className="tx-status">
                    <StatusBadge status={status as TxStatus} />
                  </div>
                ),
                amount: tokenAmount ? formatCurrency(Number(tokenAmount)) + " " + symbol : "-",
                time: (timestampDate && timeAgo(timestampDate)) || "-",
              };

              tempRows.push(row);
            })
          : [];

        setParsedTxsData(tempRows);
        setAddressChainId(addressChainId as ChainId);
        setIsLoading(false);
        setIsPaginationLoading(false);
      },
    },
  );

  const onChangePagination = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <BaseLayout>
      <div className="txs-page">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <Top address={address} addressChainId={addressChainId} />
            <Information
              parsedTxsData={parsedTxsData}
              currentPage={currentPage}
              onChangePagination={onChangePagination}
              isPaginationLoading={isPaginationLoading}
              setIsPaginationLoading={setIsPaginationLoading}
            />
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export { Txs };
