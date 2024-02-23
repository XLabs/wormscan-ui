import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { CopyIcon } from "@radix-ui/react-icons";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BlockchainIcon, Loader, NavLink } from "src/components/atoms";
import { CopyToClipboard, StatusBadge } from "src/components/molecules";
import { SearchNotFound } from "src/components/organisms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { formatAppIds, parseAddress, parseTx, shortAddress } from "src/utils/crypto";
import { timeAgo } from "src/utils/date";
import { formatNumber } from "src/utils/number";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { ChainId, Order } from "src/api";
import { getClient } from "src/api/Client";
import { GetOperationsInput, GetOperationsOutput } from "src/api/guardian-network/types";
import { Information } from "./Information";
import { Top } from "./Top";
import analytics from "src/analytics";
import "./styles.scss";
import {
  CCTP_APP_ID,
  CONNECT_APP_ID,
  IStatus,
  PORTAL_APP_ID,
  UNKNOWN_APP_ID,
  canWeGetDestinationTx,
  txType,
} from "src/consts";

export interface TransactionOutput {
  VAAId: string;
  txHashId: string;
  txHash: React.ReactNode;
  from: React.ReactNode;
  to: React.ReactNode;
  status: React.ReactNode;
  amount: React.ReactNode;
  time: Date | string;
}

export const PAGE_SIZE = 50;

const Txs = () => {
  useEffect(() => {
    analytics.page({ title: "TXS_LIST" });
  }, []);

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const [searchParams, setSearchParams] = useSearchParams();
  const address = searchParams.get("address");
  const page = Number(searchParams.get("page"));
  const currentPage = page >= 1 ? page : 1;
  const q = address ? address : "txs";
  const isTxsFiltered = address ? true : false;
  const REFETCH_TIME = 1000 * (isTxsFiltered ? 120 : 10);

  const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
  const [isPaginationLoading, setIsPaginationLoading] = useState<boolean>(true);
  const [addressChainId, setAddressChainId] = useState<ChainId | undefined>(undefined);
  const [parsedTxsData, setParsedTxsData] = useState<TransactionOutput[] | undefined>(undefined);

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
    setErrorCode(undefined);
  }, [address]);

  useEffect(() => {
    setIsPaginationLoading(true);
  }, [currentNetwork, currentPage]);

  const getOperationsInput: GetOperationsInput = {
    address: address || null,
    pagination: {
      page: currentPage - 1,
      pageSize: PAGE_SIZE,
      sortOrder: Order.DESC,
    },
  };

  useQuery(
    ["getTxs", getOperationsInput],
    () => getClient().guardianNetwork.getOperations(getOperationsInput),
    {
      refetchInterval: () => (currentPage === 1 ? REFETCH_TIME : false),
      onError: (err: Error) => {
        let statusCode = 404;

        if (err?.message) {
          // get the status code from the error message
          statusCode = parseInt(err?.message?.match(/\d+/)?.[0], 10);
        }

        setErrorCode(statusCode);
      },
      onSuccess: (txs: GetOperationsOutput[]) => {
        const tempRows: TransactionOutput[] = [];

        const firstStandarizedProperties = { ...txs?.[0]?.content?.standarizedProperties };
        const firstOriginTx = { ...txs?.[0]?.sourceChain };

        const originChainId = firstStandarizedProperties?.fromChain || firstOriginTx?.chainId;
        const originAddress = firstStandarizedProperties?.fromAddress || firstOriginTx?.from;
        const destinationChainId = firstStandarizedProperties?.toChain;

        const addressChainId =
          String(address).toLowerCase() === String(originAddress).toLowerCase()
            ? originChainId
            : destinationChainId;

        txs?.length > 0
          ? txs?.forEach(tx => {
              const { emitterChain, id: VAAId } = tx;
              const payload = tx?.content?.payload;
              const standarizedProperties = tx?.content?.standarizedProperties;
<<<<<<< HEAD
=======
              const payloadType = tx?.content?.payload?.payloadType;
>>>>>>> a9a645bf4da0f02328dadb9217a1a739f6fe4682
              const symbol = tx?.data?.symbol;
              const tokenAmount = tx?.data?.tokenAmount;
              const timestamp = tx?.sourceChain?.timestamp;
              const txHash = tx?.sourceChain?.transaction?.txHash;

              const {
                appIds,
                fromChain: stdFromChain,
                toChain: stdToChain,
                toAddress: stdToAddress,
              } = standarizedProperties || {};

              const globalFrom = tx.sourceChain?.from;
              const globalToChainId = tx.targetChain?.chainId;
              const globalTo = tx.targetChain?.to;

              const parsedPayload = payload?.parsedPayload;
              const fromChainOrig = emitterChain || stdFromChain;
              const fromAddress = globalFrom;
              const toAddress = stdToAddress || globalTo;

              const attributeType = tx.sourceChain?.attribute?.type;
              const attributeValue = tx.sourceChain?.attribute?.value;

              // --- Gateway Transfers
              const fromChain =
                attributeType === "wormchain-gateway"
                  ? attributeValue?.originChainId
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
                attributeType === "wormchain-gateway"
                  ? attributeValue?.originAddress
                  : parsedOriginAddress;
              const targetAddress = parsedPayload?.["gateway_transfer"]?.recipient
                ? parsedPayload?.["gateway_transfer"].recipient
                : parsedDestinationAddress;
              // -----

              // --- Status Logic
              const isCCTP = appIds?.includes(CCTP_APP_ID);
              const isConnect = appIds?.includes(CONNECT_APP_ID);
              const isPortal = appIds?.includes(PORTAL_APP_ID);
              const isTBTC = !!appIds?.find(appId => appId.toLowerCase().includes("tbtc"));
              const isTransferWithPayload = false; /* payloadType === 3; */ // Operations has it
              const hasAnotherApp = !!(
                appIds &&
                appIds.filter(
                  appId =>
                    appId !== CONNECT_APP_ID &&
                    appId !== PORTAL_APP_ID &&
                    appId !== UNKNOWN_APP_ID &&
                    !appId.toLowerCase().includes("tbtc"),
                )?.length
              );

<<<<<<< HEAD
              const STATUS: IStatus = tx?.targetChain?.transaction?.txHash
=======
              const STATUS: IStatus = tx.targetChain?.transaction?.txHash
>>>>>>> a9a645bf4da0f02328dadb9217a1a739f6fe4682
                ? "COMPLETED"
                : appIds && appIds.includes("CCTP_MANUAL")
                ? "EXTERNAL_TX"
                : tx.vaa?.raw
                ? isConnect || isPortal || isCCTP
                  ? (canWeGetDestinationTx(toChain) &&
                      !hasAnotherApp &&
                      (!isTransferWithPayload ||
                        (isTransferWithPayload && isConnect) ||
                        (isTransferWithPayload && isTBTC))) ||
                    isCCTP
                    ? "PENDING_REDEEM"
                    : "VAA_EMITTED"
                  : "VAA_EMITTED"
                : "IN_PROGRESS";
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
                    <BlockchainIcon chainId={fromChain} network={currentNetwork} size={24} />
                    <div>
                      {getChainName({ chainId: fromChain, network: currentNetwork })}
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
                        <BlockchainIcon chainId={toChain} network={currentNetwork} size={24} />
                        <div>
                          {getChainName({ chainId: toChain, network: currentNetwork })}
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
                status: <StatusBadge STATUS={STATUS} small />,
                amount: (
                  <>
                    {payloadType && <div>{txType[payloadType]}</div>}
                    {tokenAmount && (
                      <div>
                        {formatNumber(Number(tokenAmount)) + " " + (symbol ? symbol : "N/A")}
                      </div>
                    )}
                    {!payloadType && !tokenAmount && "-"}
                  </>
                ),
                time: (timestampDate && timeAgo(timestampDate)) || "-",
              };

              tempRows.push(row);
            })
          : [];

        setParsedTxsData(tempRows);
        setAddressChainId(addressChainId as ChainId);
        setIsPaginationLoading(false);
      },
      enabled: !errorCode,
    },
  );

  const onChangePagination = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <BaseLayout>
      <div className="txs-page" data-testid="txs-page">
        {errorCode ? (
          <SearchNotFound q={q} errorCode={errorCode} />
        ) : (
          <>
            <Top address={address} addressChainId={addressChainId} />
            <Information
              parsedTxsData={isPaginationLoading ? [] : parsedTxsData}
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
