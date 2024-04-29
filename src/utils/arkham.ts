import { ChainId } from "src/api";

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
  [ChainId.Arbitrum]: "arbitrum_one",
  [ChainId.Avalanche]: "avalanche",
  [ChainId.Base]: "base",
  [ChainId.BSC]: "bsc",
  [ChainId.Ethereum]: "ethereum",
  [ChainId.Optimism]: "optimism",
  [ChainId.Polygon]: "polygon",
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
