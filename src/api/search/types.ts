export type GetTokenInput = {
  chainId: number;
  tokenAddress: string;
};

export type GetTokenOutput = {
  symbol: string;
  coingeckoId: string;
  decimals: number;
};

export type GetTokenPriceInput = {
  coingeckoId: string;
  query: {
    date: string;
    localization?: boolean;
  };
};

export type GetTokenPriceOutput = {
  usd: number;
};

export interface AutomaticRelayOutput {
  completedAt: string;
  failedAt: string;
  id: string;
  receivedAt: string;
  relayer: string;
  status: string;
  data: {
    fromTxHash: string;
    toTxHash: string;
    maxAttempts: number;
    delivery: {
      relayGasUsed: number;
      targetChainDecimals: number;
      budget: string;
      maxRefund: string;
      execution: {
        detail: string;
        gasUsed: string;
        refundStatus: string;
        revertString: string;
        status: string;
        transactionHash: string;
      };
    };
    instructions: {
      encodedExecutionInfo: string;
      refundAddress: string;
      refundChainId: number;
      refundDeliveryProvider: string;
      senderAddress: string;
      sourceDeliveryProvider: string;
      targetAddress: string;
      targetChainId: number;
      vaaKeys: any;
      extraReceiverValue: { _hex: string; _isBigNumber: boolean };
      requestedReceiverValue: { _hex: string; _isBigNumber: boolean };
    };
  };
}

export type GetBlockData = {
  currentBlock: number;
  lastFinalizedBlock: number;
};
