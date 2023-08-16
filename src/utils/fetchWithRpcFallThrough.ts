import { Environment } from "./environment";
import { ethers } from "ethers";

export function fetchWithRpcFallThrough(env: Environment, searchValue: string): Promise<any> {
  //First, do a normal search.
  //If successful, return the result.

  //Else, pattern match the search value to see if it's a candidate for being an EVM transaction hash.

  //If it is, fire at all the RPC endpoints and see if any of them return a result.

  //If any of them return a result, hand the receipt over to the data processor, and return the resultant lifecycle object.

  //Else, promise reject

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
