import { ChainId } from "@certusone/wormhole-sdk";
import { Environment, SLOW_FINALITY_CHAINS, getChainInfo, getEthersProvider } from "./environment";
import { ethers } from "ethers";

type TxReceiptHolder = {
  receipt: ethers.providers.TransactionReceipt;
  chainId: ChainId;
};

export function fetchWithRpcFallThrough(env: Environment, searchValue: string): Promise<any> {
  //First, do a normal search.
  //If successful, return the result.

  //Else, pattern match the search value to see if it's a candidate for being an EVM transaction hash.
  const isTxHash = searchValue.match(/0x[0-9a-fA-F]{64}/);

  //If it is, fire at all the RPC endpoints and see if any of them return a result.

  //If any of them return a result, hand the receipt over to the data processor, and return the resultant lifecycle object.

  //Else, promise reject

  return null;
}

async function hitAllSlowChains(
  env: Environment,
  searchValue: string,
): Promise<TxReceiptHolder | null> {
  //map of chainId to promises
  const allPromises: Map<ChainId, Promise<ethers.providers.TransactionReceipt | null>> = new Map();
  for (const chain of SLOW_FINALITY_CHAINS) {
    const ethersProvider = getEthersProvider(getChainInfo(env, chain as ChainId));
    const thisPromise = ethersProvider
      .getTransactionReceipt(searchValue)
      .then(receipt => {
        if (receipt.confirmations > 0) {
          return receipt;
        } else {
          return null;
        }
      })
      .catch(err => {
        return null;
      });
    allPromises.set(chain as ChainId, thisPromise);
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

export function convertTransactionReceiptToLifecycleObject(
  receipt: ethers.providers.TransactionReceipt,
): any {
  //Four cases currently supported
  //Token bridge basic transfer
  //Automatic Relayer Delivery
  //Unknown VAA
  //Non-wormhole transaction
  return null;
}
