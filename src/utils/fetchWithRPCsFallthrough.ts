import { CONTRACTS, ChainId, coalesceChainName, isCosmWasmChain } from "@certusone/wormhole-sdk";
import { Environment, SLOW_FINALITY_CHAINS, getChainInfo, getEthersProvider } from "./environment";
import { ethers } from "ethers";
import { Implementation__factory } from "@certusone/wormhole-sdk/lib/cjs/ethers-contracts";
import { parseAddress } from "./crypto";
import { humanAddress } from "@certusone/wormhole-sdk/lib/cjs/cosmos";

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

            // get token information
            const tokenInterfaceAbi = [
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function decimals() view returns (uint8)",
            ];

            const { name, symbol, decimals } = await (async () => {
              try {
                const tokenEthersProvider = getEthersProvider(
                  getChainInfo(env, tokenChain as ChainId),
                );
                const contract = new ethers.Contract(
                  parsedTokenAddress,
                  tokenInterfaceAbi,
                  tokenEthersProvider,
                );
                const [name, symbol, decimals] = await Promise.all([
                  contract.name(),
                  contract.symbol(),
                  contract.decimals(),
                ]);
                return { name, symbol, decimals };
              } catch (error) {
                console.error("Error fetching token info:", error);
                return { name: "Unknown", symbol: "Unknown" };
              }
            })();

            return {
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
            };
          }
          // default, non token-bridge ones (can add other payload readers here)
          else {
            return {
              chain: result.chainId,
              consistencyLevel,
              emitterAddress,
              emitterNattiveAddress,
              fromAddress,
              id: `${result.chainId}/${emitterAddress}/${sequence}`,
              parsedFromAddress,
              sequence: sequence.toString(),
              timestamp,
              txHash: search,
            };
          }
        });

      return !!txsData.length ? txsData : null;
    } else {
      return null;
    }
  }

  return null;
}
