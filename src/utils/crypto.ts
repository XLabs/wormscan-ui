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
    if (chainId !== CHAIN_ID_SUI && chainId !== CHAIN_ID_APTOS) {
      parsedValue = tryHexToNativeString(value, chainId);
    }
  } catch (e: unknown) {
    console.log(e);
  }

  return parsedValue;
};

export const parseTx = ({ value, chainId }: { value: string; chainId: ChainId }) => {
  if (!value) return "";

  let parsedValue = value;

  try {
    if (isEVMChain(chainId)) {
      if (String(parsedValue).startsWith("0x")) {
        parsedValue = parsedValue.slice(2);
      }

      parsedValue = removeLeadingZeros(parsedValue);
      parsedValue = "0x" + parsedValue;
    }

    if (chainId === CHAIN_ID_SOLANA) {
      // TODO: parse solana tx
    }
  } catch (e: unknown) {
    console.log(e);
  }

  return parsedValue;
};
