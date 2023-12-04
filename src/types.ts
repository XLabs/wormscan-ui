export type TxStatus = "COMPLETED" | "ONGOING" | "FAILED" | "ERROR";

export type TokenIconKeys =
  | "APT"
  | "ARBITRUM"
  | "ATOM"
  | "AVAX"
  | "BASE"
  | "BNB"
  | "BONK"
  | "BSC"
  | "BUSD"
  | "CELO"
  | "DAI"
  | "ETH"
  | "EVMOS"
  | "FTM"
  | "GLMR"
  | "KUJI"
  | "MATIC"
  | "OPTIMISM"
  | "OSMO"
  | "PYTH"
  | "SEI"
  | "SOL"
  | "SUI"
  | "TBTC"
  | "USDC"
  | "USDT"
  | "WBTC"
  | "WETH"
  | "WSTETH";

export type TokenIcons = { [K in TokenIconKeys]: SVGAElement };

export type Top7AssetsData = {
  symbol: TokenIconKeys;
  tokenAddress: string;
  tokenChain: number;
  txs: number | string;
  volume: string;
  tokens: {
    emitterChainId: number;
    tokenAddress: string;
    tokenChainId: number;
    txs: number;
    volume: string;
  }[];
}[];
