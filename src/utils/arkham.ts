import { ChainId, chainToChainId } from "@wormhole-foundation/sdk";

export interface IArkhamInfoByChain {
  address?: string;
  chain?: string;
  arkhamEntity?: {
    name?: string;
    note?: string;
    id?: string;
    type?: string;
    service?: any;
    addresses?: any;
    website?: string;
    twitter?: string;
    crunchbase?: string;
  };
  arkhamLabel?: {
    address?: string;
    chainType?: string;
    name?: string;
  };
  isUserAddress?: boolean;
  contract?: boolean;
  populatedTags: Array<{
    id: string;
    label?: string;
    rank?: number;
    excludeEntities: boolean;
    chain?: string;
    disablePage?: boolean;
  }>;
}

export interface IArkhamResponse {
  arbitrum_one?: IArkhamInfoByChain;
  avalanche?: IArkhamInfoByChain;
  base?: IArkhamInfoByChain;
  bsc?: IArkhamInfoByChain;
  ethereum?: IArkhamInfoByChain;
  optimism?: IArkhamInfoByChain;
  polygon?: IArkhamInfoByChain;
  // bitcoin?: IArkhamInfoByChain;
  // tron?: IArkhamInfoByChain;
  // flare?: IArkhamInfoByChain;
}

export const ARKHAM_CHAIN_NAME: Partial<Record<ChainId, keyof IArkhamResponse>> = {
  [chainToChainId("Arbitrum")]: "arbitrum_one",
  [chainToChainId("Avalanche")]: "avalanche",
  [chainToChainId("Base")]: "base",
  [chainToChainId("Bsc")]: "bsc",
  [chainToChainId("Ethereum")]: "ethereum",
  [chainToChainId("Optimism")]: "optimism",
  [chainToChainId("Polygon")]: "polygon",
};

export interface IArkhamRelayerCheck {
  deliveryParsedSenderAddress: string;
  deliveryParsedTargetAddress: string;
  targetChainId: number;
  deliveryParsedRefundAddress: string;
  refundChainId: number;
  deliveryParsedSourceProviderAddress: string;
  parsedEmitterAddress: string;
}
