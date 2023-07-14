import { Accordion, AccordionDetails, AccordionSummary, Paper, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getChainInfo } from "../utils/environment";
import {
  DeliveryProviderContractState,
  WormholeRelayerContractState,
  useContractState,
} from "../context/ContractStateContext";
import { useCallback, useState } from "react";
import { ChainId } from "@certusone/wormhole-sdk";
import { useEnvironment } from "../context/EnvironmentContext";

export default function ContractStates() {
  const { environment } = useEnvironment();

  const allChains = environment.chainInfos.map(chainInfo => {
    return <SingleChainViewer chainId={chainInfo.chainId} key={chainInfo.chainId} />;
  });

  return (
    <Paper>
      <Typography variant="h5">Contract States</Typography>
      {allChains}
    </Paper>
  );
}

function SingleChainViewer(props: { chainId: number }) {
  const { environment } = useEnvironment();
  const [error, setError] = useState("");
  const [relayerLoading, setRelayerLoading] = useState(false);
  const [deliveryProviderLoading, setDeliveryProviderLoading] = useState(false);
  const [relayer, setRelayer] = useState<WormholeRelayerContractState>();
  const [deliveryProvider, setDeliveryProvider] = useState<DeliveryProviderContractState>();

  const { getRelayerContract, getDeliveryProviderContractState } = useContractState();

  const chainInfo = getChainInfo(environment, props.chainId as ChainId);

  const onExpand = useCallback(
    (event: any, expanded: boolean) => {
      if (expanded) {
        setRelayerLoading(true);
        setDeliveryProviderLoading(true);
        setError("");
        getRelayerContract(props.chainId as ChainId)
          .then(result => {
            console.log("got relayer");
            setRelayerLoading(false);
            setRelayer(result);
          })
          .catch(e => {
            setError(
              e && e.message
                ? e.message
                : "An error occurred while fetching the relayer contract state. Try again.",
            );
            setRelayerLoading(false);
          });
        getDeliveryProviderContractState(props.chainId as ChainId)
          .then(result => {
            console.log("got delivery provider");
            setDeliveryProviderLoading(false);
            setDeliveryProvider(result);
          })
          .catch(e => {
            setError(
              e && e.message
                ? e.message
                : "An error occurred while fetching the delivery provider contract state. Try again.",
            );
            setDeliveryProviderLoading(false);
          });
      }
    },
    [props.chainId, getRelayerContract, getDeliveryProviderContractState],
  );

  let displayedContent: any = "No Content";

  console.log("relayer", relayer);
  console.log("deliveryProvider", deliveryProvider);

  if (error) {
    displayedContent = <Typography>{"Error: " + error}</Typography>;
  } else if (relayerLoading) {
    displayedContent = <Typography>Loading relayer...</Typography>;
  } else if (deliveryProviderLoading) {
    displayedContent = <Typography>Loading delivery provider...</Typography>;
  } else if (relayer && deliveryProvider) {
    displayedContent = <DisplayContracts relayer={relayer} deliveryProvider={deliveryProvider} />;
  } else {
    displayedContent = <Typography>Close and open to reload content</Typography>;
  }

  return (
    <Accordion onChange={onExpand}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{chainInfo.chainId + " " + chainInfo.chainName}</Typography>
      </AccordionSummary>
      <AccordionDetails>{displayedContent}</AccordionDetails>
    </Accordion>
  );
}

function DisplayContracts(props: {
  relayer: WormholeRelayerContractState;
  deliveryProvider: DeliveryProviderContractState;
}) {
  const spacer = <div style={{ height: "10px" }}></div>;
  return (
    <div style={{ display: "flex" }}>
      <div style={{ margin: "10px" }}>
        <Typography variant="h6">Relayer</Typography>
        {spacer}
        <Typography>Chain ID: {props.relayer.chainId}</Typography>
        <Typography>Contract Address: {props.relayer.contractAddress}</Typography>
        <Typography>Default Provider: {props.relayer.defaultProvider}</Typography>
        {spacer}
        <Typography>Registered Contracts:</Typography>
        {props.relayer.registeredContracts.map((contract, idx) => {
          return <Typography key={idx}>{contract.chainId + ": " + contract.contract}</Typography>;
        })}
      </div>
      <div style={{ margin: "10px" }}>
        <Typography variant="h6">Delivery Provider</Typography>
        {spacer}
        <Typography>Chain ID: {props.deliveryProvider.chainId}</Typography>
        <Typography>Contract Address: {props.deliveryProvider.contractAddress}</Typography>
        <Typography>Reward Address: {props.deliveryProvider.rewardAddress}</Typography>
        <Typography>Owner Address: {props.deliveryProvider.owner}</Typography>
        <Typography>Pending Owner: {props.deliveryProvider.pendingOwner}</Typography>
        <Typography>Pricing Wallet: {props.deliveryProvider.pricingWallet}</Typography>
        {spacer}
        <Typography>Delivery Overheads:</Typography>
        {props.deliveryProvider.deliveryOverheads.map((overhead, idx) => {
          return (
            <Typography key={idx}>
              {overhead.chainId + " : "} {overhead.deliveryOverhead.toString()}
            </Typography>
          );
        })}
        {spacer}
        <Typography>Supported Chains :</Typography>
        {props.deliveryProvider.supportedChains.map(chain => {
          return (
            <Typography key={chain.chainId}>
              {chain.chainId + " : "} {chain.isSupported.toString()}
            </Typography>
          );
        })}
        {spacer}
        <Typography>Target Chain Addresses</Typography>
        {props.deliveryProvider.targetChainAddresses.map(address => {
          return (
            <Typography key={address.chainId}>
              {address.chainId + " : "} {address.whAddress}
            </Typography>
          );
        })}
        {spacer}
        <Typography>Gas Prices</Typography>
        {props.deliveryProvider.gasPrices.map(gasPrice => {
          return (
            <Typography key={gasPrice.chainId}>
              {gasPrice.chainId + " : "} {gasPrice.gasPrice.toString()}
            </Typography>
          );
        })}
        {spacer}
        <Typography>Native Prices</Typography>
        {props.deliveryProvider.weiPrices.map(nativePrice => {
          return (
            <Typography key={nativePrice.chainId}>
              {nativePrice.chainId + " : "} {nativePrice.weiPrice.toString()}
            </Typography>
          );
        })}
        {spacer}
        <Typography>Maximum Budgets</Typography>
        {props.deliveryProvider.maximumBudgets.map(budget => {
          return (
            <Typography key={budget.chainId}>
              {budget.chainId + " : "} {budget.maximumBudget.toString()}
            </Typography>
          );
        })}
        {spacer}
        <Typography>Asset Conversion Buffers</Typography>
        {props.deliveryProvider.assetConversionBuffers.map(buffer => {
          return (
            <Typography key={buffer.chainId}>
              {buffer.chainId + " : "}{" "}
              {buffer.assetConversionBuffer.numerator.toString() +
                "/" +
                buffer.assetConversionBuffer.denominator.toString()}
            </Typography>
          );
        })}
      </div>
    </div>
  );
}
