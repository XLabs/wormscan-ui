import { chainToChainId, ChainId } from "@wormhole-foundation/sdk";

const connectAddresses: any = {
  Mainnet: {
    [chainToChainId("Ethereum")]: [
      "000000000000000000000000cafd2f0a35a4459fa40c0517e17e6fa2939441ca",
      "000000000000000000000000461a8878060aa45fa685732bff654ca1fdef2830",
    ],
    [chainToChainId("Bsc")]: [
      "000000000000000000000000cafd2f0a35a4459fa40c0517e17e6fa2939441ca",
      "000000000000000000000000461a8878060aa45fa685732bff654ca1fdef2830",
    ],
    [chainToChainId("Polygon")]: [
      "000000000000000000000000cafd2f0a35a4459fa40c0517e17e6fa2939441ca",
      "000000000000000000000000461a8878060aa45fa685732bff654ca1fdef2830",
    ],
    [chainToChainId("Avalanche")]: [
      "000000000000000000000000cafd2f0a35a4459fa40c0517e17e6fa2939441ca",
      "000000000000000000000000461a8878060aa45fa685732bff654ca1fdef2830",
    ],
    [chainToChainId("Fantom")]: [
      "000000000000000000000000cafd2f0a35a4459fa40c0517e17e6fa2939441ca",
      "000000000000000000000000461a8878060aa45fa685732bff654ca1fdef2830",
    ],
    [chainToChainId("Celo")]: [
      "000000000000000000000000cafd2f0a35a4459fa40c0517e17e6fa2939441ca",
      "000000000000000000000000461a8878060aa45fa685732bff654ca1fdef2830",
    ],
    [chainToChainId("Moonbeam")]: [
      "000000000000000000000000cafd2f0a35a4459fa40c0517e17e6fa2939441ca",
      "000000000000000000000000461a8878060aa45fa685732bff654ca1fdef2830",
    ],
    [chainToChainId("Sui")]: [
      "c4c610707eab9b222996b075f7d07c7d9b07766ab7bcafef621fd53bbf089f4e",
      "44cd5861a6732696d2122e5d1123c3b86c8146c2fe78fd957378fc9ce28b9c41",
    ],
  },
  Testnet: {
    [chainToChainId("Ethereum")]: [
      "000000000000000000000000e32b14c48e4b7c6825b855f231786fe5ba9ce014",
    ],
    [chainToChainId("Bsc")]: ["00000000000000000000000049a401f7fa594bc618a7a39b316b78e329620103"],
    [chainToChainId("Polygon")]: [
      "000000000000000000000000953a2342496b15d69dec25c8e62274995e82d243",
    ],
    [chainToChainId("PolygonSepolia")]: [
      "000000000000000000000000953a2342496b15d69dec25c8e62274995e82d243",
    ],
    [chainToChainId("Avalanche")]: [
      "0000000000000000000000008369839932222c1ca3bc7d16f970c56f61993a44",
    ],
    [chainToChainId("Fantom")]: [
      "0000000000000000000000005122298f68341a088c5370d7678e13912e4ed378",
    ],
    [chainToChainId("Celo")]: ["0000000000000000000000005c9da01cbf5088ee660b9701dc526c6e5df1c239"],
    [chainToChainId("Moonbeam")]: [
      "000000000000000000000000a098368aaadc0fdf3e309cda710d7a5f8bdeecd9",
    ],
    [chainToChainId("Sui")]: ["805094a77dc75a5c204e98995e5394612554fa5901a1adaf8ca31dac31dba3e5"],
  },
};
export function isConnect(network: any, emitterChain: ChainId, fromAddress: string) {
  const address = fromAddress.toLowerCase();
  return connectAddresses[network][emitterChain]?.includes(address) ?? false;
}

export interface ConnectPayload {
  payloadId: number; // == 1  // uint8
  targetRelayerFee: string; // uint256
  toNativeTokenAmount: string; // uint256
  recipientWallet: string; // bytes32 as wormhole hex formatted addr
}

export function parseConnectPayload(payload: Buffer): ConnectPayload {
  let index = 0;

  // parse the payloadId
  const payloadId = payload.readUint8(index);
  index += 1;

  // target relayer fee
  const targetRelayerFee = BigInt(
    "0x" + payload.slice(index, index + 32).toString("hex"),
  ).toString(); // uint256
  index += 32;

  // amount of tokens to convert to native assets
  const toNativeTokenAmount = BigInt(
    "0x" + payload.slice(index, index + 32).toString("hex"),
  ).toString(); // uint256
  index += 32;

  // recipient of the transferred tokens and native assets
  const recipientWallet = payload.slice(index, index + 32).toString("hex");

  index += 32;

  if (index !== payload.length) {
    throw new Error("invalid message length");
  }
  return {
    payloadId,
    targetRelayerFee,
    recipientWallet,
    toNativeTokenAmount,
  };
}
