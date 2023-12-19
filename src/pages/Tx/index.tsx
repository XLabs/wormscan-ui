import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Loader } from "src/components/atoms";
import { SearchNotFound } from "src/components/organisms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { fetchWithRpcFallThrough, getTokenInformation } from "src/utils/fetchWithRPCsFallthrough";
import { formatUnits, parseTx } from "src/utils/crypto";
import { ChainId } from "src/api";
import { getClient } from "src/api/Client";
import analytics from "src/analytics";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import { GetBlockData } from "src/api/search/types";
import { getGuardianSet } from "../../consts";
import { Information } from "./Information";
import { Top } from "./Top";
import "./styles.scss";
import { getChainName } from "src/utils/wormhole";

const Tx = () => {
  useEffect(() => {
    analytics.page({ title: "TX_DETAIL" });
  }, []);

  const { txHash, chainId, emitter, seq } = useParams();
  const { environment } = useEnvironment();
  const network = environment.network;

  // pattern match the search value to see if it's a candidate for being an EVM transaction hash.
  const search = txHash ? (txHash.startsWith("0x") ? txHash : "0x" + txHash) : "";
  const isEvmTxHash = !!search.match(/0x[0-9a-fA-F]{64}/);

  const VAAId: string = `${chainId}/${emitter}/${seq}`;
  const isTxHashSearch = Boolean(txHash);
  const isVAAIdSearch = Boolean(chainId) && Boolean(emitter) && Boolean(seq);
  const q = isVAAIdSearch ? VAAId : txHash;
  const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRPC, setIsRPC] = useState(false);
  const [emitterChainId, setEmitterChainId] = useState<ChainId | undefined>(undefined);
  const [extraRawInfo, setExtraRawInfo] = useState(null);
  const [blockData, setBlockData] = useState<GetBlockData>(null);

  const cancelRequests = useRef(false);
  const tryToGetRpcInfo = async () => {
    const txsData = await fetchWithRpcFallThrough(environment, txHash);

    if (txsData) {
      const txData = await txsData[0];
      if (txData) {
        cancelRequests.current = true;

        analytics.track("txDetail", {
          appIds: txData?.appIds?.join(", ") ? txData.appIds.join(", ") : "null",
          chain: getChainName({ chainId: txData?.chain ?? 0, network }),
          toChain: getChainName({ chainId: txData?.toChain ?? 0, network }),
          network,
        });

        // setParsedVAAsData([
        //   {
        //     appId: "",
        //     decodedVaa: null,
        //     emitterAddr: txData.emitterAddress,
        //     emitterChain: txData.tokenChain,
        //     emitterNativeAddr: txData.emitterNattiveAddress,
        //     guardianSetIndex: null,
        //     id: txData.id,
        //     indexedAt: null,
        //     payload: null,
        //     sequence: txData.sequence,
        //     timestamp: new Date(txData.timestamp),
        //     txHash: txData.txHash,
        //     updatedAt: null,
        //     vaa: "",
        //     version: 1,
        //   },
        // ]);
        setIsRPC(true);
        setEmitterChainId(txData.chain as ChainId);
        setTxData([
          {
            emitterAddress: {
              hex: txData.emitterAddress,
              native: txData.emitterNattiveAddress,
            },
            emitterChain: txData.chain,
            id: txData.id,
            content: {
              payload: {
                payloadType: txData.payloadType,
                parsedPayload: {
                  feeAmount: txData?.fee,
                  toNativeAmount: txData?.toNativeAmount,
                },
                amount: txData.amount,
                fee: txData.fee,
                fromAddress: txData.fromAddress,
                payload: undefined,
                toAddress: txData.toAddress,
                toChain: txData.toChain,
                tokenAddress: txData.tokenAddress,
                tokenChain: txData.tokenChain,
              },
              standarizedProperties: {
                amount: txData.amount,
                appIds: txData.appIds ?? [],
                fee: txData.fee,
                feeAddress: "",
                feeChain: txData.chain,
                fromAddress: txData.fromAddress,
                fromChain: txData.chain,
                toAddress: txData.toAddress,
                toChain: txData.toChain,
                tokenAddress: txData.tokenAddress,
                tokenChain: txData.tokenChain,
              },
            },
            data: {
              symbol: txData.symbol,
              tokenAmount: txData.tokenAmount,
              usdAmount: txData.usdAmount,
            },
            sequence: "",
            sourceChain: {
              chainId: txData.chain,
              timestamp: new Date(txData.timestamp),
              from: txData.fromAddress,
              status: undefined,
              transaction: {
                txHash: txData.txHash,
              },
            },
            targetChain: {
              chainId: txData.toChain,
              timestamp: undefined,
              transaction: undefined,
              from: undefined,
              status: undefined,
              to: undefined,
            },
            vaa: undefined,
          },
        ]);
        setBlockData({
          currentBlock: txData.blockNumber,
          lastFinalizedBlock: txData.lastFinalizedBlock,
        });

        if (txData.extraRawInfo) setExtraRawInfo(txData.extraRawInfo);
        setErrorCode(undefined);
        setIsLoading(false);
      } else {
        cancelRequests.current = false;
      }
    } else {
      cancelRequests.current = false;
    }
  };

  useEffect(() => {
    setErrorCode(undefined);
    setIsLoading(true);
  }, [txHash, chainId, emitter, seq]);

  const showSearchNotFound = (err: Error) => {
    let statusCode = 404;
    if (err?.message && !isNaN(Number(err?.message?.match(/\d+/)?.[0]))) {
      // get the status code from the error message
      statusCode = parseInt(err?.message?.match(/\d+/)?.[0], 10);
    }
    setErrorCode(statusCode);
    setIsLoading(false);
  };

  const [failCount, setFailCount] = useState(0);
  const { data: VAADataByTx } = useQuery(
    ["getVAAbyTxHash", txHash],
    async () => {
      const response = await getClient().guardianNetwork.getOperations({
        txHash: txHash,
      });

      if (!response.length) throw new Error("no data");
      return response;
    },
    {
      onSettled: async (data, error: Error) => {
        setFailCount(0);
        if ((error || data.length === 0) && !cancelRequests.current) {
          showSearchNotFound(error);
        }
      },
      enabled: isTxHashSearch && !errorCode,
      onSuccess: data => {
        if (!!data.length) {
          setErrorCode(undefined);
        }
      },
      retryDelay: errCount => 5000 * (errCount + 1),
      retry: errCount => {
        // if request was cancelled, dont retry
        if (cancelRequests.current) return false;

        // first error, retry on every case
        if (errCount === 0) return true;

        // second error, if hash is evm-like, hit rpcs
        if (errCount === 1 && isEvmTxHash) tryToGetRpcInfo();

        setFailCount(errCount);
        // more than three fails, stop retrying
        if (errCount > 3) {
          return false;
        }
        return true;
      },
    },
  );

  const { data: VAADataByVAAId } = useQuery(
    ["getVAA", VAAId],
    async () => {
      if (isNaN(Number(chainId)) || isNaN(Number(seq))) {
        throw new Error("Request failed with status code 400");
      }

      const result = await getClient().guardianNetwork.getOperations({
        vaaID: `${chainId}/${emitter}/${seq}`,
      });

      return result;
    },
    {
      onError: (err: Error) => showSearchNotFound(err),
      onSuccess: data => {
        if (!!data?.length) {
          setErrorCode(undefined);
        }
      },
      enabled: isVAAIdSearch && !errorCode,
      retry: false,
    },
  );

  const VAAData = useMemo(() => {
    if (isTxHashSearch) {
      return VAADataByTx;
    } else {
      if (VAADataByVAAId) return VAADataByVAAId;
      return null;
    }
  }, [isTxHashSearch, VAADataByTx, VAADataByVAAId]);

  const VAADataTxHash = VAAData?.[0]?.sourceChain?.transaction?.txHash;

  const [txData, setTxData] = useState<GetOperationsOutput[]>([]);
  const processVaaData = useCallback(
    async (txData: GetOperationsOutput[]) => {
      // process operations endpoint response
      const processedApiTxData: GetOperationsOutput[] = [];

      // first step, if it doesnt come and its possible, get amount and symbol
      for (const data of txData) {
        if (
          (!data.data?.tokenAmount || !data.data?.symbol) &&
          data.content?.standarizedProperties?.tokenAddress &&
          data.content?.standarizedProperties?.tokenChain &&
          data.content?.standarizedProperties?.amount
        ) {
          const tokenInfo = await getTokenInformation(
            data.content?.standarizedProperties?.tokenChain,
            environment,
            data.content?.standarizedProperties?.tokenAddress,
          );

          if (tokenInfo.symbol /* && tokenInfo.tokenDecimals */) {
            const amount = data.content?.standarizedProperties?.amount;

            if (amount /* && tokenInfo.tokenDecimals */) {
              processedApiTxData.push({
                ...data,
                data: {
                  tokenAmount: "" + formatUnits(+amount /* , tokenInfo.tokenDecimals */),
                  symbol: tokenInfo.symbol,
                  usdAmount: data?.data?.usdAmount ? data?.data?.usdAmount : "",
                },
              });
            }
          } else {
            processedApiTxData.push(data);
          }
        } else {
          processedApiTxData.push(data);
        }
      }

      // second, check specific cases
      processedApiTxData.forEach(async (data, idx) => {
        // check CCTP
        if (data?.content?.standarizedProperties?.appIds?.includes("CCTP_WORMHOLE_INTEGRATION")) {
          // if the amount is not there, we get it from the payload
          //     (we assume 6 decimals because its always USDC)
          if (
            (!data?.data?.tokenAmount || !data?.content?.standarizedProperties?.amount) &&
            !!data?.content?.payload?.amount
          ) {
            data.data = {
              tokenAmount: String(+data?.content?.payload?.amount * 0.000001),
              symbol: "USDC",
              usdAmount: "",
            };

            if (data?.content?.standarizedProperties) {
              data.content.standarizedProperties.amount = String(
                +data?.content?.payload?.amount * 100,
              );
            }
          }

          // the fee for CCTP is feeAmount (fee) + toNativeAmount (gas drop)
          if (data?.content?.payload?.parsedPayload?.feeAmount) {
            data.content.standarizedProperties.fee = `${
              +data?.content?.payload?.parsedPayload.feeAmount * 100 +
              +data?.content?.payload?.parsedPayload.toNativeAmount * 100
            }`;
          }

          // get CCTP relayer information
          const relayResponse = await getClient().search.getCctpRelay({
            txHash: parseTx({ value: data.sourceChain?.transaction?.txHash, chainId: 2 }),
            network: network,
          });

          // add Redeem Txn information to the tx response
          if (relayResponse?.to?.txHash) {
            data.targetChain = {
              chainId: relayResponse.to.chainId,
              status: relayResponse.status,
              timestamp: relayResponse.metrics?.completedAt,
              transaction: {
                txHash: relayResponse.to.txHash,
              },
              from: relayResponse.to.txHash,
              to: "",
            };

            setExtraRawInfo(relayResponse);
          }
        }

        // track analytics on non-rpc and non-generic-relayer txs (those are tracked on other place)
        if (!data?.content?.standarizedProperties?.appIds?.includes("GENERIC_RELAYER")) {
          analytics.track("txDetail", {
            appIds: data?.content?.standarizedProperties?.appIds?.join(", ")
              ? data?.content?.standarizedProperties.appIds.join(", ")
              : "null",
            chain: getChainName({ chainId: data?.emitterChain ?? 0, network }),
            toChain: getChainName({
              chainId: data?.content?.standarizedProperties?.toChain ?? 0,
              network,
            }),
            network,
          });
        }

        processedApiTxData[idx] = { ...data };
        setIsLoading(false);
      });

      // third step, process other information
      // TODO: BACKEND SUPPORT

      // processedApiTxData.forEach((data, idx) => {
      //   const vaa = data?.vaa;
      //   if (!vaa) return;

      //   const guardianSetIndex = tx.guardianSetIndex;
      //   // Decode SignedVAA and get guardian signatures with name
      //   const guardianSetList = getGuardianSet(guardianSetIndex);
      //   const vaaBuffer = Buffer.from(vaa, "base64");
      //   const parsedVaa = parseVaa(vaaBuffer);

      //   const { emitterAddress, guardianSignatures, hash, sequence } = parsedVaa || {};
      //   const parsedEmitterAddress = Buffer.from(emitterAddress).toString("hex");
      //   const parsedHash = Buffer.from(hash).toString("hex");
      //   const parsedSequence = Number(sequence);
      //   const parsedGuardianSignatures = guardianSignatures?.map(({ index, signature }) => ({
      //     index,
      //     signature: Buffer.from(signature).toString("hex"),
      //     name: guardianSetList?.[index]?.name,
      //   }));

      //   return {
      //     ...tx,
      //     vaa,
      //     decodedVaa: {
      //       ...parsedVaa,
      //       payload: parsedVaa.payload ? Buffer.from(parsedVaa.payload).toString("hex") : null,
      //       emitterAddress: parsedEmitterAddress,
      //       guardianSignatures: parsedGuardianSignatures,
      //       hash: parsedHash,
      //       sequence: parsedSequence,
      //     },
      //   };
      // })

      // return txResponse;

      // const results = await Promise.all(result);
      // return results;

      setEmitterChainId(processedApiTxData.find(a => !!a?.emitterChain)?.emitterChain);
      setTxData(processedApiTxData);
    },
    [environment, network],
  );

  useEffect(() => {
    if (!VAAData) return;
    setErrorCode(undefined);

    processVaaData(VAAData);
  }, [VAAData, processVaaData]);

  return (
    <BaseLayout>
      <div className="tx-page">
        {errorCode ? (
          <SearchNotFound q={q} errorCode={errorCode} />
        ) : isLoading ? (
          <>
            <Loader />
            <p style={{ textAlign: "center", marginBottom: "48px" }}>
              {failCount === 1 && "We are searching..."}
              {failCount === 2 && "Still on it..."}
              {failCount === 3 && "We haven't found anything yet..."}
            </p>
          </>
        ) : (
          <>
            <Top
              txHash={VAADataTxHash ?? txData?.[0]?.sourceChain?.transaction?.txHash}
              emitterChainId={emitterChainId}
              gatewayInfo={txData?.[0]?.sourceChain?.attribute?.value}
              payloadType={txData?.[0]?.content?.payload?.payloadType}
            />
            {txData?.map(
              (data, i) =>
                txData && (
                  <Information
                    key={data.id || `vaa-${i}`}
                    extraRawInfo={extraRawInfo}
                    data={data}
                    isRPC={isRPC}
                    blockData={blockData}
                  />
                ),
            )}
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export default Tx;
