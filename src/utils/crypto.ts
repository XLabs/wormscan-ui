import {
  ChainId,
  CHAIN_ID_APTOS,
  CHAIN_ID_SOLANA,
  CHAIN_ID_SUI,
  isEVMChain,
  tryHexToNativeString,
} from "@certusone/wormhole-sdk";
import { removeLeadingZeros } from "./string";

export const formatUnits = (value: number, tokenDecimals = 8) => {
  if (!value) return 0;

  const maxDecimals = Math.min(8, tokenDecimals);
  const valueString = String(value);
  const decimalLength = valueString.length - maxDecimals;
  const startAmount = valueString.substring(0, decimalLength);
  const endAmount = valueString.substring(decimalLength);
  const parsedAmount = `${startAmount}.${endAmount}`;

  return parsedAmount;
};

export const shortAddress = (address: string) => {
  if (!address) return "";

  return `${address?.slice(0, 6) || ""}...${address?.slice(-4) || ""}`;
};

export const parseAddress = ({ value, chainId }: { value: string; chainId: ChainId }) => {
  if (!value) return "";

  let parsedValue = value;
  try {
    if (isEVMChain(chainId)) {
      parsedValue = tryHexToNativeString(value, chainId);
    }
  } catch (e: unknown) {
    // console.log(e);
  }

  return parsedValue;
};

export const parseTx = ({ value, chainId }: { value: string; chainId: ChainId }) => {
  if (!value) return "";

  let parsedValue = value;
  console.log(value, chainId, isEVMChain(chainId));

  try {
    if (isEVMChain(chainId)) {
      parsedValue = "0x" + parsedValue;
      console.log({ parsedValue });
    }
  } catch (e: unknown) {
    // console.log(e);
  }

  return parsedValue;
};
