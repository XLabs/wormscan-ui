import { CopyIcon } from "@radix-ui/react-icons";
import { ChainId, Order } from "@xlabs-libs/wormscan-sdk";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import client from "src/api/Client";
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
import { TxStatus } from "../../types";
import "./styles.scss";

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

const Txs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const address = searchParams.get("address");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState<boolean>(false);
  const [addressChainId, setAddressChainId] = useState<ChainId | undefined>(undefined);
  const [parsedTxsData, setParsedTxsData] = useState<TransactionOutput[] | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setIsLoading(true);
  }, [address]);

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

  const stopBubbling = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  useInfiniteQuery(
    ["getTxs", getTransactionInput],
    () => client.search.getTransactions(getTransactionInput),
    {
      refetchInterval: () => (currentPage === 1 ? 10000 : false),
      onError: () => {
        navigate(`/search-not-found/${address || ""}`);
      },
      onSuccess: data => {
        const tempRows: TransactionOutput[] = [];
        const originAddress = data?.pages?.[0]?.[0]?.originAddress;
        const originChainId = data?.pages?.[0]?.[0]?.originChain;
        const destinationChainId = data?.pages?.[0]?.[0]?.destinationChain;
        const addressChainId =
          String(address).toLowerCase() === String(originAddress).toLowerCase()
            ? originChainId
            : destinationChainId;

        const { pages } = data || {};
        pages?.length > 0
          ? pages?.forEach(page => {
              page?.length > 0 &&
                page?.forEach(tx => {
                  const {
                    id,
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
                  // Here we are using the emitterAddress as the `TO (Destination Address)`
                  // TODO: Change to the real Destination Address when the API is ready
                  const emitterAddress = id?.split("/")[1] || " -";
                  const parsedEmitterAddress = parseAddress({
                    value: emitterAddress,
                    chainId: originChain as ChainId,
                  });

                  const parseTxHash = parseTx({
                    value: txHash,
                    chainId: originChain as ChainId,
                  });
                  const parsedOriginAddress = parseAddress({
                    value: originAddress,
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
                        {parseTxHash ? (
                          <>
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
                                rel="noreferrer"
                                onClick={stopBubbling}
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
                        {originChain ? (
                          <>
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
                });
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
          <div className="txs-page-loader">
            <Loader />
          </div>
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
