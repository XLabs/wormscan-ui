import { Network } from "@wormhole-foundation/sdk";

const NTT_TOKENS_URL = {
  Mainnet:
    "https://raw.githubusercontent.com/XLabs/portal-bridge-ui/refs/heads/config/tokens.ntt.mainnet.json",
  Testnet:
    "https://raw.githubusercontent.com/XLabs/portal-bridge-ui/refs/heads/config/tokens.ntt.testnet.json",
  Devnet: "",
};

const WRAPPED_TOKENS_URL = {
  Mainnet:
    "https://raw.githubusercontent.com/XLabs/portal-bridge-ui/refs/heads/config/tokens.wrapped.mainnet.json",
  Testnet:
    "https://raw.githubusercontent.com/XLabs/portal-bridge-ui/refs/heads/config/tokens.wrapped.testnet.json",
  Devnet: "",
};

const TOKENS_CONFIG_URL = {
  Mainnet:
    "https://raw.githubusercontent.com/XLabs/portal-bridge-ui/refs/heads/config/tokens.config.mainnet.json",
  Testnet:
    "https://raw.githubusercontent.com/XLabs/portal-bridge-ui/refs/heads/config/tokens.config.testnet.json",
  Devnet: "",
};

export async function fetchTokensConfig(env: Network) {
  let nttTokensConfig = null;
  let wrappedTokensConfig = null;
  let tokensConfig = null;

  try {
    const response = await fetch(NTT_TOKENS_URL[env]);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    nttTokensConfig = data;
  } catch (error) {
    console.error("Failed to fetch NTT tokens config:", error);
  }

  try {
    const response = await fetch(WRAPPED_TOKENS_URL[env]);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    wrappedTokensConfig = data;
  } catch (error) {
    console.error("Failed to fetch wrapped tokens config:", error);
  }

  try {
    const response = await fetch(TOKENS_CONFIG_URL[env]);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    tokensConfig = data;
  } catch (error) {
    console.error("Failed to fetch tokens config:", error);
  }

  return {
    nttTokensConfig,
    wrappedTokensConfig,
    tokensConfig,
  };
}
