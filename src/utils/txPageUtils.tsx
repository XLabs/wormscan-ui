import { ChainId, Network } from "@wormhole-foundation/sdk";
import { AutomaticRelayOutput } from "src/api/search/types";
import { INFTInfo } from "src/api/guardian-network/types";
import { TokenInfo } from "src/utils/metaMaskUtils";
import { DISCORD_URL, IStatus, MORE_INFO_GOVERNOR_URL } from "src/consts";

export type OverviewProps = {
  action?: number;
  amountSent?: string;
  amountSentUSD?: string;
  appIds?: string[];
  budgetText?: () => string;
  copyBudgetText?: () => string;
  currentBlock?: number;
  currentNetwork?: Network;
  decodeExecution?: any;
  deliveryAttempt?: string;
  deliveryInstruction?: any;
  deliveryParsedRefundAddress?: string;
  deliveryParsedRefundProviderAddress?: string;
  deliveryParsedSenderAddress?: string;
  deliveryParsedSourceProviderAddress?: string;
  deliveryParsedTargetAddress?: string;
  deliveryStatus?: AutomaticRelayOutput;
  destinationDateParsed?: string;
  emitterChainId?: ChainId;
  fee?: string;
  fromChain?: ChainId;
  fromChainOrig?: ChainId;
  gasUsed?: number;
  gasUsedText?: () => string;
  gatewayInfo?: {
    originAddress?: string;
    originChainId?: ChainId;
    originTxHash?: string;
  };
  guardianSignaturesCount?: number;
  hasVAA?: boolean;
  isAttestation?: boolean;
  isBigTransaction?: boolean;
  isDailyLimitExceeded?: boolean;
  isDelivery?: boolean;
  isDuplicated?: boolean;
  isGatewaySource?: boolean;
  isJustGenericRelayer?: boolean;
  isLatestBlockHigherThanVaaEmitBlock?: boolean;
  isMayanOnly?: boolean;
  isUnknownApp?: boolean;
  isUnknownPayloadType?: boolean;
  lastFinalizedBlock?: number;
  maxRefundText?: () => string;
  nftInfo?: INFTInfo;
  originDateParsed?: string;
  parsedDestinationAddress?: string;
  parsedEmitterAddress?: string;
  parsedOriginAddress?: string;
  parsedPayload?: any;
  parsedRedeemTx?: string;
  parsedVaa?: any;
  payloadType?: number;
  receiverValueText?: () => string;
  redeemedAmount?: string;
  refundStatus?: string;
  refundText?: () => string;
  releaseTimestamp?: Date;
  resultLog?: string;
  setShowOverview?: (newView: "overview" | "advanced" | "progress") => void;
  showMetaMaskBtn?: boolean;
  showSignatures?: boolean;
  sourceAddress?: string;
  sourceFee?: string;
  sourceFeeUSD?: string;
  sourceSymbol?: string;
  sourceTokenChain?: ChainId;
  sourceTokenInfo?: TokenInfo;
  sourceTokenLink?: string;
  sourceTxHash?: string;
  STATUS?: IStatus;
  targetFee?: string;
  targetFeeUSD?: string;
  targetSymbol?: string;
  targetTokenInfo?: TokenInfo;
  targetTokenLink?: string;
  targetTxTimestamp?: number;
  toChain?: ChainId;
  tokenAmount?: string;
  totalGuardiansNeeded?: number;
  transactionLimit?: number;
  txHash?: string;
  txIndex?: number;
  VAAId?: string;
};

export const BIGDIPPER_TRANSACTIONS = "https://bigdipper.live/wormhole/transactions";

export const extractPageName = (url: string) => {
  const domain = url.split("//")[1].split("/")[0];
  const parts = domain.split(".");
  if (parts.length > 2) {
    return parts.slice(1, -1).join(".");
  } else {
    return parts[0];
  }
};

export const DiscordSupportLink = () => (
  <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
    Discord
  </a>
);

export const LearnMoreLink = () => (
  <a href={MORE_INFO_GOVERNOR_URL} target="_blank" rel="noopener noreferrer">
    Learn more
  </a>
);
