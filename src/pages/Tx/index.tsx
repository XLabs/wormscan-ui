import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  deserialize,
  encoding,
  toNative,
  ChainId,
  chainToChainId,
  toChainId,
  chainIdToChain,
  UniversalAddress,
} from "@wormhole-foundation/sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Loader } from "src/components/atoms";
import { SearchNotFound } from "src/components/organisms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { ethers } from "ethers";
import {
  fetchWithRpcFallThrough,
  getCctpDomain,
  getEvmBlockInfo,
  getTokenInformation,
  getUsdcAddress,
} from "src/utils/fetchWithRPCsFallthrough";
import { formatUnits, parseAddress } from "src/utils/crypto";
import { ChainLimit, Order } from "src/api";
import { getClient } from "src/api/Client";
import analytics from "src/analytics";
import { GetOperationsOutput, Observation } from "src/api/guardian-network/types";
import { GetBlockData } from "src/api/search/types";
import { Information } from "./Information";
import { Top } from "./Top";
import { getChainName } from "src/utils/wormhole";
import {
  getAlgorandTokenInfo,
  getSolanaCctp,
  getSuiCctp,
  getAptosCctp,
  IManualCctpResponse,
  tryGetAddressInfo,
  tryGetWrappedToken,
  getLiquidityLayerTokenInfo,
} from "src/utils/cryptoToolkit";
import { getPorticoInfo } from "src/utils/wh-portico-rpc";
import { useRecoilState } from "recoil";
import {
  showSourceTokenUrlState,
  showTargetTokenUrlState,
  addressesInfoState,
} from "src/utils/recoilStates";
import { getNttInfo } from "src/utils/wh-ntt-rpc";
import {
  C3_APP_ID,
  CCTP_APP_ID,
  CCTP_MANUAL_APP_ID,
  ETH_BRIDGE_APP_ID,
  FOLKS_FINANCE_APP_ID,
  GATEWAY_APP_ID,
  GR_APP_ID,
  IStatus,
  LIQUIDITY_LAYER_APP_ID,
  MAYAN_MCTP_APP_ID,
  MAYAN_SHUTTLE_APP_ID,
  NTT_APP_ID,
  PORTAL_APP_ID,
  PORTAL_NFT_APP_ID,
  USDT_TRANSFER_APP_ID,
  canWeGetDestinationTx,
  getGuardianSet,
} from "src/consts";
import { ETH_LIMIT } from "../Txs";
import { ARKHAM_CHAIN_NAME } from "src/utils/arkham";
import { DeliveryLifecycleRecord, populateRelayerInfo } from "src/utils/genericRelayerVaaUtils";
import { BlockSection } from "src/components/molecules";
import { mainnetNativeCurrencies, testnetNativeCurrencies } from "src/utils/environment";
import getMayanMctpInfo from "src/utils/mayan";
import { formatNumber } from "src/utils/number";
import { stringifyWithStringBigInt } from "src/utils/object";
import "./styles.scss";

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
  const [, setAddressesInfo] = useRecoilState(addressesInfoState);

  useEffect(() => {
    setShowSourceTokenUrl(true);
    setShowTargetTokenUrl(true);
  }, [txHash, seq, setShowSourceTokenUrl, setShowTargetTokenUrl]);

  // pattern match the search value to see if it's a candidate for being an EVM transaction hash.
  const search = txHash ? (txHash.startsWith("0x") ? txHash : "0x" + txHash) : "";
  const isEvmTxHash = !!search.match(/0x[0-9a-fA-F]{64}/);
  const canBeSolanaTxHash = !!txHash?.match(/^[A-HJ-NP-Za-km-z1-9]+$/);

  const VAAId: string = `${chainId}/${emitter}/${seq}`;
  const isTxHashSearch = Boolean(txHash);
  const isVAAIdSearch = Boolean(chainId) && Boolean(emitter) && Boolean(seq);
  const q = isVAAIdSearch ? VAAId : txHash;
  const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRPC, setIsRPC] = useState(false);
  const [extraRawInfo, setExtraRawInfo] = useState(null);
  const [observationsOnlyData, setObservationsOnlyData] = useState<any>(false);
  const [blockData, setBlockData] = useState<GetBlockData>(null);
  const [failCount, setFailCount] = useState(0);
  const [shouldTryToGetRpcInfo, setShouldTryToGetRpcInfo] = useState(false);

  const [txData, setTxData] = useState<GetOperationsOutput[]>([]);
  const allStatus = txData?.map(data => data.status);

  const isRefetching =
    allStatus?.some(status => status !== "completed" && status !== "external_tx") || false;

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (!!observationsOnlyData) {
      timeout = setTimeout(() => {
        window.location.reload();
      }, 30000);
    }
    return () => clearTimeout(timeout);
  }, [observationsOnlyData]);

  const { data: chainLimitsData, isLoading: isLoadingLimits } = useQuery(["getLimit"], () =>
    getClient()
      .governor.getLimit()
      .catch((): null => null),
  );

  const cancelRequests = useRef(false);
  const tryToGetRpcInfo = useCallback(async () => {
    const txsData = await fetchWithRpcFallThrough(environment, txHash);

    if (txsData) {
      const txData = await txsData[0];
      if (txData) {
        cancelRequests.current = true;

        analytics.track("txDetail", {
          appIds: txData?.appIds?.join(", ") ? txData.appIds.join(", ") : "null",
          chain: txData?.chain ? getChainName({ chainId: txData?.chain, network }) : 0,
          toChain: txData?.toChain ? getChainName({ chainId: txData.toChain, network }) : 0,
        });

        const limitDataForChain = chainLimitsData
          ? chainLimitsData.find((d: ChainLimit) => d.chainId === txData.chain)
          : ETH_LIMIT;
        const transactionLimit = limitDataForChain?.maxTransactionSize;
        const isBigTransaction = transactionLimit <= Number(txData?.usdAmount);
        const isDailyLimitExceeded =
          limitDataForChain?.availableNotional < Number(txData?.usdAmount);

        setIsRPC(true);
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
                wrappedTokenAddress: txData.wrappedTokenAddress,
              },
            },
            data: {
              symbol: txData.symbol,
              tokenAmount: txData.tokenAmount,
              usdAmount: txData.usdAmount,
            },
            status:
              txData.status === "in_progress" && (isBigTransaction || isDailyLimitExceeded)
                ? "in_governors"
                : txData.status,
            isBigTransaction,
            isDailyLimitExceeded,
            transactionLimit,
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
  }, [chainLimitsData, environment, network, txHash]);

  useEffect(() => {
    setErrorCode(undefined);
    setIsLoading(true);
    cancelRequests.current = false; // Reset the cancel flag for new searches
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

  useEffect(() => {
    // check that the limits are already loaded before executing tryToGetRpcInfo
    if (!isLoadingLimits && shouldTryToGetRpcInfo) {
      tryToGetRpcInfo();
      setShouldTryToGetRpcInfo(false);
    }
  }, [isLoadingLimits, shouldTryToGetRpcInfo, tryToGetRpcInfo]);

  const { data: VAADataByTx } = useQuery(
    ["getVAAbyTxHash", txHash],
    async () => {
      const otherNetwork = network === "Mainnet" ? "Testnet" : "Mainnet";

      const currentNetworkResponse = await getClient()
        .guardianNetwork.getOperations({
          txHash: txHash,
        })
        .then(response => {
          if (!!response.length) {
            return response;
          }
          return null;
        })
        .catch((): null => {
          return null;
        });

      if (currentNetworkResponse) {
        return currentNetworkResponse;
      }

      const otherNetworkResponse = await getClient(otherNetwork)
        .guardianNetwork.getOperations({
          txHash: txHash,
        })
        .then(response => {
          if (!!response.length) {
            navigate(`/tx/${txHash}?network=${otherNetwork}`);
            return response;
          }
          return null;
        })
        .catch((): null => {
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
      retryDelay: errCount =>
        errCount === 0 ? 2500 : errCount === 1 || errCount === 2 ? 5000 : 10000,
      retry: errCount => {
        // if request was cancelled, dont retry
        if (cancelRequests.current) return false;

        // first error, retry on every case
        if (errCount === 0) return true;

        // second error, if hash is evm-like, hit rpcs
        if (errCount === 1 && isEvmTxHash) {
          setShouldTryToGetRpcInfo(true);
        }
        // second error, if hash is solana-like, check if its manual cctp
        if ((errCount === 1 && canBeSolanaTxHash) || (errCount === 2 && isEvmTxHash)) {
          (async () => {
            let solanaResponse: IManualCctpResponse | null;
            let suiResponse: IManualCctpResponse | null;
            let aptosResponse: IManualCctpResponse | null;
            if (canBeSolanaTxHash) {
              solanaResponse = await getSolanaCctp(network, txHash).catch((): null => null);
              suiResponse = solanaResponse
                ? null
                : await getSuiCctp(network, txHash).catch((): null => null);
              aptosResponse = null;
            }

            if (isEvmTxHash) {
              solanaResponse = null;
              suiResponse = null;
              aptosResponse = await getAptosCctp(network, txHash).catch((): null => null);
            }

            const resp: IManualCctpResponse = solanaResponse || suiResponse || aptosResponse;
            const chain = solanaResponse
              ? chainToChainId("Solana")
              : suiResponse
              ? chainToChainId("Sui")
              : aptosResponse
              ? chainToChainId("Aptos")
              : null;

            if (resp && chain) {
              cancelRequests.current = true;
              const toChain = getCctpDomain(resp.destinationDomain);

              setTxData([
                {
                  emitterAddress: {
                    hex: resp.contractAddress,
                    native: resp.contractAddress,
                  },
                  emitterChain: chain,
                  id: null,
                  content: {
                    payload: null,
                    standarizedProperties: {
                      amount: String(+resp.amount * 10 ** 2),
                      appIds: [CCTP_MANUAL_APP_ID],
                      fee: "0",
                      feeAddress: "",
                      feeChain: chain,
                      fromAddress: resp.sourceAddress,
                      fromChain: chain,
                      toAddress: resp.targetAddress,
                      toChain: toChain,
                      tokenAddress: resp.sourceTokenAddress,
                      tokenChain: chain,
                      overwriteTargetTokenAddress: getUsdcAddress(network, toChain),
                      overwriteTargetTokenChain: toChain,
                    },
                  },
                  data: {
                    symbol: "USDC",
                    tokenAmount: "" + +resp.amount / 10 ** 6,
                    usdAmount: "" + +resp.amount / 10 ** 6,
                  },
                  status: "external_tx",
                  sequence: "",
                  sourceChain: {
                    chainId: chain,
                    timestamp: new Date(resp.timestamp),
                    from: resp.sourceAddress,
                    status: undefined,
                    transaction: {
                      txHash: txHash,
                    },
                  },
                  targetChain: undefined,
                  vaa: undefined,
                },
              ]);

              setErrorCode(undefined);
              setIsLoading(false);
            } else {
              cancelRequests.current = false;
            }
          })();
        }

        if (errCount === 2) {
          // check observations for txHash
          getClient()
            .guardianNetwork.getObservationForTxHash(txHash)
            .then(observations => {
              if (!!observations?.length) {
                const guardianSetList = getGuardianSet(4);

                const signedGuardians = observations.map(({ guardianAddr, signature }) => ({
                  signature: Buffer.from(signature).toString(),
                  name: guardianSetList?.find(a => a.pubkey === guardianAddr)?.name,
                }));

                setExtraRawInfo({ ...extraRawInfo, signatures: signedGuardians, observations });
                setObservationsOnlyData({
                  signatures: signedGuardians,
                  observations,
                  txHash,
                  emitterChain: observations[0].emitterChain,
                });

                cancelRequests.current = true;
                setIsLoading(false);
              }
            })
            .catch(() => {
              console.log("no observations found");
            });
        }

        setFailCount(errCount);
        // more than three fails, stop retrying
        if (errCount > 3) {
          return false;
        }
        return true;
      },
      refetchInterval: isRefetching ? 10000 : false,
    },
  );

  const { data: VAADataByVAAId } = useQuery(
    ["getVAA", VAAId],
    async () => {
      if (isNaN(Number(chainId)) || isNaN(Number(seq))) {
        throw new Error("Request failed with status code 400");
      }
      const otherNetwork = network === "Mainnet" ? "Testnet" : "Mainnet";

      try {
        const currentNetworkResponse = await getClient().guardianNetwork.getOperations({
          vaaID: `${chainId}/${emitter}/${seq}`,
        });
        if (!!currentNetworkResponse && currentNetworkResponse?.length > 0) {
          return currentNetworkResponse;
        }
      } catch {
        // go to the next call
      }

      try {
        const otherNetworkResponse = await getClient(otherNetwork).guardianNetwork.getOperations({
          vaaID: `${chainId}/${emitter}/${seq}`,
        });
        if (!!otherNetworkResponse && otherNetworkResponse?.length > 0) {
          navigate(`/tx/${chainId}/${emitter}/${seq}?network=${otherNetwork}`);
          return otherNetworkResponse;
        }
      } catch {
        // go check observations
      }

      // no vaa, check observations for vaa ID
      const [a, b, c] = VAAId.split("/");
      await getClient()
        .guardianNetwork.getObservation(
          {
            chainId: +a,
            emmiter: b,
            specific: {
              sequence: c,
            },
          },
          { page: 0, pageSize: 20, sortOrder: Order.ASC },
        )
        .then(observations => {
          if (!!observations?.length) {
            const guardianSetList = getGuardianSet(4);

            const signedGuardians = observations.map(({ guardianAddr, signature }) => ({
              signature: Buffer.from(signature).toString(),
              name: guardianSetList?.find(a => a.pubkey === guardianAddr)?.name,
            }));

            setExtraRawInfo({ ...extraRawInfo, signatures: signedGuardians, observations });
            setObservationsOnlyData({
              signatures: signedGuardians,
              observations,
              txHash,
              emitterChain: observations[0].emitterChain,
            });

            setIsLoading(false);
          } else {
            throw new Error("no observations found");
          }
        })
        .catch(() => {
          console.log("no observations found");
          throw new Error("no vaaID nor observations data");
        });
    },
    {
      onError: (err: Error) => {
        console.log("error on get operation by vaa", err);
        showSearchNotFound(err);
      },
      enabled: isVAAIdSearch && !errorCode,
      retry: false,
      refetchInterval: isRefetching ? 10000 : false,
    },
  );

  const VAAData: GetOperationsOutput[] = useMemo(() => {
    if (isTxHashSearch) {
      return VAADataByTx;
    } else {
      if (VAADataByVAAId) return VAADataByVAAId;
      return null;
    }
  }, [isTxHashSearch, VAADataByTx, VAADataByVAAId]);

  const processVaaData = useCallback(
    async (apiTxData: GetOperationsOutput[]) => {
      let wrappedTokenChain = null;

      for (const data of apiTxData) {
        let relayerInfo: DeliveryLifecycleRecord;

        // Check if its generic relayer tx without vaa and go with RPCs
        // TODO: handle generic relayer no-vaa txns without RPCs
        if (
          !data?.content?.standarizedProperties?.appIds?.includes(NTT_APP_ID) &&
          data?.content?.standarizedProperties?.appIds?.includes(GR_APP_ID) &&
          !data?.content?.standarizedProperties?.appIds?.includes(FOLKS_FINANCE_APP_ID) &&
          !data?.vaa?.raw
        ) {
          setShouldTryToGetRpcInfo(true);
        }
        // ---

        // Signed VAA logic
        const vaa = data.vaa?.raw;
        if (vaa) {
          const guardianSetIndex = data.vaa.guardianSetIndex;
          // Decode SignedVAA and get guardian signatures with name
          const guardianSetList = getGuardianSet(guardianSetIndex);
          const vaaBuffer = Buffer.from(vaa, "base64");
          const parsedVaa = deserialize("Uint8Array", vaaBuffer);

          const guardianSignatures = parsedVaa.signatures.map(sig => ({
            index: sig.guardianIndex,
            signature: encoding.b64.encode(sig.signature.encode()),
          }));

          const { emitterAddress, hash, sequence, emitterChain } = parsedVaa || {};
          let parsedEmitterAddress = "";
          try {
            parsedEmitterAddress = emitterAddress.toNative(emitterChain).toString();
          } catch (error) {
            console.error("Error converting emitter address to native:", error);
          }
          const parsedHash = Buffer.from(hash).toString("hex");
          const parsedSequence = Number(sequence);
          const parsedGuardianSignatures = guardianSignatures?.map(({ index, signature }) => ({
            index,
            signature: "0x" + Buffer.from(encoding.b64.decode(signature)).toString("hex"),
            name: guardianSetList?.[index]?.name,
          }));

          data.decodedVaa = {
            ...parsedVaa,
            payload: parsedVaa.payload ? Buffer.from(parsedVaa.payload).toString("hex") : null,
            emitterAddress: parsedEmitterAddress,
            guardianSignatures: parsedGuardianSignatures,
            hash: parsedHash,
            sequence: parsedSequence,
          };
        } else {
          let observations: Observation[];
          if (txHash) {
            observations = await getClient().guardianNetwork.getObservationForTxHash(txHash);
          } else {
            const [a, b, c] = VAAId.split("/");
            observations = await getClient().guardianNetwork.getObservation(
              {
                chainId: +a,
                emmiter: b,
                specific: {
                  sequence: +c,
                },
              },
              { pageSize: 20, page: 0, sortOrder: Order.ASC },
            );
          }

          if (!!observations?.length) {
            const guardianSetList = getGuardianSet(4);

            const signedGuardians = observations.map(({ guardianAddr, signature }) => ({
              signature: Buffer.from(signature).toString(),
              name: guardianSetList?.find(a => a.pubkey === guardianAddr)?.name,
            }));

            data.decodedVaa = {
              guardianSignatures: signedGuardians,
            };
          }
        }
        // ---

        // check CCTP
        if (data?.content?.standarizedProperties?.appIds?.includes(CCTP_APP_ID)) {
          // if the amount is not there, we get it from the payload
          //     (we assume 6 decimals because its always USDC)
          if (
            (!data.data?.tokenAmount || !data.content?.standarizedProperties?.amount) &&
            !!data.content?.payload?.amount
          ) {
            data.data = {
              tokenAmount: String(+data?.content?.payload?.amount * 0.000001),
              symbol: "USDC",
              usdAmount: "",
            };
          }

          // the fee for CCTP is feeAmount (fee) + toNativeAmount (gas drop)
          if (data?.content?.payload?.parsedPayload?.feeAmount) {
            data.content.standarizedProperties.fee = `${
              +data?.content?.payload?.parsedPayload.feeAmount * 100 +
              +data?.content?.payload?.parsedPayload.toNativeAmount * 100
            }`;
          }

          // the target token address should be native USDC
          if (data.content?.standarizedProperties?.toChain) {
            data.content.standarizedProperties.wrappedTokenAddress = getUsdcAddress(
              network,
              data.content?.standarizedProperties?.toChain as ChainId,
            );
          }
        }
        // ----

        // check Wormhole Liquidity Layer
        if (
          data?.content?.standarizedProperties?.appIds?.includes(LIQUIDITY_LAYER_APP_ID) &&
          data.content.payload?.payloadId === 11
        ) {
          const liquidityLayerTokenInfo = await getLiquidityLayerTokenInfo(
            network,
            data.sourceChain?.transaction?.txHash,
            data.sourceChain?.chainId,
          );

          if (liquidityLayerTokenInfo) {
            if (liquidityLayerTokenInfo.type === "SwapAndForwardedEth") {
              data.data = {
                symbol:
                  network === "Testnet"
                    ? testnetNativeCurrencies[chainIdToChain(data.sourceChain?.chainId)]
                    : mainnetNativeCurrencies[chainIdToChain(data.sourceChain?.chainId)],
                tokenAmount: String(+liquidityLayerTokenInfo.amountIn / 10 ** 18),
                usdAmount: "",
              };
            }

            if (
              liquidityLayerTokenInfo.type === "ForwardedERC20" ||
              liquidityLayerTokenInfo.type === "SwapAndForwardedERC20"
            ) {
              data.data = {
                symbol: liquidityLayerTokenInfo.symbol,
                tokenAmount: String(
                  +liquidityLayerTokenInfo.amountIn / 10 ** liquidityLayerTokenInfo.decimals,
                ),
                usdAmount: "",
              };

              data.content.standarizedProperties.tokenAddress = liquidityLayerTokenInfo.token;
              data.content.standarizedProperties.tokenChain = data.sourceChain?.chainId;
            }

            if (data.targetChain?.balanceChanges?.length) {
              const receivedAmount = data.targetChain?.balanceChanges[0]?.amount;
              const receivedToken = data.targetChain?.balanceChanges[0]?.tokenAddress;

              const targetToken = await getTokenInformation(
                data.targetChain?.chainId,
                environment,
                receivedToken,
              );

              if (receivedAmount && targetToken) {
                data.content.standarizedProperties.overwriteTargetTokenAddress = receivedToken;
                data.content.standarizedProperties.overwriteTargetSymbol = targetToken.symbol;
                data.content.standarizedProperties.overwriteTargetTokenChain =
                  data.targetChain?.chainId;
                data.content.standarizedProperties.overwriteRedeemAmount = String(
                  +receivedAmount / 10 ** targetToken.tokenDecimals,
                );
              }
            }
          }
        }

        if (data?.content?.standarizedProperties?.appIds?.includes(LIQUIDITY_LAYER_APP_ID)) {
          if (
            data.content.payload?.payload?.payloadId === 1 &&
            data.content.payload?.payload?.parsedRedeemerMessage?.outputToken?.address
          ) {
            const outputTokenAddress =
              data.content.payload?.payload?.parsedRedeemerMessage?.outputToken?.address;

            const targetTokenAddress = new UniversalAddress(outputTokenAddress)
              .toNative(chainIdToChain(data.content.standarizedProperties?.toChain))
              ?.toString();

            const targetTokenInfo = await getTokenInformation(
              data.content.standarizedProperties?.toChain,
              environment,
              targetTokenAddress,
            );

            if (targetTokenInfo) {
              data.content.standarizedProperties.overwriteTargetTokenAddress = targetTokenAddress;
              data.content.standarizedProperties.overwriteTargetSymbol = targetTokenInfo.symbol;
              data.content.standarizedProperties.overwriteTargetTokenChain =
                data.content.standarizedProperties?.toChain;

              if (
                targetTokenInfo.tokenDecimals &&
                data.content.payload?.payload?.parsedRedeemerMessage?.outputToken?.swap?.limitAmount
              ) {
                data.content.standarizedProperties.overwriteRedeemAmount = `${
                  +data.content.payload?.payload?.parsedRedeemerMessage?.outputToken?.swap
                    ?.limitAmount /
                  10 ** targetTokenInfo.tokenDecimals
                }`;
              }
            }
          }
        }
        // ----

        // Check Standard Relayer
        if (data?.content?.standarizedProperties?.appIds?.includes(GR_APP_ID)) {
          // TODO: handle generic relayer non-vaa txns without rpcs (shows no amount)

          try {
            const result = await populateRelayerInfo(environment, data);
            relayerInfo = result;

            const vaa = relayerInfo.vaa;
            const parsedVaa = deserialize("Uint8Array", vaa);
            const sourceTxHash = relayerInfo.sourceTxHash;

            const deliveryStatus = relayerInfo.DeliveryStatus;

            const resultLogRegex =
              deliveryStatus?.data?.delivery?.execution?.detail.match(/Status: ([^\r\n]+)/);
            const resultLog = resultLogRegex ? resultLogRegex?.[1] : null;

            const gasUsed = Number(deliveryStatus?.data?.delivery?.execution?.gasUsed);
            const targetTxTimestamp = relayerInfo?.targetTransaction?.targetTxTimestamp;

            const guardianSignatures = parsedVaa.signatures.map(sig => ({
              index: sig.guardianIndex,
              signature: encoding.b64.encode(sig.signature.encode()),
            }));

            const { emitterAddress, emitterChain } = parsedVaa || {};

            const parsedEmitterAddress = emitterAddress.toNative(emitterChain).toString();

            const totalGuardiansNeeded = network === "Mainnet" ? 13 : 1;
            const guardianSignaturesCount = Array.isArray(guardianSignatures)
              ? guardianSignatures?.length || 0
              : 0;

            const fromChain = toChainId(emitterChain);

            const deliveryInstruction = data.content.payload;
            const isDelivery = !("newSenderAddress" in deliveryInstruction);

            const decodeExecution = deliveryInstruction.encodedExecutionInfo;

            const gasLimit = data.content?.payload?.encodedExecutionInfo?.gasLimit;

            // if (!data.content.standarizedProperties.toAddress) {
            //   console.log("AH?");
            //   return (
            //     <div className="tx-information-errored-info">
            //       This is either not an Standard Relayer VAA or something&apos;s wrong with it
            //     </div>
            //   );
            // }

            const trunkStringsDecimal = (num: string, decimals: number) => {
              const [whole, fraction] = num.split(".");
              if (!fraction) return whole;
              return `${whole}.${fraction.slice(0, decimals)}`;
            };

            const maxRefund = deliveryStatus?.data?.delivery?.maxRefund
              ? Number(
                  trunkStringsDecimal(
                    ethers.formatUnits(
                      deliveryStatus?.data?.delivery?.maxRefund,
                      deliveryStatus?.data?.delivery?.targetChainDecimals || 18,
                    ),
                    3,
                  ),
                )
              : 0;

            const deliveryParsedTargetAddress = parseAddress({
              value: deliveryInstruction?.targetAddress,
              chainId: deliveryInstruction?.targetChainId as ChainId,
            });

            const deliveryParsedRefundAddress = parseAddress({
              value: deliveryInstruction?.refundAddress,
              chainId: deliveryInstruction?.refundChainId as ChainId,
            });

            const deliveryParsedRefundProviderAddress = parseAddress({
              value: deliveryInstruction?.refundDeliveryProvider,
              chainId: deliveryInstruction?.refundChainId as ChainId,
            });

            const deliveryParsedSenderAddress = parseAddress({
              value: deliveryInstruction?.senderAddress,
              chainId: fromChain as ChainId,
            });

            const deliveryParsedSourceProviderAddress = parseAddress({
              value: deliveryInstruction?.sourceDeliveryProvider,
              chainId: fromChain as ChainId,
            });

            const maxRefundText = () => {
              return `${maxRefund} ${
                network === "Testnet"
                  ? testnetNativeCurrencies[chainIdToChain(deliveryInstruction.targetChainId)]
                  : mainnetNativeCurrencies[chainIdToChain(deliveryInstruction.targetChainId)]
              }`;
            };

            const gasUsedText = () => {
              return isNaN(gasUsed) ? `${gasLimit}` : `${gasUsed}/${gasLimit}`;
            };

            const receiverValueText = () => {
              const receiverValue = trunkStringsDecimal(
                ethers.formatUnits(
                  BigInt(deliveryStatus?.data?.instructions?.requestedReceiverValue?._hex),
                  deliveryStatus?.data?.delivery?.targetChainDecimals || 18,
                ),
                3,
              );

              return `${receiverValue} ${
                network === "Testnet"
                  ? testnetNativeCurrencies[chainIdToChain(deliveryInstruction.targetChainId)]
                  : mainnetNativeCurrencies[chainIdToChain(deliveryInstruction.targetChainId)]
              }`;
            };

            const budgetText = () => {
              if (deliveryStatus?.data?.delivery?.budget) {
                return `${trunkStringsDecimal(
                  ethers.formatUnits(
                    deliveryStatus?.data?.delivery?.budget,
                    deliveryStatus?.data?.delivery?.targetChainDecimals || 18,
                  ),
                  3,
                )} ${
                  network === "Testnet"
                    ? testnetNativeCurrencies[chainIdToChain(deliveryInstruction.targetChainId)]
                    : mainnetNativeCurrencies[chainIdToChain(deliveryInstruction.targetChainId)]
                }`;
              }

              return "N/A";
            };

            const refundText = () => {
              const refundAmountRegex = deliveryStatus?.data?.delivery?.execution?.detail.match(
                /Refund amount:\s*([0-9.]+)/,
              );
              const refundAmount = refundAmountRegex ? refundAmountRegex?.[1] : null;

              if (refundAmount)
                return `${refundAmount} ${
                  network === "Testnet"
                    ? testnetNativeCurrencies[chainIdToChain(deliveryInstruction.targetChainId)]
                    : mainnetNativeCurrencies[chainIdToChain(deliveryInstruction.targetChainId)]
                }`;

              return "";
            };

            const copyBudgetText = () => {
              return `Budget: ${budgetText()}\n\nMax Refund:\n${maxRefundText()}\n\n${
                !isNaN(gasUsed) ? "Gas Used/" : ""
              }Gas limit\n${gasUsedText()}\n\n${
                !isNaN(gasUsed) ? "Refund Amount\n" + refundText() : ""
              }\n\nReceiver Value: ${receiverValueText()}`
                .replaceAll("  ", "")
                .replaceAll("\n\n\n\n", "\n\n");
            };

            const refundStatusRegex =
              deliveryStatus?.data?.delivery?.execution?.detail.match(/Refund status: ([^\r\n]+)/);
            const refundStatus = refundStatusRegex ? refundStatusRegex?.[1] : null;

            const deliveryAttemptRegex = deliveryStatus?.data?.delivery?.execution?.detail.match(
              /Delivery attempt \s*([0-9.]+)/,
            );
            const deliveryAttempt = deliveryAttemptRegex ? deliveryAttemptRegex?.[1] : null;

            const sourceAddress =
              data?.sourceChain?.from || data?.content?.standarizedProperties?.fromAddress;

            relayerInfo.props = {
              budgetText,
              copyBudgetText,
              currentNetwork: network,
              decodeExecution,
              deliveryAttempt,
              deliveryInstruction,
              deliveryParsedRefundAddress,
              deliveryParsedRefundProviderAddress,
              deliveryParsedSenderAddress,
              deliveryParsedSourceProviderAddress,
              deliveryParsedTargetAddress,
              deliveryStatus,
              fromChain,
              gasUsed,
              gasUsedText,
              guardianSignaturesCount,
              isDelivery,
              isDuplicated: data.vaa?.isDuplicated,
              maxRefundText,
              parsedEmitterAddress,
              parsedVaa,
              receiverValueText,
              refundStatus,
              refundText,
              resultLog,
              sourceAddress,
              sourceTxHash,
              targetTxTimestamp,
              totalGuardiansNeeded,
              VAAId: `${data.emitterChain}/${data.emitterAddress?.hex}/${data.sequence}`,
            };
          } catch (e) {
            console.error("standard relayer tx errored:", e);
          }
        }
        // ----

        // Check Folks Finance
        if (data?.content?.standarizedProperties?.appIds?.includes(FOLKS_FINANCE_APP_ID)) {
          const parsedPayload = data?.content?.payload?.parsedPayload;

          if (parsedPayload?.action === 0 || !!parsedPayload?.action) {
            data.content.payload = {
              ...data.content.payload,
              action: parsedPayload?.action,
            };
          }
        }

        // ----

        // Check NTT
        if (data?.content?.standarizedProperties?.appIds?.includes(NTT_APP_ID)) {
          const parsedPayload = data?.content?.payload?.nttMessage
            ? data?.content?.payload
            : data?.content?.payload?.parsedPayload;

          if (!!parsedPayload?.nttMessage?.trimmedAmount?.amount) {
            const decimals = parsedPayload?.nttMessage?.trimmedAmount?.decimals;

            const amount = decimals
              ? String(+parsedPayload?.nttMessage?.trimmedAmount?.amount / 10 ** decimals)
              : null;

            data.content.payload = {
              ...data.content.payload,
              payloadType: 1,
              amount: parsedPayload?.nttMessage?.trimmedAmount?.amount,
            };

            const tokenInfo = await getTokenInformation(
              data.sourceChain?.chainId,
              environment,
              data.content?.standarizedProperties?.tokenAddress,
            );

            data.data = {
              tokenAmount: data?.data?.tokenAmount || amount,
              symbol: data?.data?.symbol || tokenInfo.symbol,
              usdAmount: data?.data?.usdAmount || null,
            };

            const nttInfo = await getNttInfo(environment, data, parsedPayload);

            if (nttInfo) {
              const targetTokenInfo = await getTokenInformation(
                data.content?.standarizedProperties?.toChain,
                environment,
                nttInfo?.targetTokenAddress,
              );

              if (nttInfo?.targetTokenAddress) {
                data.content.standarizedProperties.wrappedTokenAddress = nttInfo.targetTokenAddress;
                data.content.standarizedProperties.wrappedTokenSymbol =
                  nttInfo.targetTokenSymbol || targetTokenInfo.symbol;
              }
            }
          }
        }
        // ----

        // if there's no tokenAmount or symbol...
        // ...check if its attestation...
        if (data?.content?.payload?.payloadType === 2) {
          if (data?.content?.payload?.symbol) {
            data.data = {
              symbol: `${data?.content?.payload?.symbol} (${data?.content?.payload?.name})`,
              tokenAmount: "0",
              usdAmount: "0",
            };
          }
        }
        // ...and if not try to get them with RPC info.
        else {
          if (
            (!data.data?.tokenAmount || !data.data?.symbol) &&
            data.content.standarizedProperties?.tokenAddress &&
            data.content.standarizedProperties?.tokenChain &&
            (data.content?.payload?.amount || data.content.standarizedProperties?.amount)
          ) {
            const tokenInfo = await getTokenInformation(
              data.content.standarizedProperties?.tokenChain,
              environment,
              data.content.standarizedProperties.tokenAddress,
            );

            if (tokenInfo.symbol && tokenInfo.tokenDecimals) {
              const amount =
                data.content?.payload?.amount || data.content.standarizedProperties?.amount;

              const scaled =
                tokenInfo.tokenDecimals > 8 && data.content?.payload?.amount
                  ? +amount * 10 ** (tokenInfo.tokenDecimals - 8)
                  : +amount;

              if (amount && tokenInfo.tokenDecimals) {
                data.data = {
                  tokenAmount: "" + formatUnits(scaled, tokenInfo.tokenDecimals),
                  symbol: tokenInfo.symbol,
                  usdAmount: data?.data?.usdAmount || null,
                };
              }
            }
          }
        }
        // ----

        // try to get wrapped token address and symbol
        if (
          data?.content?.standarizedProperties?.appIds?.includes(PORTAL_APP_ID) ||
          data?.content?.payload?.payloadType === 2
        ) {
          if (
            data?.content?.standarizedProperties?.fromChain &&
            data?.content?.standarizedProperties?.tokenAddress &&
            data?.content?.standarizedProperties?.tokenChain &&
            (data?.content?.standarizedProperties?.toChain || data?.targetChain?.chainId)
          ) {
            const { fromChain, tokenAddress, tokenChain } = data.content.standarizedProperties;
            const toChain =
              data?.content?.standarizedProperties?.toChain || data?.targetChain?.chainId;

            const wrapped = tokenChain !== toChain ? "target" : "source";

            // wormhole gateway detect (for ibc token)
            let gatewayChain: ChainId = null;
            if (
              wrapped === "target" &&
              !!data.content?.payload?.parsedPayload?.gateway_transfer?.chain
            ) {
              gatewayChain = data.content?.payload?.parsedPayload?.gateway_transfer?.chain;
            }
            if (wrapped === "source" && !!data.sourceChain?.attribute?.value?.originChainId) {
              gatewayChain = data.sourceChain?.attribute?.value?.originChainId;
            }

            const wrappedToken = await tryGetWrappedToken(
              network,
              tokenChain as ChainId,
              tokenAddress,
              (wrapped === "target" ? toChain : fromChain) as ChainId,
              gatewayChain,
            );

            if (
              data?.sourceChain?.attribute?.value &&
              !data?.content?.standarizedProperties?.appIds?.includes(GATEWAY_APP_ID)
            ) {
              data?.content?.standarizedProperties?.appIds?.push(GATEWAY_APP_ID);
            }

            if (wrappedToken) {
              wrappedTokenChain = wrapped === "target" ? toChain : fromChain;
              data.content.standarizedProperties.wrappedTokenAddress = wrappedToken.wrappedToken;
              if (wrappedToken.tokenSymbol) {
                data.content.standarizedProperties.wrappedTokenSymbol = wrappedToken.tokenSymbol;
              }
            }
          }
        }
        // ----

        // get algorand extra informations needed
        if (
          data?.content?.standarizedProperties?.tokenChain === chainToChainId("Algorand") &&
          data?.content?.standarizedProperties?.tokenAddress
        ) {
          const tokenInfo = await getAlgorandTokenInfo(
            network,
            data?.content?.standarizedProperties?.tokenAddress,
          );

          if (tokenInfo) {
            data.content.standarizedProperties.tokenAddress =
              tokenInfo.assetId ?? data.content.standarizedProperties.tokenAddress;

            if (tokenInfo.decimals && !data?.data?.tokenAmount && data?.content?.payload?.amount) {
              if (data.data)
                data.data.tokenAmount = `${
                  +data.content.payload.amount / 10 ** tokenInfo.decimals
                }`;
            }
            if (tokenInfo.symbol && !data?.data?.symbol) {
              if (data.data) data.data.symbol = tokenInfo.symbol;
            }
          }
        }

        if (wrappedTokenChain === chainToChainId("Algorand")) {
          const tokenInfo = await getAlgorandTokenInfo(
            network,
            data?.content?.standarizedProperties?.wrappedTokenAddress,
          );
          if (tokenInfo) {
            data.content.standarizedProperties.wrappedTokenAddress = tokenInfo.assetId;

            if (tokenInfo.symbol && !data?.content?.standarizedProperties?.wrappedTokenSymbol) {
              data.content.standarizedProperties.wrappedTokenSymbol = tokenInfo.symbol;
            }
          }
        }

        // parse algorand wallet address if needed
        if (
          data.content.payload?.toChain === 8 &&
          data.content.payload?.toAddress?.includes("00000000000000000000000000000000000000000")
        ) {
          const appId = BigInt(
            `0x${data.content.payload?.toAddress?.replace("0x", "")}`,
          )?.toString();
          if (appId) {
            data.content.standarizedProperties.toAddress = appId;
          }
        }

        if (
          data.emitterChain === 8 &&
          data.sourceChain.from?.includes("00000000000000000000000000000000000000000")
        ) {
          const appId = BigInt(`0x${data.sourceChain.from?.replace("0x", "")}`)?.toString();
          if (appId) {
            data.sourceChain.from = appId;
          }
        }
        // ----

        // check NFTs
        if (data?.content?.standarizedProperties?.appIds?.includes(PORTAL_NFT_APP_ID)) {
          const setNoInfoNFT = () => {
            if (data.content.payload.name || data.content.payload.tokenId) {
              data.content.payload.nftInfo = {
                name: data.content.payload.name,
                tokenId: data.content.payload.tokenId,
              };
            }
          };

          if (!!data.content.payload?.uri) {
            try {
              let nftInfo;

              try {
                const nftCall = await fetch(
                  data.content.payload.uri.startsWith("ipfs://")
                    ? `https://ipfs.io/ipfs/${data.content.payload.uri.replace("ipfs://", "")}`
                    : data.content.payload?.uri,
                );
                nftInfo = await nftCall.json();
              } catch (e) {
                const CORS_PROXY = "https://corsproxy.io/?";
                const nftCallCors = await fetch(
                  `${CORS_PROXY}${encodeURIComponent(data.content.payload?.uri).replaceAll(
                    "%00",
                    "",
                  )}`,
                );
                nftInfo = await nftCallCors.json();
              }

              data.content.payload.nftInfo = {
                ...nftInfo,
                tokenId: data.content.payload.tokenId,
                uri: data.content.payload.uri,
              };
              data.content.payload.nftInfo.image = data.content.payload.nftInfo.image?.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/",
              );
            } catch (e) {
              console.log("failed to get NFT info", e);
              setNoInfoNFT();
            }
          } else {
            setNoInfoNFT();
          }
        }
        // ----

        // check Portico
        if (
          data?.content?.standarizedProperties?.appIds?.includes(ETH_BRIDGE_APP_ID) ||
          data?.content?.standarizedProperties?.appIds?.includes(USDT_TRANSFER_APP_ID)
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
            } = porticoInfo;

            data.content.standarizedProperties.overwriteSourceTokenAddress = tokenAddress;
            data.content.standarizedProperties.overwriteSourceTokenChain = data?.content
              ?.standarizedProperties?.fromChain as ChainId;

            data.content.standarizedProperties.overwriteTargetTokenAddress = redeemTokenAddress;
            data.content.standarizedProperties.overwriteTargetTokenChain = data?.content
              ?.standarizedProperties?.toChain as ChainId;

            data.content.payload.parsedPayload = parsedPayload;

            setShowSourceTokenUrl(shouldShowSourceTokenUrl);
            setShowTargetTokenUrl(shouldShowTargetTokenUrl);

            if (sourceSymbol)
              data.content.standarizedProperties.overwriteSourceSymbol = sourceSymbol;
            if (targetSymbol)
              data.content.standarizedProperties.overwriteTargetSymbol = targetSymbol;

            if (formattedFinalUserAmount)
              data.content.standarizedProperties.overwriteRedeemAmount = formatNumber(
                +formattedFinalUserAmount,
                7,
              );

            data.content.standarizedProperties.overwriteFee = formattedRelayerFee;
          }
        }
        // ----

        // check Mayan MCTP
        if (data?.content?.standarizedProperties?.appIds?.includes(MAYAN_MCTP_APP_ID)) {
          if (data?.content?.payload?.action === 1 || data?.content?.payload?.action === 3) {
            try {
              const mayanInfo = await getMayanMctpInfo(data.sourceChain?.transaction?.txHash);

              data.data = {
                ...data.data,
                symbol: mayanInfo?.fromTokenSymbol,
                tokenAmount: mayanInfo?.fromAmount,
              };

              data.content.standarizedProperties = {
                ...data.content.standarizedProperties,
                fee: ((+mayanInfo?.fromAmount - +mayanInfo?.toAmount) * 10 ** 8).toString(),
                amount: (+mayanInfo?.fromAmount * 10 ** 8).toString(),
                tokenAddress: mayanInfo?.fromTokenAddress,
                tokenChain: +mayanInfo?.fromTokenChain as ChainId,
                overwriteTargetTokenAddress: mayanInfo?.toTokenAddress,
                overwriteTargetTokenChain: +mayanInfo?.toTokenChain as ChainId,
                overwriteSourceSymbol: mayanInfo?.fromTokenSymbol,
                overwriteTargetSymbol: mayanInfo?.toTokenSymbol,
                toAddress: mayanInfo?.destAddress,
                toChain: +mayanInfo?.destChain as ChainId,
              };

              setExtraRawInfo((extraRawInfo: any) => ({
                ...extraRawInfo,
                // Add mayan info without null values to extra raw info so its available for users.
                "Mayan Info": Object.fromEntries(
                  Object.entries(mayanInfo).filter(([_, v]) => v !== null),
                ),
              }));
            } catch (e) {
              console.error("Error fetching Mayan MCTP info", e);
            }
          }
        }
        // ----

        // track analytics on non-rpc txs (those are tracked on top)
        if (!data?.content?.standarizedProperties?.appIds?.includes(GR_APP_ID)) {
          const appIds = data?.content?.standarizedProperties?.appIds?.filter(a => a !== "UNKNOWN");

          analytics.track("txDetail", {
            appIds: appIds?.join(", ") ? appIds.join(", ") : "null",
            chain: data?.emitterChain
              ? getChainName({ chainId: data?.emitterChain as ChainId, network })
              : "Unset",
            toChain: data?.content?.standarizedProperties?.toChain
              ? getChainName({
                  chainId: data?.content?.standarizedProperties?.toChain as ChainId,
                  network,
                })
              : "Unset",
          });
        } else if (relayerInfo) {
          analytics.track("txDetail", {
            appIds: [GR_APP_ID].join(", "),
            chain: getChainName({
              chainId: (relayerInfo?.sourceChainId as any)
                ? (relayerInfo.sourceChainId as any)
                : data.content?.standarizedProperties?.fromChain
                ? data.content?.standarizedProperties?.fromChain
                : 0,
              network: network,
            }),
            toChain: getChainName({
              chainId: (relayerInfo?.targetTransaction?.targetChainId
                ? relayerInfo.targetTransaction?.targetChainId
                : data.content?.standarizedProperties?.toChain
                ? data.content?.standarizedProperties?.toChain
                : 0) as ChainId,
              network: network,
            }),
          });
        }
        // ----

        // Check C3
        if (
          data?.content?.standarizedProperties?.appIds?.includes(PORTAL_APP_ID) &&
          (data?.sourceChain?.from ===
            "BM26KC3NHYQ7BCDWVMP2OM6AWEZZ6ZGYQWKAQFC7XECOUBLP44VOYNBQTA" ||
            data?.sourceChain?.from ===
              "W7MQDZ6ZCBODX63NRIS6FMU5G7YYHDIK32TAAIJAWGPWDAO44GPQS6S3LU") &&
          !data?.content?.standarizedProperties?.appIds?.includes(C3_APP_ID)
        ) {
          data.content.standarizedProperties.appIds.push(C3_APP_ID);
        }
        // ----

        // Add status logic
        const { fromChain, appIds } = data?.content?.standarizedProperties || {};

        const limitDataForChain = chainLimitsData
          ? chainLimitsData.find(
              (d: ChainLimit) => d.chainId === data?.content?.standarizedProperties?.fromChain,
            )
          : ETH_LIMIT;
        const transactionLimit = limitDataForChain?.maxTransactionSize;
        const isBigTransaction = transactionLimit <= Number(data?.data?.usdAmount);
        const isDailyLimitExceeded =
          limitDataForChain?.availableNotional < Number(data?.data?.usdAmount);

        const status: IStatus = data?.targetChain?.transaction?.txHash
          ? "completed"
          : appIds && appIds.includes(CCTP_MANUAL_APP_ID)
          ? "external_tx"
          : vaa
          ? canWeGetDestinationTx({
              appIds,
              network: environment.network,
              targetChain: data?.content?.standarizedProperties?.toChain,
            })
            ? "pending_redeem"
            : "completed"
          : isBigTransaction || isDailyLimitExceeded
          ? "in_governors"
          : "in_progress";

        data.status = status;
        data.isBigTransaction = isBigTransaction;
        data.isDailyLimitExceeded = isDailyLimitExceeded;
        data.transactionLimit = transactionLimit;

        if (status === "in_governors") {
          const enqueuedTransactions = await getClient(
            environment.network,
          ).governor.getEnqueuedTransactions();

          const tx = enqueuedTransactions.find(
            a => a.txHash === data.sourceChain?.transaction?.txHash || a.vaaId === data?.id,
          );

          if (tx) {
            data.releaseTimestamp = tx.releaseTime;
          }
        }

        if (status === "in_progress" && isEvmTxHash) {
          const timestamp = new Date(data?.sourceChain?.timestamp);
          const now = new Date();
          const differenceInMinutes = (now.getTime() - timestamp.getTime()) / 60000;

          // if fromChain is 5 (Polygon), wait 5 minutes before fetching block info
          if (fromChain !== 5 || differenceInMinutes >= 5) {
            getEvmBlockInfo(
              environment,
              fromChain as ChainId,
              data?.sourceChain?.transaction?.txHash,
            )
              .then(blockInfo => {
                setBlockData(blockInfo);
              })
              .catch(_err => {
                console.error("Error fetching block info");
              });
          }
        }
        // ----

        // extra relayer logic
        if (relayerInfo) {
          // Check relayer txn: if it has a redeem txn, move status to completed.
          if (relayerInfo?.targetTransaction?.targetTxHash && data && data.status !== "completed") {
            data.status = "completed";
            data.targetChain = {
              ...data?.targetChain,
              timestamp: new Date(relayerInfo?.targetTransaction?.targetTxTimestamp * 1000),
              transaction: {
                ...data?.targetChain?.transaction,
                txHash: relayerInfo.targetTransaction.targetTxHash,
              },
            };
          }

          // set relayer info
          data.relayerInfo = relayerInfo;
        }
      }

      apiTxData.sort((a, b) => {
        if (a.sequence > b.sequence) return -1;
        if (a.sequence < b.sequence) return 1;
        return 0;
      });

      setTxData(apiTxData);
      setIsLoading(false);

      // Arkham address info logic
      const newAddressesInfo: any = {};

      for (const data of apiTxData) {
        const emitterChain = data?.emitterChain as ChainId;
        const emitterAddress =
          data?.emitterAddress?.native ||
          toNative("Ethereum", data?.emitterAddress?.hex)?.toString(); // ethereum means evm here.
        const emitterInfo =
          emitterAddress && ARKHAM_CHAIN_NAME[emitterChain]
            ? await tryGetAddressInfo(network, emitterAddress)
            : null;

        const targetChain = (data?.targetChain?.chainId ||
          data?.content?.standarizedProperties?.toChain) as ChainId;
        const targetAddress = data?.content?.standarizedProperties?.toAddress;
        const targetInfo =
          targetAddress && ARKHAM_CHAIN_NAME[targetChain]
            ? await tryGetAddressInfo(network, targetAddress)
            : null;

        const sourceChain = (data?.sourceChain?.chainId ||
          data?.content?.standarizedProperties?.fromChain) as ChainId;
        const sourceAddress =
          data?.sourceChain?.from || data?.content?.standarizedProperties?.fromAddress;
        const sourceInfo =
          sourceAddress && ARKHAM_CHAIN_NAME[sourceChain]
            ? await tryGetAddressInfo(network, sourceAddress)
            : null;

        if (emitterInfo) newAddressesInfo[emitterAddress.toLowerCase()] = emitterInfo;
        if (targetInfo) newAddressesInfo[targetAddress.toLowerCase()] = targetInfo;
        if (sourceInfo) newAddressesInfo[sourceAddress.toLowerCase()] = sourceInfo;

        if (!!data.relayerInfo) {
          const fromChain = data.content?.standarizedProperties?.fromChain;
          const deliveryInstruction = data.relayerInfo.props.deliveryInstruction;
          const refundChainId = deliveryInstruction.refundChainId;
          const targetChainId = deliveryInstruction.targetChainId;

          const {
            deliveryParsedTargetAddress,
            deliveryParsedRefundAddress,
            deliveryParsedSourceProviderAddress,
            parsedEmitterAddress,
            deliveryParsedSenderAddress,
          } = data.relayerInfo.props;

          const deliveryParsedSenderAddressInfo =
            deliveryParsedSenderAddress && fromChain && ARKHAM_CHAIN_NAME[fromChain as ChainId]
              ? await tryGetAddressInfo(network, deliveryParsedSenderAddress)
              : null;

          const deliveryParsedTargetAddressInfo =
            deliveryParsedTargetAddress &&
            data.relayerInfo &&
            ARKHAM_CHAIN_NAME[targetChainId as ChainId]
              ? await tryGetAddressInfo(network, deliveryParsedTargetAddress)
              : null;

          const deliveryParsedRefundAddressInfo =
            deliveryParsedRefundAddress &&
            refundChainId &&
            ARKHAM_CHAIN_NAME[refundChainId as ChainId]
              ? await tryGetAddressInfo(network, deliveryParsedRefundAddress)
              : null;

          const deliveryParsedSourceProviderAddressInfo =
            deliveryParsedSourceProviderAddress &&
            targetChainId &&
            ARKHAM_CHAIN_NAME[targetChainId as ChainId]
              ? await tryGetAddressInfo(network, deliveryParsedSourceProviderAddress)
              : null;

          const parsedEmitterAddressInfo =
            parsedEmitterAddress && fromChain && ARKHAM_CHAIN_NAME[fromChain as ChainId]
              ? await tryGetAddressInfo(network, parsedEmitterAddress)
              : null;

          if (!newAddressesInfo[deliveryParsedTargetAddress.toLowerCase()]) {
            newAddressesInfo[deliveryParsedTargetAddress.toLowerCase()] =
              deliveryParsedTargetAddressInfo;
          }
          if (!newAddressesInfo[deliveryParsedRefundAddress.toLowerCase()]) {
            newAddressesInfo[deliveryParsedRefundAddress.toLowerCase()] =
              deliveryParsedRefundAddressInfo;
          }
          if (!newAddressesInfo[deliveryParsedSourceProviderAddress.toLowerCase()]) {
            newAddressesInfo[deliveryParsedSourceProviderAddress.toLowerCase()] =
              deliveryParsedSourceProviderAddressInfo;
          }
          if (!newAddressesInfo[parsedEmitterAddress.toLowerCase()]) {
            newAddressesInfo[parsedEmitterAddress.toLowerCase()] = parsedEmitterAddressInfo;
          }
          if (!newAddressesInfo[deliveryParsedSenderAddress.toLowerCase()]) {
            newAddressesInfo[deliveryParsedSenderAddress.toLowerCase()] =
              deliveryParsedSenderAddressInfo;
          }
        }
      }

      setAddressesInfo(newAddressesInfo);
    },
    [
      chainLimitsData,
      environment,
      isEvmTxHash,
      network,
      setAddressesInfo,
      setShowSourceTokenUrl,
      setShowTargetTokenUrl,
      txHash,
      VAAId,
    ],
  );

  const prevVAADataRef = useRef<string | null>(null);

  useEffect(() => {
    if (!VAAData) return;

    const currentVAADataStr = stringifyWithStringBigInt(VAAData);

    if (currentVAADataStr === prevVAADataRef.current) return;

    prevVAADataRef.current = currentVAADataStr;
    setErrorCode(undefined);
    processVaaData(VAAData);
  }, [VAAData, processVaaData]);

  const updateTxData = (newData: GetOperationsOutput, i: number) => {
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
        ) : observationsOnlyData ? (
          <>
            <div className="tx-page-observation-only">
              <Top
                txHash={observationsOnlyData.txHash}
                emitterChainId={observationsOnlyData.emitterChain}
                gatewayInfo={null}
                payloadType={null}
              />
              <div>
                There is no VAA for this transaction yet. This page will refresh automatically in 30
                seconds
              </div>
              <br />
              <div>
                Signatures: {observationsOnlyData.signatures?.length} /{" "}
                {environment.network === "Mainnet" ? "13" : "1"}
              </div>
              <br />
              <div>
                VAA ID: {observationsOnlyData.observations[0].id.split("/").slice(0, -2).join("/")}
                {/* VAA ID: {observationsOnlyData.observations[0].emitterChain}/
              {observationsOnlyData.observations[0].emitterAddr}/
              {`${observationsOnlyData.observations[0].sequence}`} */}
              </div>
            </div>
            <br />

            <BlockSection
              code={JSON.stringify(observationsOnlyData.signatures, null, 4)}
              title="Signatures Data"
            />
            <BlockSection
              code={JSON.stringify(observationsOnlyData.observations, null, 4)}
              title="Observations Data"
            />
          </>
        ) : (
          txData?.map(
            (data, i) =>
              txData && (
                <Information
                  key={data.id || `vaa-${i}`}
                  blockData={blockData}
                  data={data}
                  extraRawInfo={extraRawInfo}
                  hasMultipleTxs={txData.length > 1}
                  isRPC={isRPC}
                  setTxData={newData => updateTxData(newData, i)}
                  txIndex={i}
                />
              ),
          )
        )}
      </div>
    </BaseLayout>
  );
};

export default Tx;
