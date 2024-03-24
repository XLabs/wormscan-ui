import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Loader } from "src/components/atoms";
import { SearchNotFound } from "src/components/organisms";
import { BaseLayout } from "src/layouts/BaseLayout";
import {
  fetchWithRpcFallThrough,
  getEvmBlockInfo,
  getTokenInformation,
  getUsdcAddress,
} from "src/utils/fetchWithRPCsFallthrough";
import { formatUnits, parseTx } from "src/utils/crypto";
import { ChainId } from "src/api";
import { getClient } from "src/api/Client";
import analytics from "src/analytics";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import { GetBlockData } from "src/api/search/types";
import { Information } from "./Information";
import { Top } from "./Top";
import "./styles.scss";
import { getChainName } from "src/utils/wormhole";
import { getAlgorandTokenInfo, tryGetWrappedToken } from "src/utils/cryptoToolkit";
import { getPorticoInfo } from "src/utils/wh-portico-rpc";
import { useRecoilState } from "recoil";
import { showSourceTokenUrlState, showTargetTokenUrlState } from "src/utils/recoilStates";
import {
  CCTP_APP_ID,
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  GATEWAY_APP_ID,
  GR_APP_ID,
  IStatus,
  NTT_APP_ID,
  PORTAL_APP_ID,
  UNKNOWN_APP_ID,
  canWeGetDestinationTx,
  getGuardianSet,
} from "src/consts";
import { CHAIN_ID_SOLANA, parseVaa } from "@certusone/wormhole-sdk";
import { getNttInfo } from "src/utils/wh-ntt-rpc";

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
  const [isRPC, setIsRPC] = useState(false);
  const [emitterChainId, setEmitterChainId] = useState<ChainId | undefined>(undefined);
  const [extraRawInfo, setExtraRawInfo] = useState(null);
  const [blockData, setBlockData] = useState<GetBlockData>(null);

  const cancelRequests = useRef(false);
  const tryToGetRpcInfo = useCallback(async () => {
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
  }, [environment, network, txHash]);

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

  const [isInProgress, setIsInProgress] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const { data: VAADataByTx } = useQuery(
    ["getVAAbyTxHash", txHash],
    async () => {
      const otherNetwork = network === "MAINNET" ? "TESTNET" : "MAINNET";

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
        .catch(() => {
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

      const currentNetworkResponse = await getClient().guardianNetwork.getOperations({
        vaaID: `${chainId}/${emitter}/${seq}`,
      });
      if (!!currentNetworkResponse) return currentNetworkResponse;

      const otherNetworkResponse = await getClient(otherNetwork).guardianNetwork.getOperations({
        vaaID: `${chainId}/${emitter}/${seq}`,
      });
      if (!!otherNetworkResponse) return otherNetworkResponse;

      throw new Error("no vaaID data");
    },
    {
      onError: (err: Error) => {
        console.log("err", err);
        showSearchNotFound(err);
      },
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
    { enabled: failCount > 0 || isInProgress },
  );

  const VAAData: GetOperationsOutput[] = useMemo(() => {
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
    async (apiTxData: GetOperationsOutput[]) => {
      if (!emitterChainId && !!apiTxData.length) {
        setEmitterChainId(apiTxData[0].emitterChain);
        return;
      }

      // Check if its generic relayer tx without vaa and go with RPCs
      // TODO: handle generic relayer no-vaa txns without RPCs
      for (const data of apiTxData) {
        if (data?.content?.standarizedProperties?.appIds?.includes(GR_APP_ID) && !data?.vaa?.raw) {
          await tryToGetRpcInfo();
        }
      }

      // Signed VAA logic
      for (const data of apiTxData) {
        const vaa = data.vaa?.raw;
        if (!vaa) break;

        const guardianSetIndex = data.vaa.guardianSetIndex;
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

        data.decodedVaa = {
          ...parsedVaa,
          payload: parsedVaa.payload ? Buffer.from(parsedVaa.payload).toString("hex") : null,
          emitterAddress: parsedEmitterAddress,
          guardianSignatures: parsedGuardianSignatures,
          hash: parsedHash,
          sequence: parsedSequence,
        };
      }

      // check CCTP
      for (const data of apiTxData) {
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
              data.content?.standarizedProperties?.toChain,
            );
          }

          // if destinationTx is not there, we get it from relayer endpoint
          // or if the real chainId is probably ArbitrumSepolia, BaseSepolia or OptimismSepolia
          if (
            !data.targetChain?.transaction?.txHash ||
            (network === "TESTNET" &&
              (data.content.standarizedProperties.fromChain === ChainId.Arbitrum ||
                data.content.standarizedProperties.fromChain === ChainId.Base ||
                data.content.standarizedProperties.fromChain === ChainId.Optimism ||
                data.content.standarizedProperties.toChain === ChainId.Arbitrum ||
                data.content.standarizedProperties.toChain === ChainId.Base ||
                data.content.standarizedProperties.toChain === ChainId.Optimism))
          ) {
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

            if (relayResponse?.to?.recipientAddress) {
              data.content.standarizedProperties.toAddress = relayResponse?.to?.recipientAddress;
            }
            if (relayResponse?.fee?.amount) {
              data.content.standarizedProperties.fee =
                "" +
                (relayResponse?.fee?.amount + (relayResponse?.from?.amountToSwap || 0)) * 100000000;
            }
          }
        }
      }

      // check NTT
      for (const data of apiTxData) {
        if (data?.content?.standarizedProperties?.appIds?.includes(NTT_APP_ID)) {
          const parsedPayload = data?.content?.payload?.nttMessage
            ? data?.content?.payload
            : data?.content?.payload?.parsedPayload;

          if (
            (!data.data?.tokenAmount || !data.content?.standarizedProperties?.amount) &&
            !!parsedPayload?.nttMessage?.trimmedAmount?.amount
          ) {
            const decimals = parsedPayload?.nttMessage?.trimmedAmount?.decimals;

            const amount = String(
              +parsedPayload?.nttMessage?.trimmedAmount?.amount / 10 ** decimals,
            );

            data.content.payload = {
              ...data.content.payload,
              payloadType: 1,
              amount: parsedPayload?.nttMessage?.trimmedAmount?.amount,
            };

            const nttInfo = await getNttInfo(environment, data, parsedPayload);

            let tokenInfo = { symbol: "" };
            if (data.sourceChain?.chainId !== CHAIN_ID_SOLANA) {
              tokenInfo = await getTokenInformation(
                data.sourceChain?.chainId,
                environment,
                data.content?.standarizedProperties?.tokenAddress,
              );
            } else {
              tokenInfo = await getTokenInformation(
                data.content?.standarizedProperties?.toChain,
                environment,
                nttInfo?.targetTokenAddress,
              );
            }

            data.data = {
              tokenAmount: amount,
              symbol: tokenInfo.symbol,
              usdAmount: null,
            };

            if (nttInfo?.targetTokenAddress) {
              data.content.standarizedProperties.wrappedTokenAddress = nttInfo.targetTokenAddress;
              data.content.standarizedProperties.wrappedTokenSymbol = tokenInfo.symbol;
            }
          }
        }
      }

      // if there's no tokenAmount or symbol, try to get them with RPC info
      for (const data of apiTxData) {
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

            if (amount && tokenInfo.tokenDecimals) {
              data.data = {
                tokenAmount: "" + formatUnits(+amount, tokenInfo.tokenDecimals),
                symbol: tokenInfo.symbol,
                usdAmount: data?.data?.usdAmount || null,
              };
            }
          }
        }
      }

      // try to get wrapped token address and symbol
      let wrappedTokenChain = null;
      for (const data of apiTxData) {
        if (data?.content?.standarizedProperties?.appIds?.includes(PORTAL_APP_ID)) {
          if (
            data?.content?.standarizedProperties?.fromChain &&
            data?.content?.standarizedProperties?.tokenAddress &&
            data?.content?.standarizedProperties?.tokenChain &&
            data?.content?.standarizedProperties?.toChain
          ) {
            const { fromChain, tokenAddress, tokenChain, toChain } =
              data.content.standarizedProperties;

            const wrapped = tokenChain !== toChain ? "target" : "source";

            // wormhole gateway detect (for ibc token)
            let gatewayChain: ChainId = null;
            if (
              wrapped === "target" &&
              !!data.content?.payload?.parsedPayload?.gateway_transfer?.chain
            ) {
              gatewayChain = data.content?.payload?.parsedPayload?.gateway_transfer?.chain;
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
      }

      // get algorand extra informations needed
      for (const data of apiTxData) {
        if (
          data?.content?.standarizedProperties?.tokenChain === ChainId.Algorand &&
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
              data.data.tokenAmount = `${+data.content.payload.amount / 10 ** tokenInfo.decimals}`;
            }
            if (tokenInfo.symbol && !data?.data?.symbol) {
              data.data.symbol = tokenInfo.symbol;
            }
          }
        }

        if (wrappedTokenChain === ChainId.Algorand) {
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
      }

      // check Eth Bridge
      for (const data of apiTxData) {
        if (data?.content?.standarizedProperties?.appIds?.includes(ETH_BRIDGE_APP_ID)) {
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

            data.content.standarizedProperties.overwriteSourceTokenAddress = tokenAddress;
            data.content.standarizedProperties.overwriteSourceTokenChain = data?.content
              ?.standarizedProperties?.fromChain as ChainId;

            data.content.standarizedProperties.overwriteTargetTokenAddress = redeemTokenAddress;
            data.content.standarizedProperties.overwriteTargetTokenChain = data?.content
              ?.standarizedProperties?.toChain as ChainId;

            data.content.payload.parsedPayload = parsedPayload;
            if (!data.content.standarizedProperties.appIds.includes(ETH_BRIDGE_APP_ID)) {
              data.content.standarizedProperties.appIds.push(ETH_BRIDGE_APP_ID);
            }

            setShowSourceTokenUrl(shouldShowSourceTokenUrl);
            setShowTargetTokenUrl(shouldShowTargetTokenUrl);

            if (sourceSymbol)
              data.content.standarizedProperties.overwriteSourceSymbol = sourceSymbol;
            if (targetSymbol)
              data.content.standarizedProperties.overwriteTargetSymbol = targetSymbol;

            if (formattedFinalUserAmount)
              data.content.standarizedProperties.overwriteRedeemAmount = formattedFinalUserAmount;
            data.content.standarizedProperties.overwriteFee = formattedRelayerFee;
          }
        }
      }

      // track analytics on non-rpc and non-generic-relayer txs (those are tracked on other place)
      for (const data of apiTxData) {
        if (!data?.content?.standarizedProperties?.appIds?.includes(GR_APP_ID)) {
          const appIds = data?.content?.standarizedProperties?.appIds?.filter(a => a !== "UNKNOWN");

          analytics.track("txDetail", {
            appIds: appIds?.join(", ") ? appIds.join(", ") : "null",
            chain: getChainName({ chainId: data?.emitterChain ?? 0, network }),
            toChain: getChainName({
              chainId: data?.content?.standarizedProperties?.toChain ?? 0,
              network,
            }),
          });
        }
      }

      // Add STATUS logic
      for (const data of apiTxData) {
        const { fromChain, appIds } = data?.content?.standarizedProperties || {};
        const payloadType = data?.content?.payload?.payloadType;
        const isTransferWithPayload = payloadType === 3;
        const vaa = data?.vaa?.raw;

        const isCCTP = appIds?.includes(CCTP_APP_ID);
        const isConnect = appIds?.includes(CONNECT_APP_ID);
        const isPortal = appIds?.includes(PORTAL_APP_ID);
        const isTBTC = !!appIds?.find(appId => appId.toLowerCase().includes("tbtc"));
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

        const STATUS: IStatus = data?.targetChain?.transaction?.txHash
          ? "COMPLETED"
          : appIds && appIds.includes("CCTP_MANUAL")
          ? "EXTERNAL_TX"
          : vaa
          ? isConnect || isPortal || isCCTP
            ? (canWeGetDestinationTx(data?.content?.standarizedProperties?.toChain) &&
                !hasAnotherApp &&
                (!isTransferWithPayload ||
                  (isTransferWithPayload && isConnect) ||
                  (isTransferWithPayload && isTBTC))) ||
              isCCTP
              ? "PENDING_REDEEM"
              : "VAA_EMITTED"
            : "VAA_EMITTED"
          : "IN_PROGRESS";

        data.STATUS = STATUS;
        setIsInProgress(STATUS === "IN_PROGRESS");

        if (STATUS === "IN_PROGRESS" && isEvmTxHash) {
          const timestamp = new Date(data?.sourceChain?.timestamp);
          const now = new Date();
          const differenceInMinutes = (now.getTime() - timestamp.getTime()) / 60000;

          // if fromChain is 5 (Polygon), wait 5 minutes before fetching block info
          if (fromChain !== 5 || differenceInMinutes >= 5) {
            getEvmBlockInfo(environment, fromChain, data?.sourceChain?.transaction?.txHash)
              .then(blockInfo => {
                setBlockData(blockInfo);
              })
              .catch(_err => {
                console.error("Error fetching block info");
              });
          }
        }
      }

      setTxData(apiTxData);
      setIsLoading(false);
    },
    [
      emitterChainId,
      environment,
      isEvmTxHash,
      network,
      setShowSourceTokenUrl,
      setShowTargetTokenUrl,
      tryToGetRpcInfo,
    ],
  );

  useEffect(() => {
    if (!VAAData) return;
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
