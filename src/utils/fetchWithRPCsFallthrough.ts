import {
  CONTRACTS,
  coalesceChainName,
  isCosmWasmChain,
  isEVMChain,
  uint8ArrayToHex,
} from "@certusone/wormhole-sdk";
import { Environment, SLOW_FINALITY_CHAINS, getChainInfo, getEthersProvider } from "./environment";
import { ethers } from "ethers";
import { Implementation__factory } from "@certusone/wormhole-sdk/lib/cjs/ethers-contracts";
import { parseAddress } from "./crypto";
import { humanAddress } from "@certusone/wormhole-sdk/lib/cjs/cosmos";
import { ChainId } from "@xlabs-libs/wormscan-sdk";

type TxReceiptHolder = {
  receipt: ethers.providers.TransactionReceipt;
  chainId: ChainId;
};

async function hitAllSlowChains(
  env: Environment,
  searchValue: string,
): Promise<TxReceiptHolder | null> {
  //map of chainId to promises
  const allPromises: Map<ChainId, Promise<ethers.providers.TransactionReceipt | null>> = new Map();

  for (const chain of SLOW_FINALITY_CHAINS) {
    const ethersProvider = getEthersProvider(getChainInfo(env, chain as ChainId));

    if (ethersProvider) {
      const thisPromise = ethersProvider
        .getTransactionReceipt(searchValue)
        .then(receipt => {
          if (receipt.confirmations > 0) {
            console.log(`tx is from chain ${chain}`);
            return receipt;
          } else {
            console.log(`no confirmations for this tx on chain ${chain}`);
            return null;
          }
        })
        .catch(_err => {
          console.log(`tx is not from chain ${chain}`);
          return null;
        });
      allPromises.set(chain as ChainId, thisPromise);
    } else {
      console.log("no ethers provider for", { chain, searchValue });
    }
  }

  //filter over all the promises, return the first one that's not null
  for (const [chainId, promise] of allPromises.entries()) {
    const receipt = await promise;
    if (receipt) {
      return { receipt, chainId };
    }
  }

  return null;
}

// Before this, a normal search should be performed.
// If unsuccessful, we hit the RPCs.
export async function fetchWithRpcFallThrough(env: Environment, searchValue: string) {
  const search = searchValue.startsWith("0x") ? searchValue : "0x" + searchValue;

  // pattern match the search value to see if it's a candidate for being an EVM transaction hash.
  const isTxHash = !!search.match(/0x[0-9a-fA-F]{64}/);

  //If it is, fire at all the RPC endpoints and see if any of them return a result.
  if (isTxHash) {
    const result = await hitAllSlowChains(env, search);

    if (result) {
      const chainName = coalesceChainName(result.chainId);

      // This is the hash for topic[0] of the core contract event LogMessagePublished
      // https://github.com/wormhole-foundation/wormhole/blob/main/ethereum/contracts/Implementation.sol#L12
      const LOG_MESSAGE_PUBLISHED_TOPIC =
        "0x6eb224fb001ed210e379b335e35efe88672a8ce935d981a6896b27ffdf52a3b2";

      const txsData = result.receipt?.logs
        .filter(
          l =>
            l.address.toLowerCase() === CONTRACTS[env.network][chainName].core?.toLowerCase() &&
            l.topics[0] === LOG_MESSAGE_PUBLISHED_TOPIC,
        )
        .map(async l => {
          const { args } = Implementation__factory.createInterface().parseLog(l);
          const { consistencyLevel, payload, sender, sequence } = args;

          const emitterAddress = l.topics[1].slice(2);
          const emitterNattiveAddress = parseAddress({
            chainId: result.chainId,
            value: emitterAddress,
          });

          // getting block to read the timestamp
          const ethersProvider = getEthersProvider(getChainInfo(env, result.chainId as ChainId));
          const block = await ethersProvider.getBlock(result.receipt.blockNumber);
          const timestamp = ethers.BigNumber.from(block.timestamp).toNumber() * 1000;

          let fromAddress = result.receipt.from;
          let parsedFromAddress = parseAddress({
            chainId: result.chainId,
            value: fromAddress,
          });

          // checking if we know how to read the payloads:
          //   token bridge
          const TOKEN_BRIDGE_CONTRACT = CONTRACTS[env.network][chainName].token_bridge;
          if (emitterNattiveAddress.toUpperCase() === TOKEN_BRIDGE_CONTRACT.toUpperCase()) {
            const buff = Buffer.from(payload.slice(2), "hex");
            const payloadType = buff.subarray(0, 1)?.[0];
            const amount = BigInt(`0x${buff.subarray(1, 33).toString("hex")}`).toString();

            const tokenChain = buff.readUInt16BE(65);
            const tokenAddress = buff.subarray(33, 65)?.toString("hex");

            let toAddress = buff.subarray(67, 99)?.toString("hex");
            const toChain = buff.readUInt16BE(99);

            const fee =
              payloadType === 1 ? BigInt(`0x${buff.subarray(101, 133).toString("hex")}`) : null;

            fromAddress =
              payloadType === 3 ? buff.subarray(101, 133)?.toString("hex") : result.receipt.from;

            parsedFromAddress = parseAddress({
              chainId: result.chainId,
              value: fromAddress,
            });

            const tokenTransferPayload =
              payloadType === 3 ? buff.subarray(133)?.toString("hex") : null;

            // other values
            const parsedTokenAddress = parseAddress({
              chainId: tokenChain as ChainId,
              value: tokenAddress,
            });

            if (isCosmWasmChain(toChain as ChainId)) {
              const addressBytes = ethers.utils.arrayify("0x" + toAddress);
              /* TODO ??
               * backend should probably NOT use last20bytes and use all bytes here.
               * but for now, to maintain the same info with or without VAA, we use last 20 bytes */
              const addressLast20Bytes = new Uint8Array(addressBytes.buffer.slice(-20));
              const cosmAddr = humanAddress("sei", addressLast20Bytes);
              toAddress = cosmAddr;
            }

            const { name, symbol, tokenDecimals } = await getTokenInformation(
              tokenChain,
              env,
              parsedTokenAddress,
            );
            const decimals = tokenDecimals ? Math.min(8, tokenDecimals) : 8;
            return {
              appIds: ["PORTAL_TOKEN_BRIDGE"],
              amount: amount && decimals ? ethers.utils.formatUnits(amount, decimals) : null,
              chain: result.chainId,
              consistencyLevel,
              emitterAddress,
              emitterNattiveAddress,
              fee,
              fromAddress: parsedFromAddress,
              id: `${result.chainId}/${emitterAddress}/${sequence}`,
              name,
              payloadType,
              sender,
              sequence: sequence.toString(),
              symbol,
              timestamp,
              toAddress,
              toChain,
              tokenAddress: parsedTokenAddress,
              tokenChain,
              tokenTransferPayload,
              txHash: search,
              usdAmount: null, // TODO? should use coingecko or similar if needed.
            };
          }
          // CCTP USDC-BRIDGE
          else if (
            emitterNattiveAddress.toUpperCase() ===
            getCctpEmitterAddress(env, result.chainId).toUpperCase()
          ) {
            const parseCCTPRelayerPayload = (payloadArray: Buffer): CircleRelayerPayload => {
              // start vaa payload
              let offset = 0;
              const version = payloadArray.readUint8(offset);
              offset += 1; // 1
              const tokenAddress = parseAddress({
                chainId: result.chainId,
                value: payloadArray.subarray(offset, offset + 32)?.toString("hex"),
              });
              offset += 32; // 33
              const amount = ethers.BigNumber.from(payloadArray.subarray(offset, offset + 32));
              offset += 32; // 65
              const fromDomain = payloadArray.readUInt32BE(offset);
              offset += 4; // 69
              const toDomain = payloadArray.readUInt32BE(offset);
              offset += 4; // 73

              function readBigUint64BE(arr: any, offset = 0) {
                let result = BigInt(0);
                for (let i = 0; i < 8; i++) {
                  result = (result << BigInt(8)) + BigInt(arr[offset + i]);
                }
                return result;
              }
              const nonce = readBigUint64BE(payloadArray, offset).toString();
              offset += 8; // 81
              const fromAddressBytes = payloadArray.subarray(offset, offset + 32);
              offset += 32; // 113
              const mintRecipientBuff = payloadArray.subarray(offset, offset + 32);
              offset += 32; // 145
              offset += 2; // 147 (2 bytes for payload length)
              const payload = payloadArray.subarray(offset);
              // end vaa payload

              // start payload of vaa payload reading
              offset = 0;
              const payloadId = payload.readUint8(offset);
              offset += 1; // 148
              const feeAmount = ethers.BigNumber.from(payload.subarray(offset, offset + 32));
              offset += 32; // 180
              const toNativeAmount = ethers.BigNumber.from(payload.subarray(offset, offset + 32));
              offset += 32; // 212
              const recipientWalletBytes = Uint8Array.from(payload.subarray(offset, offset + 32));
              const toAddress = uint8ArrayToHex(recipientWalletBytes);
              // end payload

              const circleInfo = {
                amount,
                feeAmount,
                fromAddressBytes,
                fromDomain,
                mintRecipientBuff,
                nonce,
                payload,
                payloadId,
                toAddress,
                toDomain,
                tokenAddress,
                toNativeAmount,
                version,
              };
              return circleInfo;
            };

            const cctpResult = parseCCTPRelayerPayload(Buffer.from(payload.slice(2), "hex"));
            const amount = "" + 0.000001 * +cctpResult.amount; // 6 decimals for USDC

            return {
              appIds: ["CCTP_WORMHOLE_INTEGRATION"],
              amount,
              chain: result.chainId,
              consistencyLevel,
              emitterAddress,
              emitterNattiveAddress,
              fromAddress,
              id: `${result.chainId}/${emitterAddress}/${sequence}`,
              parsedFromAddress,
              sequence: sequence.toString(),
              symbol: "USDC",
              timestamp,
              toAddress: cctpResult.toAddress,
              toChain: getCctpDomain(cctpResult.fromDomain),
              tokenAddress: cctpResult.tokenAddress,
              tokenChain: result.chainId,
              txHash: search,
              usdAmount: amount,
            };
          }
          // default, no token-bridge nor cctp ones (can add other payload readers here)
          else {
            return null;
          }
        });

      return !!txsData.length ? txsData : null;
    } else {
      return null;
    }
  }

  return null;
}

// CCTP UTILS -----
interface CircleRelayerPayload {
  amount: ethers.BigNumber;
  feeAmount: ethers.BigNumber;
  fromAddressBytes: Buffer;
  fromDomain: number;
  mintRecipientBuff: Buffer;
  nonce: string;
  payload: Buffer;
  payloadId: number;
  toAddress: string;
  toDomain: number;
  tokenAddress: string;
  toNativeAmount: ethers.BigNumber;
  version: number;
}

const getCctpDomain = (dom: any) => {
  if (dom === 0) return ChainId.Ethereum;
  if (dom === 1) return ChainId.Avalanche;
  if (dom === 2) return ChainId.Optimism;
  if (dom === 3) return ChainId.Arbitrum;
  return null;
};

const getCctpEmitterAddress = (env: Environment, chain: ChainId) => {
  if (env.network === "MAINNET") {
    if (chain === ChainId.Ethereum) return "0xaada05bd399372f0b0463744c09113c137636f6a";
    if (chain === ChainId.Avalanche) return "0x09fb06a271faff70a651047395aaeb6265265f13";
    if (chain === ChainId.Arbitrum) return "0x2703483B1a5a7c577e8680de9Df8Be03c6f30e3c";
  } else {
    if (chain === ChainId.Ethereum) return "0x0a69146716b3a21622287efa1607424c663069a4";
    if (chain === ChainId.Avalanche) return "0x58f4c17449c90665891c42e14d34aae7a26a472e";
    if (chain === ChainId.Arbitrum) return "0x2e8f5e00a9c5d450a72700546b89e2b70dfb00f2";
  }
  return null;
};
// -----

// RPCs UTILS -----
const getSolanaTokenDetails = async (mintAddress: string) => {
  try {
    // Fetch the Solana token list
    const response = await fetch(
      "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json",
    );
    const data = await response.json();

    // Search for the token by its mint address
    const token = data?.tokens?.find((token: any) => token.address === mintAddress);

    if (token) {
      return { name: token.name, symbol: token.symbol };
    }
    return null;
  } catch (error) {
    return null;
  }
};

const getEvmTokenDetails = async (env: Environment, tokenChain: ChainId, tokenAddress: string) => {
  const tokenInterfaceAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ];

  try {
    const tokenEthersProvider = getEthersProvider(getChainInfo(env, tokenChain as ChainId));
    const contract = new ethers.Contract(tokenAddress, tokenInterfaceAbi, tokenEthersProvider);
    const [name, symbol, tokenDecimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);
    return { name, symbol, tokenDecimals };
  } catch (error) {
    console.error("Error fetching token info:", error);
    return { name: "Unknown", symbol: "Unknown" };
  }
};

const getTokenInformation = async (
  tokenChain: number,
  env: Environment,
  parsedTokenAddress: string,
) => {
  // get token information
  let name: string;
  let symbol: string;
  let tokenDecimals: number;

  // evm token
  if (isEVMChain(tokenChain as ChainId)) {
    const tokenResult = await getEvmTokenDetails(env, tokenChain, parsedTokenAddress);

    name = tokenResult.name;
    symbol = tokenResult.symbol;
    tokenDecimals = tokenResult.tokenDecimals;
  }

  // solana token
  if (tokenChain === ChainId.Solana) {
    const tokenResult = await getSolanaTokenDetails(parsedTokenAddress);
    name = tokenResult.name;
    symbol = tokenResult.symbol;
  }

  return { name, symbol, tokenDecimals };
};
