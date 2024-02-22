import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { parseVaa } from "@certusone/wormhole-sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Loader } from "src/components/atoms";
import { SearchNotFound } from "src/components/organisms";
import { BaseLayout } from "src/layouts/BaseLayout";
import {
  fetchWithRpcFallThrough,
  getTokenInformation,
  getUsdcAddress,
} from "src/utils/fetchWithRPCsFallthrough";
import { formatUnits, parseTx } from "src/utils/crypto";
import { ChainId } from "src/api";
import { getClient } from "src/api/Client";
import analytics from "src/analytics";
import { GlobalTxOutput, VAADetail } from "src/api/guardian-network/types";
import { GetBlockData, GetTransactionsOutput } from "src/api/search/types";
import { getGuardianSet } from "../../consts";
import { Information } from "./Information";
import { Top } from "./Top";
import "./styles.scss";
import { getChainName } from "src/utils/wormhole";
import { getAlgorandTokenInfo, tryGetWrappedToken } from "src/utils/cryptoToolkit";
import { getPorticoInfo, isPortico } from "src/utils/wh-portico-rpc";
import { useRecoilState } from "recoil";
import { showSourceTokenUrlState, showTargetTokenUrlState } from "src/utils/recoilStates";

type ParsedVAA = VAADetail & { vaa: any; decodedVaa: any };

const Tx = () => {
  useEffect(() => {
    analytics.page({ title: "TX_DETAIL" });
  }, []);

  const { txHash, chainId, emitter, seq } = useParams();
  const { environment } = useEnvironment();
  const network = environment.network;
  const navigate = useNavigate();

  const [, setShowSourceTokenUrl] = useRecoilState(showSourceTokenUrlState);
  const [, setShowTargetTokenUrl] = useRecoilState(showTargetTokenUrlState);

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

        analytics.track("txDetail", {
          appIds: txData?.appIds?.join(", ") ? txData.appIds.join(", ") : "null",
          chain: getChainName({ chainId: txData?.chain ?? 0, network }),
          toChain: getChainName({ chainId: txData?.toChain ?? 0, network }),
        });

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
              amount: txData.payloadAmount ?? undefined,
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
              wrappedTokenAddress: txData.wrappedTokenAddress ?? null,
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
      const otherNetwork = network === "MAINNET" ? "TESTNET" : "MAINNET";

      const currentNetworkResponse: VAADetail[] = await getClient()
        .guardianNetwork.getVAAbyTxHash({
          query: {
            txHash: txHash,
            parsedPayload: true,
          },
        })
        .then(response => {
          if (!!response.length) {
            return response;
          }
          return null;
        })
        .catch(() => {
          return null;
        });

      if (currentNetworkResponse) {
        return currentNetworkResponse;
      }

      const otherNetworkResponse: VAADetail[] = await getClient(otherNetwork)
        .guardianNetwork.getVAAbyTxHash({
          query: {
            txHash: txHash,
            parsedPayload: true,
          },
        })
        .then(response => {
          if (!!response.length) {
            navigate(`/tx/${txHash}?network=${otherNetwork}`);
            return response;
          }
          return null;
        })
        .catch(() => {
          return null;
        });

      if (otherNetworkResponse) {
        return otherNetworkResponse;
      }

      throw new Error("no data");
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

  const { data: VAADataByVAAId } = useQuery(
    ["getVAA", VAAId],
    async () => {
      if (isNaN(Number(chainId)) || isNaN(Number(seq))) {
        throw new Error("Request failed with status code 400");
      }
      const otherNetwork = network === "MAINNET" ? "TESTNET" : "MAINNET";

      const [currentNetworkResponse, otherNetworkResponse] = (await Promise.all([
        getClient().guardianNetwork.getVAA({
          chainId: Number(chainId),
          emitter,
          seq: Number(seq),
          query: {
            parsedPayload: true,
          },
        }),
        getClient(otherNetwork).guardianNetwork.getVAA({
          chainId: Number(chainId),
          emitter,
          seq: Number(seq),
          query: {
            parsedPayload: true,
          },
        }),
      ])) as VAADetail[];

      if (!!currentNetworkResponse) return currentNetworkResponse;
      if (!!otherNetworkResponse) {
        navigate(`/tx/${VAAId}?network=${otherNetwork}`);
      } else {
        throw new Error("no vaaID data");
      }
    },
    {
      onError: (err: Error) => showSearchNotFound(err),
      enabled: isVAAIdSearch && !errorCode,
      retry: false,
    },
  );

  const { data: chainLimitsData } = useQuery(
    ["getLimit"],
    () =>
      getClient()
        .governor.getLimit()
        .catch(() => null),
    { enabled: failCount > 0 },
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
        }
      },
      onError: (err: Error) => showSearchNotFound(err),
    },
  );

  const processApiTxData = useCallback(
    async (apiTxData: GetTransactionsOutput[]) => {
      // check CCTP
      for (const data of apiTxData) {
        if (data?.standardizedProperties?.appIds?.includes("CCTP_WORMHOLE_INTEGRATION")) {
          // if the amount is not there, we get it from the payload
          //     (we assume 6 decimals because its always USDC)
          if (
            (!data.tokenAmount || !data.standardizedProperties?.amount) &&
            !!data.payload?.amount
          ) {
            data.tokenAmount = String(+data.payload?.amount * 0.000001);
            data.standardizedProperties.amount = String(+data.payload?.amount * 100);
            if (!data.symbol) {
              data.symbol = "USDC";
            }
          }

          // the fee for CCTP is feeAmount (fee) + toNativeAmount (gas drop)
          if (data.payload?.parsedPayload?.feeAmount) {
            data.standardizedProperties.fee = `${
              +data.payload.parsedPayload.feeAmount * 100 +
              +data.payload.parsedPayload.toNativeAmount * 100
            }`;
          }

          // the target token address should be native USDC
          if (data.standardizedProperties?.toChain) {
            data.standardizedProperties.wrappedTokenAddress = getUsdcAddress(
              network,
              data.standardizedProperties?.toChain,
            );
          }

          // if destinationTx is not there, we get it from relayer endpoint
          // or if the real chainId is probably ArbitrumSepolia, BaseSepolia or OptimismSepolia
          if (
            !data.globalTx?.destinationTx?.txHash ||
            (network === "TESTNET" &&
              (data.standardizedProperties.fromChain === ChainId.Arbitrum ||
                data.standardizedProperties.fromChain === ChainId.Base ||
                data.standardizedProperties.fromChain === ChainId.Optimism ||
                data.standardizedProperties.toChain === ChainId.Arbitrum ||
                data.standardizedProperties.toChain === ChainId.Base ||
                data.standardizedProperties.toChain === ChainId.Optimism))
          ) {
            // get CCTP relayer information
            const relayResponse = await getClient().search.getCctpRelay({
              txHash: parseTx({ value: data.txHash, chainId: 2 }),
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

              if (data.globalTx) {
                data.globalTx.destinationTx = cctpDestination;
              } else {
                data.globalTx = {
                  id: null,
                  originTx: null,
                  destinationTx: cctpDestination,
                };
              }
              setExtraRawInfo(relayResponse);
            }

            if (relayResponse?.to?.recipientAddress) {
              data.standardizedProperties.toAddress = relayResponse?.to?.recipientAddress;
            }
            if (relayResponse?.fee?.amount) {
              data.standardizedProperties.fee =
                "" +
                (relayResponse?.fee?.amount + (relayResponse?.from?.amountToSwap || 0)) * 100000000;
            }
          }
        }
      }

      // if there's no tokenAmount or symbol, try to get them with RPC info
      for (const data of apiTxData) {
        if (
          (!data.tokenAmount || !data.symbol) &&
          data.standardizedProperties?.tokenAddress &&
          data.standardizedProperties?.tokenChain &&
          (data.payload?.amount || data.standardizedProperties?.amount)
        ) {
          const tokenInfo = await getTokenInformation(
            data.standardizedProperties?.tokenChain,
            environment,
            data.standardizedProperties.tokenAddress,
          );

          if (tokenInfo.symbol && tokenInfo.tokenDecimals) {
            const amount = data.payload?.amount || data.standardizedProperties?.amount;

            if (amount && tokenInfo.tokenDecimals) {
              data.tokenAmount = "" + formatUnits(+amount, tokenInfo.tokenDecimals);
              data.symbol = tokenInfo.symbol;
            }
          }
        }
      }

      // try to get wrapped token address and symbol
      let wrappedTokenChain = null;
      for (const data of apiTxData) {
        if (data?.standardizedProperties?.appIds?.includes("PORTAL_TOKEN_BRIDGE")) {
          if (
            data?.standardizedProperties?.fromChain &&
            data?.standardizedProperties?.tokenAddress &&
            data?.standardizedProperties?.tokenChain &&
            data?.standardizedProperties?.toChain
          ) {
            const { fromChain, tokenAddress, tokenChain, toChain } = data.standardizedProperties;

            const wrapped = tokenChain !== toChain ? "target" : "source";

            // wormhole gateway detect (for ibc token)
            let gatewayChain: ChainId = null;
            if (wrapped === "target" && !!data.payload?.parsedPayload?.gateway_transfer?.chain) {
              gatewayChain = data.payload?.parsedPayload?.gateway_transfer?.chain;
            }

            const wrappedToken = await tryGetWrappedToken(
              network,
              tokenChain as ChainId,
              tokenAddress,
              (wrapped === "target" ? toChain : fromChain) as ChainId,
              gatewayChain,
            );

            if (
              data.globalTx?.originTx?.attribute?.value &&
              !data.standardizedProperties.appIds?.includes("WORMCHAIN_GATEWAY_TRANSFER")
            ) {
              data.standardizedProperties.appIds.push("WORMCHAIN_GATEWAY_TRANSFER");
            }

            if (wrappedToken) {
              wrappedTokenChain = wrapped === "target" ? toChain : fromChain;
              data.standardizedProperties.wrappedTokenAddress = wrappedToken.wrappedToken;
              if (wrappedToken.tokenSymbol) {
                data.standardizedProperties.wrappedTokenSymbol = wrappedToken.tokenSymbol;
              }
            }
          }
        }
      }

      // get algorand extra informations needed
      for (const data of apiTxData) {
        if (
          data?.standardizedProperties?.tokenChain === ChainId.Algorand &&
          data?.standardizedProperties?.tokenAddress
        ) {
          const tokenInfo = await getAlgorandTokenInfo(
            network,
            data?.standardizedProperties?.tokenAddress,
          );

          if (tokenInfo) {
            data.standardizedProperties.tokenAddress =
              tokenInfo.assetId ?? data.standardizedProperties.tokenAddress;

            if (tokenInfo.decimals && !data?.tokenAmount && data?.payload?.amount) {
              data.tokenAmount = `${+data.payload.amount / 10 ** tokenInfo.decimals}`;
            }
            if (tokenInfo.symbol && !data?.symbol) {
              data.symbol = tokenInfo.symbol;
            }
          }
        }

        if (wrappedTokenChain === ChainId.Algorand) {
          const tokenInfo = await getAlgorandTokenInfo(
            network,
            data?.standardizedProperties?.wrappedTokenAddress,
          );
          if (tokenInfo) {
            data.standardizedProperties.wrappedTokenAddress = tokenInfo.assetId;

            if (tokenInfo.symbol && !data?.standardizedProperties?.wrappedTokenSymbol) {
              data.standardizedProperties.wrappedTokenSymbol = tokenInfo.symbol;
            }
          }
        }

        // parse algorand wallet address if needed
        if (
          data.payload?.toChain === 8 &&
          data.payload?.toAddress?.includes("00000000000000000000000000000000000000000")
        ) {
          const appId = BigInt(`0x${data.payload?.toAddress?.replace("0x", "")}`)?.toString();
          if (appId) {
            data.standardizedProperties.toAddress = appId;
          }
        }

        if (
          data.emitterChain === 8 &&
          data.globalTx?.originTx?.from?.includes("00000000000000000000000000000000000000000")
        ) {
          const appId = BigInt(`0x${data.globalTx?.originTx?.from?.replace("0x", "")}`)?.toString();
          if (appId) {
            data.globalTx.originTx.from = appId;
          }
        }
      }

      // check Portico
      for (const data of apiTxData) {
        if (
          isPortico(
            network,
            data?.standardizedProperties?.toChain as ChainId,
            data?.standardizedProperties?.toAddress,
          )
        ) {
          const porticoInfo = await getPorticoInfo(environment, data);
          if (porticoInfo) {
            const {
              formattedFinalUserAmount,
              formattedRelayerFee,
              parsedPayload,
              redeemTokenAddress,
              shouldShowSourceTokenUrl,
              shouldShowTargetTokenUrl,
              sourceSymbol,
              targetSymbol,
              tokenAddress,
            } = await getPorticoInfo(environment, data);

            data.standardizedProperties.overwriteSourceTokenAddress = tokenAddress;
            data.standardizedProperties.overwriteSourceTokenChain = data?.standardizedProperties
              ?.fromChain as ChainId;

            data.standardizedProperties.overwriteTargetTokenAddress = redeemTokenAddress;
            data.standardizedProperties.overwriteTargetTokenChain = data?.standardizedProperties
              ?.toChain as ChainId;

            data.payload.parsedPayload = parsedPayload;
            if (!data.standardizedProperties.appIds.includes("ETH_BRIDGE")) {
              data.standardizedProperties.appIds.push("ETH_BRIDGE");
            }

            setShowSourceTokenUrl(shouldShowSourceTokenUrl);
            setShowTargetTokenUrl(shouldShowTargetTokenUrl);

            if (sourceSymbol) data.standardizedProperties.overwriteSourceSymbol = sourceSymbol;
            if (targetSymbol) data.standardizedProperties.overwriteTargetSymbol = targetSymbol;

            if (formattedFinalUserAmount)
              data.standardizedProperties.overwriteRedeemAmount = formattedFinalUserAmount;
            data.standardizedProperties.overwriteFee = formattedRelayerFee;
          }
        }
      }

      // track analytics on non-rpc and non-generic-relayer txs (those are tracked on other place)
      for (const data of apiTxData) {
        if (!data?.standardizedProperties?.appIds?.includes("GENERIC_RELAYER")) {
          const appIds = data?.standardizedProperties?.appIds?.filter(a => a !== "UNKNOWN");

          analytics.track("txDetail", {
            appIds: appIds?.join(", ") ? appIds.join(", ") : "null",
            chain: getChainName({ chainId: data?.emitterChain ?? 0, network }),
            toChain: getChainName({
              chainId: data?.standardizedProperties?.toChain ?? 0,
              network,
            }),
          });
        }
      }

      setTxData(apiTxData);
      setIsLoading(false);
    },
    [environment, network, setShowSourceTokenUrl, setShowTargetTokenUrl],
  );

  useEffect(() => {
    if (apiTxData && apiTxData.length > 0) {
      processApiTxData(apiTxData);
    }
  }, [apiTxData, processApiTxData]);

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

  const updateTxData = (newData: GetTransactionsOutput, i: number) => {
    const newTxData = [...txData];
    newTxData[i] = { ...newData };
    setTxData(newTxData);
  };

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
              (parsedVAAData, i) =>
                txData && (
                  <Information
                    key={parsedVAAData.id || `vaa-${i}`}
                    extraRawInfo={extraRawInfo}
                    VAAData={parsedVAAData}
                    txData={txData.find(tx => tx.id === parsedVAAData.id)}
                    blockData={blockData}
                    setTxData={newData => updateTxData(newData, i)}
                    chainLimitsData={chainLimitsData}
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
