import { createClient } from "@xlabs-libs/wormscan-sdk";
import { queryClient } from "src/App";
import { NETWORK } from "src/types";

let currentNetwork: NETWORK = "mainnet";
let client = createClient(process.env.WORMSCAN_API_BASE_URL);

const getBaseURL = (network: NETWORK) => {
  return network === "mainnet"
    ? process.env.WORMSCAN_API_BASE_URL
    : process.env.WORMSCAN_TESTNET_API_BASE_URL;
};

const createNewClient = (baseURL: string) => {
  client = createClient(baseURL);
};

const resetQueries = async () => {
  await queryClient.resetQueries();
};

export const isOfTypeNetwork = (value: string): value is NETWORK => {
  return ["mainnet", "testnet"].includes(value);
};

export const getCurrentNetwork = () => {
  return currentNetwork;
};

export const changeNetwork = (network: NETWORK) => {
  if (currentNetwork === network) return;

  currentNetwork = network;
  const baseURL = getBaseURL(network);

  createNewClient(baseURL);
  resetQueries();
};

export const getClient = () => {
  return client;
};
