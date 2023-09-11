import { ChainId, isEVMChain, tryHexToNativeString } from "@certusone/wormhole-sdk";

export const formatUnits = (value: number, tokenDecimals = 8) => {
  if (!value) return 0;

  const maxDecimals = Math.min(8, tokenDecimals);
  const valueString = String(value);
  const decimalLength = valueString.length - maxDecimals;
  const startAmount = valueString.substring(0, decimalLength);
  const endAmount = valueString.substring(decimalLength);
  const parsedAmount = `${startAmount}.${endAmount}`;
  const abbreviatedAmount = parsedAmount.replace(/\.?0+$/, "");
  const abbreviatedAmountNumber = Number(abbreviatedAmount);

  return abbreviatedAmountNumber;
};

export const shortAddress = (address: string) => {
  if (!address) return "";

  return `${address?.slice(0, 6) || ""}...${address?.slice(-4) || ""}`;
};

export const parseAddress = ({
  value,
  chainId,
  anyChain,
}: {
  value: string;
  chainId: ChainId;
  anyChain?: boolean;
}) => {
  if (!value) return "";

  let parsedValue = value;
  try {
    if (anyChain ? true : isEVMChain(chainId)) {
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

  try {
    if (isEVMChain(chainId)) {
      if (String(parsedValue).startsWith("0x")) {
        return parsedValue;
      }
      parsedValue = "0x" + parsedValue;
    }
  } catch (e: unknown) {
    // console.log(e);
  }

  return parsedValue;
};

export const formatAppIds = (appIds: string[]) =>
  appIds
    .filter(appId => appId !== "UNKNOWN")
    .map(appId =>
      appId
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" "),
    )
    .join(", ");
