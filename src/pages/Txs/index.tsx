import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { CopyIcon } from "@radix-ui/react-icons";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BlockchainIcon, Loader, NavLink } from "src/components/atoms";
import { CopyToClipboard, StatusBadge } from "src/components/molecules";
import { BaseLayout } from "src/layouts/BaseLayout";
import { formatAppIds, parseAddress, parseTx, shortAddress } from "src/utils/crypto";
import { timeAgo } from "src/utils/date";
import { formatCurrency } from "src/utils/number";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { ChainId, Order } from "src/api";
import { getClient } from "src/api/Client";
import { GetTransactionsOutput } from "src/api/search/types";
import { TxStatus } from "../../types";
import { Information } from "./Information";
import { Top } from "./Top";
import "./styles.scss";

export interface TransactionOutput {
  VAAId: string;
  txHashId: string;
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
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const navigate = useNavigateCustom();
  const [searchParams, setSearchParams] = useSearchParams();
  const address = searchParams.get("address");
  const page = Number(searchParams.get("page"));
  const currentPage = page >= 1 ? page : 1;
  const isTxsFiltered = address ? true : false;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState<boolean>(false);
  const [addressChainId, setAddressChainId] = useState<ChainId | undefined>(undefined);
  const [parsedTxsData, setParsedTxsData] = useState<TransactionOutput[] | undefined>(undefined);

  useEffect(() => {
    localStorage.removeItem("reloadRedirect");
    localStorage.removeItem("attemptsMade");
  }, []);

  const stopPropagation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const setCurrentPage = useCallback(
    (pageNumber: number) => {
      setSearchParams(prev => {
        prev.set("page", String(pageNumber));
        return prev;
      });
    },
    [setSearchParams],
  );

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

  useQuery(
    ["getTxs", getTransactionInput],
    () => getClient().search.getTransactions(getTransactionInput),
    {
      refetchInterval: () => (currentPage === 1 ? REFETCH_TIME : false),
      onError: (err: Error) => {
        let statusCode = 404;
        if (err?.message) {
          // get the status code from the error message
          statusCode = parseInt(err?.message?.match(/\d+/)?.[0], 10);
        }
        navigate(`/search-not-found?q=${address || "txs"}`, {
          state: {
            status: statusCode,
          },
        });
      },
      onSuccess: (txs: GetTransactionsOutput[]) => {
        const tempRows: TransactionOutput[] = [];
        const { standardizedProperties: firstStandardizedProperties, globalTx: firstGlobalTx } =
          txs?.[0] || {};
        const { originTx: firstOriginTx } = firstGlobalTx || {};

        const originChainId = firstStandardizedProperties?.fromChain || firstOriginTx?.chainId;
        const originAddress = firstStandardizedProperties?.fromAddress || firstOriginTx?.from;
        const destinationChainId = firstStandardizedProperties?.toChain;

        const addressChainId =
          String(address).toLowerCase() === String(originAddress).toLowerCase()
            ? originChainId
            : destinationChainId;

        txs?.length > 0
          ? txs?.forEach(tx => {
              const {
                id: VAAId,
                txHash,
                timestamp,
                tokenAmount,
                symbol,
                emitterChain,
                payload,
                standardizedProperties,
                globalTx,
              } = tx || {};
              const {
                appIds,
                fromChain: stdFromChain,
                toChain: stdToChain,
                toAddress: stdToAddress,
              } = standardizedProperties || {};
              const { originTx, destinationTx } = globalTx || {};
              const { from: globalFrom } = originTx || {};
              const { chainId: globalToChainId, from: globalTo } = destinationTx || {};

              const parsedPayload = payload?.parsedPayload;
              const fromChainOrig = emitterChain || stdFromChain;
              const fromAddress = globalFrom;
              const toAddress = stdToAddress || globalTo;

              // --- Gateway Transfers
              const fromChain =
                originTx?.attribute?.type === "wormchain-gateway"
                  ? originTx?.attribute?.value?.originChainId
                  : fromChainOrig;
              const toChain = parsedPayload?.["gateway_transfer"]?.chain
                ? parsedPayload?.["gateway_transfer"].chain
                : stdToChain || globalToChainId;
              // -----

              const parseTxHash = parseTx({
                value: txHash,
                chainId: fromChain as ChainId,
              });
              const parsedOriginAddress = parseAddress({
                value: fromAddress,
                chainId: fromChain as ChainId,
              });
              const parsedDestinationAddress = parseAddress({
                value: toAddress,
                chainId: toChain as ChainId,
              });

              // --- Gateway Transfers
              const sourceAddress =
                originTx?.attribute?.type === "wormchain-gateway"
                  ? originTx?.attribute?.value?.originAddress
                  : parsedOriginAddress;
              const targetAddress = parsedPayload?.["gateway_transfer"]?.recipient
                ? parsedPayload?.["gateway_transfer"].recipient
                : parsedDestinationAddress;
              // -----

              const timestampDate = new Date(timestamp);
              const row = {
                VAAId: VAAId,
                txHashId: parseTxHash,
                txHash: (
                  <div className="tx-hash">
                    {parseTxHash ? (
                      <>
                        <NavLink to={`/tx/${parseTxHash}`} onClick={stopPropagation}>
                          {shortAddress(parseTxHash).toUpperCase()}
                        </NavLink>
                        <CopyToClipboard toCopy={parseTxHash}>
                          <CopyIcon height={20} width={20} />
                        </CopyToClipboard>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                ),
                originApp: appIds?.length > 0 ? formatAppIds(appIds) : "-",
                from: (
                  <div className="tx-from">
                    <BlockchainIcon chainId={fromChain} size={24} />
                    <div>
                      {getChainName({ chainId: fromChain })}
                      {sourceAddress && (
                        <div className="tx-from-address">
                          <a
                            href={getExplorerLink({
                              network: currentNetwork,
                              chainId: fromChain,
                              value: sourceAddress,
                              base: "address",
                              isNativeAddress: true,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stopPropagation}
                          >
                            {shortAddress(sourceAddress).toUpperCase()}
                          </a>

                          <CopyToClipboard toCopy={sourceAddress}>
                            <CopyIcon height={20} width={20} />
                          </CopyToClipboard>
                        </div>
                      )}
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
                                network: currentNetwork,
                                chainId: toChain,
                                value: targetAddress,
                                base: "address",
                                isNativeAddress: true,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={stopPropagation}
                            >
                              {shortAddress(targetAddress).toUpperCase()}
                            </a>

                            <CopyToClipboard toCopy={targetAddress}>
                              <CopyIcon height={20} width={20} />
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
                amount: tokenAmount
                  ? formatCurrency(Number(tokenAmount)) + " " + (symbol ? symbol : "N/A")
                  : "-",
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
      <div className="txs-page" data-testid="txs-page">
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
              isTxsFiltered={isTxsFiltered}
            />
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export default Txs;
