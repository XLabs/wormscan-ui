import { Network } from "@wormhole-foundation/sdk";
import { queryClient } from "src/App";
import { createClient } from "src/api";

let currentNetwork: Network = "Mainnet";
let client = createClient(process.env.WORMSCAN_API_BASE_URL);

const getBaseURL = (network: Network) => {
  return network === "Mainnet"
    ? process.env.WORMSCAN_API_BASE_URL
    : process.env.WORMSCAN_TESTNET_API_BASE_URL;
};

const clients = {
  Mainnet: createClient(getBaseURL("Mainnet")),
  Testnet: createClient(getBaseURL("Testnet")),
  Devnet: createClient(getBaseURL("Testnet")),
};

const resetQueries = async () => {
  await queryClient.resetQueries();
};

export const isOfTypeNetwork = (value: string): value is Network => {
  return ["Mainnet", "Testnet"].includes(value);
};

export const changeClientNetwork = (network: Network) => {
  if (currentNetwork === network) return;
  currentNetwork = network;

  client = clients[network];
  resetQueries();
};

export const getClient = (network?: Network) => {
  if (network) {
    return clients[network];
  }
  return client;
};
