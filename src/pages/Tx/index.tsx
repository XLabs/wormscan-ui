import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { parseVaa } from "@certusone/wormhole-sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Loader } from "src/components/atoms";
import { SearchNotFound } from "src/components/organisms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { fetchWithRpcFallThrough } from "src/utils/fetchWithRPCsFallthrough";
import { parseTx } from "src/utils/crypto";
import { ChainId } from "src/api";
import { getClient } from "src/api/Client";
import { GlobalTxOutput, VAADetail } from "src/api/guardian-network/types";
import { GetBlockData, GetTransactionsOutput } from "src/api/search/types";
import { getGuardianSet } from "../../consts";
import { Information } from "./Information";
import { Top } from "./Top";
import "./styles.scss";
import analytics from "src/analytics";

type ParsedVAA = VAADetail & { vaa: any; decodedVaa: any };

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
  const [emitterChainId, setEmitterChainId] = useState<ChainId | undefined>(undefined);
  const [parsedVAAsData, setParsedVAAsData] = useState<ParsedVAA[] | undefined>(undefined);
  const [extraRawInfo, setExtraRawInfo] = useState(null);
  const [blockData, setBlockData] = useState<GetBlockData>(null);

  const cancelRequests = useRef(false);
  const tryToGetRpcInfo = async () => {
    const txsData = await fetchWithRpcFallThrough(environment, txHash);

    if (txsData) {
      const txData = await txsData[0];
      if (txData) {
        cancelRequests.current = true;

        setParsedVAAsData([
          {
            appId: "",
            decodedVaa: null,
            emitterAddr: txData.emitterAddress,
            emitterChain: txData.tokenChain,
            emitterNativeAddr: txData.emitterNattiveAddress,
            guardianSetIndex: null,
            id: txData.id,
            indexedAt: null,
            payload: null,
            sequence: txData.sequence,
            timestamp: new Date(txData.timestamp),
            txHash: txData.txHash,
            updatedAt: null,
            vaa: "",
            version: 1,
          },
        ]);
        setEmitterChainId(txData.chain as ChainId);
        setTxData([
          {
            emitterAddress: txData.emitterAddress,
            emitterChain: txData.chain,
            emitterNativeAddress: txData.emitterNattiveAddress,
            globalTx: null,
            id: txData.id,
            payload: {
              payloadType: txData.payloadType,
              parsedPayload: {
                feeAmount: txData?.fee,
                toNativeAmount: txData?.toNativeAmount,
              },
            },
            standardizedProperties: {
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
            symbol: txData.symbol,
            timestamp: new Date(txData.timestamp),
            tokenAmount: txData.tokenAmount,
            txHash: txData.txHash,
            usdAmount: txData.usdAmount,
          },
        ]);
        setBlockData({
          currentBlock: txData.blockNumber,
          lastFinalizedBlock: txData.lastFinalizedBlock,
        });

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
      const response = await getClient().guardianNetwork.getVAAbyTxHash({
        query: {
          txHash: txHash,
          parsedPayload: true,
        },
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

  const { data: VAADataByVAAId }: { data: VAADetail } = useQuery(
    ["getVAA", VAAId],
    () => {
      if (isNaN(Number(chainId)) || isNaN(Number(seq))) {
        throw new Error("Request failed with status code 400");
      }

      return getClient().guardianNetwork.getVAA({
        chainId: Number(chainId),
        emitter,
        seq: Number(seq),
        query: {
          parsedPayload: true,
        },
      });
    },
    {
      onError: (err: Error) => showSearchNotFound(err),
      enabled: isVAAIdSearch && !errorCode,
      retry: false,
    },
  );

  const VAAData = useMemo(() => {
    if (isTxHashSearch) {
      return VAADataByTx;
    } else {
      if (VAADataByVAAId) return [VAADataByVAAId];
      return null;
    }
  }, [isTxHashSearch, VAADataByTx, VAADataByVAAId]);

  const VAADataTxHash = VAAData?.[0]?.txHash;

  const [txData, setTxData] = useState<GetTransactionsOutput[]>([]);
  const { data: apiTxData, refetch: refetchTxData } = useQuery(
    ["getTransactions", isTxHashSearch ? txHash : VAAId],
    async () => {
      const result = VAAData.map(async tx => {
        const VAADataId = tx.id;
        const VAADataVaaId = VAADataId.split("/");
        const VaaDataChainId = Number(VAADataVaaId?.[0]);
        const VaaDataEmitter = VAADataVaaId?.[1];
        const VaaDataSeq = Number(VAADataVaaId?.[2]);

        const txResponse = await getClient().search.getTransactions({
          chainId: VaaDataChainId,
          emitter: VaaDataEmitter,
          seq: VaaDataSeq,
        });

        // check CCTP
        if (txResponse?.standardizedProperties?.appIds?.includes("CCTP_WORMHOLE_INTEGRATION")) {
          // if the amount is not there, we get it from the payload
          //     (we assume 6 decimals because its always USDC)
          if (
            (!txResponse.tokenAmount || !txResponse.standardizedProperties?.amount) &&
            !!txResponse.payload?.amount
          ) {
            txResponse.tokenAmount = String(+txResponse.payload?.amount * 0.000001);
            txResponse.standardizedProperties.amount = String(+txResponse.payload?.amount * 100);
            if (!txResponse.symbol) {
              txResponse.symbol = "USDC";
            }
          }

          // the fee for CCTP is feeAmount (fee) + toNativeAmount (gas drop)
          if (txResponse.payload?.parsedPayload?.feeAmount) {
            txResponse.standardizedProperties.fee = `${
              +txResponse.payload.parsedPayload.feeAmount * 100 +
              +txResponse.payload.parsedPayload.toNativeAmount * 100
            }`;
          }

          // get CCTP relayer information
          const relayResponse = await getClient().search.getCctpRelay({
            txHash: parseTx({ value: txResponse.txHash, chainId: 2 }),
            network: network,
          });

          // add Redeem Txn information to the tx response
          if (relayResponse?.to?.txHash) {
            const cctpDestination: GlobalTxOutput["destinationTx"] = {
              chainId: relayResponse.to.chainId,
              status: relayResponse.status,
              timestamp: relayResponse.metrics?.completedAt,
              txHash: relayResponse.to.txHash,
              updatedAt: relayResponse.metrics?.completedAt,

              blockNumber: null,
              from: null,
              method: null,
              to: null,
            };

            if (txResponse.globalTx) {
              txResponse.globalTx.destinationTx = cctpDestination;
            } else {
              txResponse.globalTx = {
                id: null,
                originTx: null,
                destinationTx: cctpDestination,
              };
            }
            setExtraRawInfo(relayResponse);
          }
        }

        if (!txResponse?.standardizedProperties?.appIds?.includes("GENERIC_RELAYER")) {
          analytics.track("txDetail", {
            appIds: txResponse?.standardizedProperties?.appIds ?? "null",
            fromChain: txResponse?.emitterChain ?? "null",
            toChain: txResponse?.standardizedProperties?.toChain ?? "null",
          });
        }

        return txResponse;
      });

      const results = await Promise.all(result);
      return results;
    },
    {
      enabled: false,
      onSuccess: data => {
        if (!!data.length) {
          setErrorCode(undefined);
          setIsLoading(false);
        }
      },
      onError: (err: Error) => showSearchNotFound(err),
    },
  );

  useEffect(() => {
    if (apiTxData && apiTxData.length > 0) {
      setTxData(apiTxData);
    }
  }, [apiTxData]);

  useEffect(() => {
    if (!VAAData) return;
    setErrorCode(undefined);
    refetchTxData();
  }, [VAAData, refetchTxData]);

  const { payload } = txData?.find(tx => !!tx.payload) || {};
  const { payloadType } = payload || {};

  const processVAA = useCallback(async () => {
    const result = VAAData.map(async tx => {
      const vaa = tx.vaa;
      if (!vaa) return;

      const guardianSetIndex = tx.guardianSetIndex;
      // Decode SignedVAA and get guardian signatures with name
      const guardianSetList = getGuardianSet(guardianSetIndex);
      const vaaBuffer = Buffer.from(vaa, "base64");
      const parsedVaa = parseVaa(vaaBuffer);

      const { emitterAddress, guardianSignatures, hash, sequence } = parsedVaa || {};
      const parsedEmitterAddress = Buffer.from(emitterAddress).toString("hex");
      const parsedHash = Buffer.from(hash).toString("hex");
      const parsedSequence = Number(sequence);
      const parsedGuardianSignatures = guardianSignatures?.map(({ index, signature }) => ({
        index,
        signature: Buffer.from(signature).toString("hex"),
        name: guardianSetList?.[index]?.name,
      }));

      return {
        ...tx,
        vaa,
        decodedVaa: {
          ...parsedVaa,
          payload: parsedVaa.payload ? Buffer.from(parsedVaa.payload).toString("hex") : null,
          emitterAddress: parsedEmitterAddress,
          guardianSignatures: parsedGuardianSignatures,
          hash: parsedHash,
          sequence: parsedSequence,
        },
      };
    });

    const results = await Promise.all(result);
    setParsedVAAsData(results);
    setEmitterChainId(results.find(a => !!a?.emitterChain)?.emitterChain);
  }, [VAAData]);

  useEffect(() => {
    if (VAAData) {
      processVAA();
    }
  }, [VAAData, processVAA]);

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
              txHash={VAADataTxHash ?? txData?.[0]?.txHash}
              emitterChainId={emitterChainId}
              gatewayInfo={txData?.[0]?.globalTx?.originTx?.attribute?.value}
              payloadType={payloadType}
            />
            {parsedVAAsData?.map(
              parsedVAAData =>
                txData && (
                  <Information
                    key={parsedVAAData.id}
                    extraRawInfo={extraRawInfo}
                    VAAData={parsedVAAData}
                    txData={txData.find(tx => tx.id === parsedVAAData.id)}
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
