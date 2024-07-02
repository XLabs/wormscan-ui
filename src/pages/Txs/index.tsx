import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BlockchainIcon, NavLink, Tooltip } from "src/components/atoms";
import { CopyToClipboard, StatusBadge } from "src/components/molecules";
import { SearchNotFound } from "src/components/organisms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { filterAppIds, formatAppIds, parseAddress, parseTx, shortAddress } from "src/utils/crypto";
import { timeAgo } from "src/utils/date";
import { ArrowRightIcon, CopyIcon } from "src/icons/generic";
import { allBridgeIcon, cctpIcon, mayanIcon, nttIcon, portalIcon } from "src/icons/protocols";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { ChainId, ChainLimit, Order } from "src/api";
import { getClient } from "src/api/Client";
import { GetOperationsInput, GetOperationsOutput } from "src/api/guardian-network/types";
import { Information } from "./Information";
import analytics from "src/analytics";
import {
  ALL_BRIDGE_APP_ID,
  CCTP_APP_ID,
  CCTP_MANUAL_APP_ID,
  CONNECT_APP_ID,
  IStatus,
  MAYAN_APP_ID,
  NTT_APP_ID,
  PORTAL_APP_ID,
  UNKNOWN_APP_ID,
  canWeGetDestinationTx,
  txType,
} from "src/consts";
import { useLocalStorage } from "src/utils/hooks";
import { Top } from "./Top";

export interface TransactionOutput {
  VAAId: string;
  justAppeared: boolean;
  txHashId: string;
  statusString: string;
  status: React.ReactNode;
  txHash: React.ReactNode;
  type: React.ReactNode;
  chains: React.ReactNode;
  protocol: React.ReactNode;
  viewDetails?: React.ReactNode;
  time: React.ReactNode;
}

export const PAGE_SIZE = 50;

export const ETH_LIMIT = {
  maxTransactionSize: 5000000,
  availableNotional: 50000000,
};

const protocolIcons: Record<string, string> = {
  [ALL_BRIDGE_APP_ID]: allBridgeIcon,
  [CCTP_APP_ID]: cctpIcon,
  [MAYAN_APP_ID]: mayanIcon,
  [NTT_APP_ID]: nttIcon,
};

const Txs = () => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const [searchParams, setSearchParams] = useSearchParams();
  const address = searchParams.get("address") || null;
  const appId = searchParams.get("appId") || null;
  const exclusiveAppId = searchParams.get("exclusiveAppId") || null;
  const sourceChain = searchParams.get("sourceChain") || null;
  const targetChain = searchParams.get("targetChain") || null;

  useEffect(() => {
    if (address) {
      analytics.page({ title: "TXS_LIST_ADDRESS" });
    } else {
      analytics.page({ title: "TXS_LIST_TXN" });
    }
  }, [address]);

  const page = Number(searchParams.get("page"));
  const currentPage = page >= 1 ? page : 1;
  const prevPage = useRef(currentPage);

  const q = address ? address : "txs";
  const isTxsFiltered = address ? true : false;
  const REFETCH_TIME = 1000 * 8;

  const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
  const [isPaginationLoading, setIsPaginationLoading] = useState<boolean>(true);
  const [addressChainId, setAddressChainId] = useState<ChainId | undefined>(undefined);
  const [parsedTxsData, setParsedTxsData] = useState<TransactionOutput[] | undefined>(undefined);

  const [liveMode, setLiveMode] = useLocalStorage<boolean>("liveMode", true);
  const [lastUpdatedList, setLastUpdatedList] =
    useState<{ txHash: string; status: string }[]>(null);

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

  const { data: chainLimitsData, isLoading: isLoadingLimits } = useQuery(["getLimit"], () =>
    getClient()
      .governor.getLimit()
      .catch(() => null),
  );

  const getOperationsInput: GetOperationsInput = {
    address,
    pagination: {
      page: currentPage - 1,
      pageSize: PAGE_SIZE,
      sortOrder: Order.DESC,
    },
    appId,
    exclusiveAppId,
    sourceChain,
    targetChain,
  };

  const { refetch, isLoading: isLoadingOperations } = useQuery(
    ["getTxs", getOperationsInput],
    () => getClient().guardianNetwork.getOperations(getOperationsInput),
    {
      refetchInterval: () => (liveMode && !address ? REFETCH_TIME : false),
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
              let symbol = tx?.data?.symbol;
              let payloadType = tx?.content?.payload?.payloadType;
              let tokenAmount = tx?.data?.tokenAmount;
              const timestamp = tx?.sourceChain?.timestamp || null;
              const txHash = tx?.sourceChain?.transaction?.txHash;

              const {
                appIds,
                fromAddress: stdFromAddress,
                fromChain: stdFromChain,
                toAddress: stdToAddress,
                toChain: stdToChain,
              } = standarizedProperties || {};

              const globalFrom = tx.sourceChain?.from;
              const globalToChainId = tx.targetChain?.chainId;
              const globalTo = tx.targetChain?.to;

              const parsedPayload = payload?.parsedPayload;
              const fromChainOrig = emitterChain || stdFromChain;
              const fromAddress = globalFrom || stdFromAddress;
              const toAddress = stdToAddress || globalTo;

              const attributeType = tx.sourceChain?.attribute?.type;
              const attributeValue = tx.sourceChain?.attribute?.value;

              // --- NTT Transfer
              if (appIds?.includes(NTT_APP_ID)) {
                payloadType = 1;

                const decimals =
                  tx.content?.payload?.nttMessage?.trimmedAmount?.decimals ||
                  tx.content?.payload?.parsedPayload?.nttMessage?.trimmedAmount?.decimals;

                tokenAmount = String(
                  +(
                    tx.content?.payload?.nttMessage?.trimmedAmount?.amount ||
                    tx.content?.payload?.parsedPayload?.nttMessage?.trimmedAmount?.amount
                  ) /
                    10 ** decimals,
                );

                // hotfix until backend tracks evm W tokens
                if (
                  tx.content?.standarizedProperties?.tokenAddress?.toLowerCase() ===
                  "0xB0fFa8000886e57F86dd5264b9582b2Ad87b2b91".toLowerCase()
                ) {
                  symbol = "W";
                }
              }
              // ---

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

              const isOutflow = sourceAddress?.toLowerCase() === address?.toLowerCase();
              const isInflow = targetAddress?.toLowerCase() === address?.toLowerCase();
              const isInOut = sourceAddress?.toLowerCase() === targetAddress?.toLowerCase();

              // --- Status Logic
              const isCCTP = appIds?.includes(CCTP_APP_ID);
              const isConnect = appIds?.includes(CONNECT_APP_ID);
              const isPortal = appIds?.includes(PORTAL_APP_ID);
              const isTBTC = !!appIds?.find(appId => appId.toLowerCase().includes("tbtc"));
              const isTransferWithPayload = false; /* payloadType === 3; */ // Operations has it
              const isAttestation = payloadType === 2;
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

              const limitDataForChain = chainLimitsData
                ? chainLimitsData.find((data: ChainLimit) => data.chainId === fromChain)
                : ETH_LIMIT;
              const transactionLimit = limitDataForChain?.maxTransactionSize;
              const isBigTransaction = transactionLimit <= Number(tx?.data?.usdAmount);
              const isDailyLimitExceeded =
                limitDataForChain?.availableNotional < Number(tx?.data?.usdAmount);

              const STATUS: IStatus = tx?.targetChain?.transaction?.txHash
                ? "COMPLETED"
                : appIds && appIds.includes(CCTP_MANUAL_APP_ID)
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
                : isBigTransaction || isDailyLimitExceeded
                ? "IN_GOVERNORS"
                : "IN_PROGRESS";

              // -----

              let statusChanged = false;
              let justAppeared = false;
              if (liveMode && prevPage.current === currentPage) {
                if (
                  lastUpdatedList &&
                  lastUpdatedList.find(a => a.txHash === parseTxHash && a.status !== STATUS)
                ) {
                  statusChanged = true;
                }

                if (lastUpdatedList && !lastUpdatedList.find(a => a.txHash === parseTxHash)) {
                  justAppeared = true;
                }
              }

              let portalDisplayed = false;

              const appIdsToDisplay =
                appIds?.length > 0
                  ? filterAppIds(appIds)
                      .map(appId => {
                        const iconSrc = protocolIcons[appId] || portalIcon;
                        if (iconSrc === portalIcon && portalDisplayed) {
                          return null;
                        }
                        portalDisplayed = iconSrc === portalIcon;
                        return iconSrc;
                      })
                      .filter(Boolean)
                  : [];

              const timestampDate = new Date(timestamp);
              const row = {
                VAAId: VAAId,
                justAppeared: justAppeared,
                txHashId: parseTxHash,
                statusString: STATUS,
                status: (
                  <StatusBadge
                    key={`${tx.sequence} ${STATUS}`}
                    className={statusChanged ? "appear" : ""}
                    size="responsive"
                    STATUS={STATUS}
                  />
                ),
                txHash: (
                  <div className="tx-hash">
                    <h4>TX HASH</h4>

                    {parseTxHash ? (
                      <>
                        <NavLink to={`/tx/${parseTxHash}`} onClick={stopPropagation}>
                          {shortAddress(parseTxHash).toUpperCase()}
                        </NavLink>
                        <CopyToClipboard toCopy={parseTxHash}>
                          <CopyIcon width={24} />
                        </CopyToClipboard>
                      </>
                    ) : (
                      <div className="not-found">-</div>
                    )}
                  </div>
                ),
                type: (
                  <div className="tx-type">
                    <h4>TYPE</h4>

                    <div>
                      {payloadType ? txType[payloadType] : <div className="not-found">-</div>}
                    </div>
                  </div>
                ),
                chains: (
                  <div className="tx-chains">
                    <h4>CHAINS</h4>

                    <div className="tx-chains-container">
                      <div className="tx-chains-container-item">
                        <Tooltip
                          tooltip={getChainName({ chainId: fromChain, network: currentNetwork })}
                          type="info"
                        >
                          <div>
                            <BlockchainIcon
                              chainId={fromChain}
                              network={currentNetwork}
                              size={24}
                            />
                          </div>
                        </Tooltip>
                        {sourceAddress && (
                          <>
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
                              <CopyIcon width={24} />
                            </CopyToClipboard>
                          </>
                        )}
                      </div>

                      {toChain && (
                        <>
                          <div className="tx-chains-container-arrow">
                            <ArrowRightIcon
                              className={`arrow-icon ${address ? "is-address" : ""}`}
                              width={24}
                            />

                            {address && !isAttestation && (isInOut || isOutflow || isInflow) && (
                              <div
                                className={`tx-chains-container-arrow-flow tx-chains-container-arrow-flow-${
                                  isInOut ? "self" : isOutflow ? "out" : "in"
                                }`}
                              >
                                {isInOut ? "SELF" : isOutflow ? "OUT" : "IN"}
                              </div>
                            )}
                          </div>

                          <div className="tx-chains-container-item">
                            <Tooltip
                              tooltip={getChainName({ chainId: toChain, network: currentNetwork })}
                              type="info"
                            >
                              <div>
                                <BlockchainIcon
                                  chainId={toChain}
                                  network={currentNetwork}
                                  size={24}
                                />
                              </div>
                            </Tooltip>
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
                              <CopyIcon width={24} />
                            </CopyToClipboard>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ),
                protocol: (
                  <div className="tx-protocol">
                    <h4>PROTOCOL</h4>

                    {appIds?.length > 0 ? (
                      <div className="tx-protocols-icons">
                        <Tooltip
                          maxWidth={false}
                          tooltip={<div>{formatAppIds(appIds)}</div>}
                          type="info"
                        >
                          <div>
                            {appIdsToDisplay.map(icon => (
                              <img
                                key={`${tx.sequence} ${icon}`}
                                src={icon}
                                alt="protocol icon"
                                height={24}
                                width={24}
                              />
                            ))}
                          </div>
                        </Tooltip>
                      </div>
                    ) : (
                      <div className="not-found">-</div>
                    )}
                  </div>
                ),
                viewDetails: (
                  <div className="tx-view-details">
                    <NavLink to={`/tx/${parseTxHash}`}>View details</NavLink>
                  </div>
                ),
                time: (
                  <div className="tx-time">
                    {timestampDate ? timeAgo(timestampDate) : <div className="not-found">-</div>}
                  </div>
                ),
              };

              tempRows.push(row);
            })
          : [];

        prevPage.current = currentPage;
        setLastUpdatedList(
          tempRows.map(a => ({
            txHash: a.txHashId,
            status: a.statusString,
          })),
        );
        setParsedTxsData(tempRows);
        setAddressChainId(addressChainId as ChainId);
        setIsPaginationLoading(false);
      },
      enabled: !errorCode && !isLoadingLimits,
    },
  );

  useEffect(() => {
    if (liveMode) {
      refetch();
    }
  }, [isTxsFiltered, liveMode, page, refetch]);

  return (
    <BaseLayout>
      <div className="txs-page" data-testid="txs-page">
        {errorCode ? (
          <SearchNotFound q={q} errorCode={errorCode} />
        ) : (
          <>
            <Top
              address={address}
              addressChainId={addressChainId}
              liveMode={liveMode}
              setLiveMode={setLiveMode}
            />
            <Information
              parsedTxsData={isPaginationLoading ? [] : parsedTxsData}
              currentPage={currentPage}
              onChangePagination={setCurrentPage}
              isPaginationLoading={isPaginationLoading || isLoadingOperations}
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
