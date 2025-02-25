import {
  ChainId,
  chainIdToChain,
  encoding,
  platformToChains,
  toChainId,
  toNative,
} from "@wormhole-foundation/sdk";
import {
  ALL_BRIDGE_APP_ID,
  CCTP_APP_ID,
  CCTP_MANUAL_APP_ID,
  CONNECT_APP_ID,
  GATEWAY_APP_ID,
  GR_APP_ID,
  MAYAN_MCTP_APP_ID,
  NTT_APP_ID,
  PORTAL_APP_ID,
  TBTC_APP_ID,
  USDT_TRANSFER_APP_ID,
} from "src/consts";

export const formatUnits = (value: number, tokenDecimals = 8) => {
  if (!value) return 0;

  return value / 10 ** tokenDecimals;
};

export const shortAddress = (address: string) => {
  if (!address) return "";
  if (address.length <= 12) return address;

  return `${address?.slice(0, 6) || ""}...${address?.slice(-6) || ""}`;
};

export const shortVaaId = (vaaId: string) => {
  if (!vaaId) return "";

  const splitId = vaaId.split("/");
  const seq = splitId[2];

  return `${vaaId?.slice(0, 6) || ""}.../${seq || ""}`;
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
    if (
      anyChain
        ? true
        : platformToChains("Cosmwasm")
            .map(a => toChainId(a))
            .includes(chainId)
    ) {
      const raw = encoding.bech32.decodeToBytes(value);
      if (raw.bytes.slice(0, 12).every(item => item === 0)) {
        parsedValue = encoding.bech32.encodeFromBytes(raw.prefix, raw.bytes.slice(12));
      }
    }

    if (
      anyChain
        ? true
        : platformToChains("Evm")
            .map(a => toChainId(a))
            .includes(chainId)
    ) {
      parsedValue = toNative(chainIdToChain(chainId), value).toString();
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
    if (
      platformToChains("Cosmwasm")
        .map(a => toChainId(a))
        .includes(chainId)
    ) {
      parsedValue = parsedValue.toUpperCase();
    }

    if (
      platformToChains("Evm")
        .map(a => toChainId(a))
        .includes(chainId)
    ) {
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

export const formatAppId = (appId: string) => {
  if (appId === CONNECT_APP_ID) {
    return "Relayer";
  }
  if (appId === PORTAL_APP_ID) {
    return "Portal";
  }
  if (appId === MAYAN_MCTP_APP_ID) {
    return "Mayan MCTP";
  }
  if (appId === TBTC_APP_ID) {
    return "tBTC";
  }
  if (appId === NTT_APP_ID) {
    return "Wormhole NTT";
  }
  if (appId === ALL_BRIDGE_APP_ID) {
    return "Allbridge";
  }
  if (appId === GR_APP_ID) {
    return "Standard Relayer";
  }
  if (appId === GATEWAY_APP_ID) {
    return "Wormhole Gateway Transfer";
  }
  if (appId === CCTP_MANUAL_APP_ID) {
    return "CCTP Manual";
  }
  if (appId === CCTP_APP_ID) {
    return "CCTP Wormhole Integration";
  }
  if (appId === USDT_TRANSFER_APP_ID) {
    return "USDT Transfer";
  }

  return appId
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const filterAppIds = (appIds: string[]) =>
  appIds.filter(appId => appId !== "UNKNOWN" && appId !== "STABLE");

export const formatAppIds = (appIds: string[]) => filterAppIds(appIds).map(formatAppId).join(", ");
