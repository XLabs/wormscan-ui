import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BlockchainIcon, NavLink, ProtocolIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard, StatusBadge } from "src/components/molecules";
import { SearchNotFound } from "src/components/organisms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { formatAppIds, parseAddress, parseTx, shortAddress } from "src/utils/crypto";
import { timeAgo } from "src/utils/date";
import { ArrowRightIcon, CopyIcon, TxFlowSelfH } from "src/icons/generic";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { ChainLimit, Order } from "src/api";
import { ChainId, deserialize } from "@wormhole-foundation/sdk";
import { getClient } from "src/api/Client";
import { GetOperationsInput, GetOperationsOutput } from "src/api/guardian-network/types";
import { Information } from "./Information";
import analytics from "src/analytics";
import {
  C3_APP_ID,
  CCTP_APP_ID,
  CCTP_MANUAL_APP_ID,
  CONNECT_APP_ID,
  IStatus,
  NTT_APP_ID,
  PORTAL_APP_ID,
  UNKNOWN_APP_ID,
  canWeGetDestinationTx,
  txType,
} from "src/consts";
import { useLocalStorage } from "src/utils/hooks";
import { formatNumber } from "src/utils/number";
import { Top } from "./Top";

export interface TransactionOutput {
  VAAId: string;
  justAppeared: boolean;
  txHashId: string;
  statusString: string;
  status: React.ReactNode;
  txHash: React.ReactNode;
  type: React.ReactNode;
  from: React.ReactNode;
  to: React.ReactNode;
  sourceChain: React.ReactNode;
  tokenName: React.ReactNode;
  tokenAddress: React.ReactNode;
  protocol: React.ReactNode;
  viewDetails?: React.ReactNode;
  time: React.ReactNode;
}

export interface IParams {
  page: string | null;
  address: string | null;
  appId: string | null;
  exclusiveAppId: string | null;
  sourceChain: string | null;
  targetChain: string | null;
  payloadType: string | null;
  from: string | null;
  to: string | null;
}

export const PAGE_SIZE = 50;

export const ETH_LIMIT = {
  maxTransactionSize: 5000000,
  availableNotional: 50000000,
};

const Txs = () => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const [searchParams, setSearchParams] = useSearchParams();
  const params: IParams = {
    page: searchParams.get("page") || null,
    address: searchParams.get("address") || null,
    appId: searchParams.get("appId") || null,
    exclusiveAppId: searchParams.get("exclusiveAppId") || null,
    sourceChain: searchParams.get("sourceChain") || null,
    targetChain: searchParams.get("targetChain") || null,
    payloadType: searchParams.get("payloadType") || null,
    from: searchParams.get("from") || null,
    to: searchParams.get("to") || null,
  };

  useEffect(() => {
    if (params.address) {
      analytics.page({ title: "TXS_LIST_ADDRESS" });
    } else {
      analytics.page({ title: "TXS_LIST_TXN" });
    }
  }, [params.address]);

  const page = Number(params.page) || 1;
  const currentPage = page >= 1 ? page : 1;
  const prevPage = useRef(currentPage);

  const q = params.address ? params.address : "txs";
  const isTxsFiltered = params.address ? true : false;
  const REFETCH_TIME = 1000 * 8;

  const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
  const [isPaginationLoading, setIsPaginationLoading] = useState<boolean>(true);
  const [addressChainId, setAddressChainId] = useState<ChainId | undefined>(undefined);
  const [parsedTxsData, setParsedTxsData] = useState<TransactionOutput[] | undefined>(undefined);

  const [liveMode, setLiveMode] = useLocalStorage<boolean>("liveMode", true);
  const showLiveMode = !params.address && !params.from && !params.to;
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
  }, [params.address]);

  useEffect(() => {
    setIsPaginationLoading(true);
  }, [currentNetwork, currentPage]);

  const { data: chainLimitsData, isLoading: isLoadingLimits } = useQuery(["getLimit"], () =>
    getClient()
      .governor.getLimit()
      .catch(() => null),
  );

  const getOperationsInput: GetOperationsInput = {
    address: params.address,
    pagination: {
      page: currentPage - 1,
      pageSize: PAGE_SIZE,
      sortOrder: Order.DESC,
    },
    appId: params.appId,
    exclusiveAppId: params.exclusiveAppId,
    sourceChain: params.sourceChain,
    targetChain: params.targetChain,
    payloadType: params.payloadType,
    from: params.from,
    to: params.to,
  };

  const { refetch, isLoading: isLoadingOperations } = useQuery(
    ["getTxs", getOperationsInput],
    () => getClient().guardianNetwork.getOperations(getOperationsInput),
    {
      refetchInterval: () => (liveMode && showLiveMode ? REFETCH_TIME : false),
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
          String(params.address).toLowerCase() === String(originAddress).toLowerCase()
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
                tokenChain: stdTokenChain,
                tokenAddress: stdTokenAddress,
                fee: stdFee,
                amount: stdAmount,
              } = standarizedProperties || {};

              const { symbol: tokenName } = payload || {};
              const sourceTokenLink = getExplorerLink({
                network: currentNetwork,
                chainId: stdTokenChain,
                value: stdTokenAddress,
                base: "token",
              });

              const globalFrom = tx.sourceChain?.from;
              const globalToChainId = tx.targetChain?.chainId;
              const globalTo = tx.targetChain?.to;

              const parsedPayload = payload?.parsedPayload;
              const fromChainOrig = emitterChain || stdFromChain;
              const fromAddress = globalFrom || stdFromAddress;
              const toAddress = stdToAddress || globalTo;

              const attributeType = tx.sourceChain?.attribute?.type;
              const attributeValue = tx.sourceChain?.attribute?.value;

              // --- Check C3
              if (
                tx?.content?.standarizedProperties?.appIds?.includes(PORTAL_APP_ID) &&
                (tx?.sourceChain?.from ===
                  "BM26KC3NHYQ7BCDWVMP2OM6AWEZZ6ZGYQWKAQFC7XECOUBLP44VOYNBQTA" ||
                  tx?.sourceChain?.from ===
                    "W7MQDZ6ZCBODX63NRIS6FMU5G7YYHDIK32TAAIJAWGPWDAO44GPQS6S3LU") &&
                !tx?.content?.standarizedProperties?.appIds?.includes(C3_APP_ID)
              ) {
                tx.content.standarizedProperties.appIds.push(C3_APP_ID);
              }

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

              const isOutflow = sourceAddress?.toLowerCase() === params.address?.toLowerCase();
              const isInflow = targetAddress?.toLowerCase() === params.address?.toLowerCase();
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

              const status: IStatus = tx?.targetChain?.transaction?.txHash
                ? "completed"
                : appIds && appIds.includes(CCTP_MANUAL_APP_ID)
                ? "external_tx"
                : tx.vaa?.raw
                ? isConnect || isPortal || isCCTP
                  ? (canWeGetDestinationTx(toChain) &&
                      !hasAnotherApp &&
                      (!isTransferWithPayload ||
                        (isTransferWithPayload && isConnect) ||
                        (isTransferWithPayload && isTBTC))) ||
                    isCCTP
                    ? "pending_redeem"
                    : "vaa_emitted"
                  : "vaa_emitted"
                : isBigTransaction || isDailyLimitExceeded
                ? "in_governors"
                : "in_progress";

              // -----

              let statusChanged = false;
              let justAppeared = false;
              if (liveMode && prevPage.current === currentPage) {
                if (
                  lastUpdatedList &&
                  lastUpdatedList.find(a => a.txHash === parseTxHash && a.status !== status)
                ) {
                  statusChanged = true;
                }

                if (lastUpdatedList && !lastUpdatedList.find(a => a.txHash === parseTxHash)) {
                  justAppeared = true;
                }
              }

              const vaaBuffer = tx?.vaa?.raw ? Buffer.from(tx.vaa.raw, "base64") : null;
              const parsedVaa = vaaBuffer ? deserialize("Uint8Array", vaaBuffer) : null;
              const vaaTimestamp = parsedVaa ? parsedVaa?.timestamp * 1000 : null;
              const timestampDate = timestamp
                ? new Date(timestamp)
                : vaaTimestamp
                ? new Date(vaaTimestamp)
                : null;

              const row = {
                VAAId: VAAId,
                justAppeared: justAppeared,
                txHashId: parseTxHash,
                statusString: status,
                status: (
                  <StatusBadge
                    key={`${tx.sequence} ${status}`}
                    className={statusChanged ? "appear" : ""}
                    size="responsive"
                    status={status}
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
                          <CopyIcon />
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
                sourceChain: (
                  <div className="tx-chains">
                    <h4>SOURCE CHAIN</h4>

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

                        <div className="tx-chains-container-item-box">
                          {sourceAddress && (
                            <>
                              <div className="tx-chains-container-item-box-address">
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
                                  <CopyIcon />
                                </CopyToClipboard>
                              </div>

                              {tokenAmount && (
                                <div className="tx-chains-container-item-box-amount">
                                  {formatNumber(Number(tokenAmount)) +
                                    " " +
                                    (symbol ? symbol : "N/A")}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
                from: (
                  <div className="tx-chains">
                    <h4>FROM</h4>

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

                        <div className="tx-chains-container-item-box">
                          {sourceAddress && (
                            <>
                              <div className="tx-chains-container-item-box-address">
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
                                  <CopyIcon />
                                </CopyToClipboard>
                              </div>

                              {tokenAmount && (
                                <div className="tx-chains-container-item-box-amount">
                                  {formatNumber(Number(tokenAmount)) +
                                    " " +
                                    (symbol ? symbol : "N/A")}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {!isAttestation && toChain && (
                        <>
                          <div className="tx-chains-container-arrow">
                            {(!params.address || !isInOut) && (
                              <ArrowRightIcon className={params.address ? "is-address" : ""} />
                            )}

                            {params.address && (isInOut || isOutflow || isInflow) && (
                              <div
                                className={`tx-chains-container-arrow-flow tx-chains-container-arrow-flow-${
                                  isInOut ? "self" : isOutflow ? "out" : "in"
                                }`}
                              >
                                {isInOut ? <TxFlowSelfH /> : isOutflow ? "OUT" : "IN"}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ),
                to: (
                  <div className="tx-chains">
                    <h4>{"TO"}</h4>

                    {toChain && targetAddress ? (
                      <div className="tx-chains-container">
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

                          <div className="tx-chains-container-item-box">
                            <div className="tx-chains-container-item-box-address">
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
                                <CopyIcon />
                              </CopyToClipboard>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="not-found">-</div>
                    )}
                  </div>
                ),
                tokenName: (
                  <div className="tx-chains">
                    <h4>TOKEN NAME</h4>

                    <div className="tx-chains-container">
                      <div className="tx-chains-container-item">
                        {tokenName &&
                          (sourceTokenLink ? (
                            <a
                              href={sourceTokenLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={stopPropagation}
                            >
                              {tokenName}
                            </a>
                          ) : (
                            <span>{tokenName}</span>
                          ))}
                      </div>
                    </div>
                  </div>
                ),
                tokenAddress: (
                  <div className="tx-chains">
                    <h4>TOKEN ADDRESS</h4>

                    <div className="tx-chains-container">
                      {sourceAddress && (
                        <div className="tx-chains-container-item">
                          <div className="tx-chains-container-item-box">
                            <div className="tx-chains-container-item-box-address">
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
                                <CopyIcon />
                              </CopyToClipboard>
                            </div>
                          </div>
                        </div>
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
                          <div className="tx-protocols-icons-content">
                            {appIds.map(icon => (
                              <ProtocolIcon key={icon} protocol={icon} />
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
              address={params.address}
              addressChainId={addressChainId}
              liveMode={liveMode}
              setLiveMode={setLiveMode}
              showLiveMode={showLiveMode}
            />
            <Information
              parsedTxsData={isPaginationLoading ? [] : parsedTxsData}
              currentPage={currentPage}
              onChangePagination={setCurrentPage}
              isPaginationLoading={isPaginationLoading || isLoadingOperations}
              setIsPaginationLoading={setIsPaginationLoading}
              isTxsFiltered={isTxsFiltered}
              params={params}
            />
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export default Txs;
