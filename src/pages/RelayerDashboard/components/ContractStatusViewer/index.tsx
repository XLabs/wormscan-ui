import { getChainInfo } from "src/pages/RelayerDashboard/utils/environment";
import {
  DeliveryProviderContractState,
  WormholeRelayerContractState,
  useContractState,
} from "src/pages/RelayerDashboard/context/ContractStateContext";
import { useCallback, useState } from "react";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";
import { ChainId } from "@xlabs-libs/wormscan-sdk";
import { BlockSection } from "src/pages/Tx/Information/RawData";
import { Tabs } from "src/components/organisms";

import { Loader } from "src/components/atoms";
import "./styles.scss";

export default function ContractStates() {
  const { environment } = useEnvironment();

  const allChains = environment.chainInfos.map(chainInfo => {
    return <SingleChainViewer chainId={chainInfo.chainId} key={chainInfo.chainId} />;
  });

  const headers = environment.chainInfos.map(chain => chain.chainName);

  return (
    <div className="contract-status-view">
      <section className="tx-top">
        <div className="tx-top-header">
          <h1 className="tx-top-header-title">Contract States</h1>
        </div>
      </section>

      <Tabs headers={headers} contents={allChains} />
    </div>
  );
}

function SingleChainViewer(props: { chainId: number }) {
  const { environment } = useEnvironment();
  const [clickedExpand, setClickedExpand] = useState(false);
  const [error, setError] = useState("");
  const [relayerLoading, setRelayerLoading] = useState(false);
  const [deliveryProviderLoading, setDeliveryProviderLoading] = useState(false);
  const [relayer, setRelayer] = useState<WormholeRelayerContractState>();
  const [deliveryProvider, setDeliveryProvider] = useState<DeliveryProviderContractState>();

  const { getRelayerContract, getDeliveryProviderContractState } = useContractState();

  const chainInfo = getChainInfo(environment, props.chainId as ChainId);

  const onExpand = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      setClickedExpand(true);
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
    },
    [props.chainId, getRelayerContract, getDeliveryProviderContractState],
  );

  let displayedContent: any = "No Content";

  console.log("relayer", relayer);
  console.log("deliveryProvider", deliveryProvider);

  if (error) {
    displayedContent = <div className="errored">Error: {error}</div>;
  } else if (relayerLoading) {
    displayedContent = (
      <div>
        <span>Loading relayer...</span>
        <Loader />
      </div>
    );
  } else if (deliveryProviderLoading) {
    displayedContent = (
      <div>
        <span>Loading delivery provider...</span>
        <Loader />
      </div>
    );
  } else if (relayer && deliveryProvider) {
    displayedContent = <DisplayContracts relayer={relayer} deliveryProvider={deliveryProvider} />;
  } else {
    displayedContent = <div className="errored">Close and open to reload content</div>;
  }

  return (
    <div className="tab-container">
      {clickedExpand ? (
        displayedContent
      ) : (
        <div className="tab-container-button" onClick={onExpand}>
          Get contract state for {chainInfo.chainName}
        </div>
      )}
    </div>
  );
}

const DisplayContracts = (props: {
  relayer: WormholeRelayerContractState;
  deliveryProvider: DeliveryProviderContractState;
}) => {
  const relayerInfoString = `{
    Chain ID: ${props.relayer.chainId},
    Contract Address: ${props.relayer.contractAddress},
    Default Provider: ${props.relayer.defaultProvider}
}`;

  const registeredContractsString = `{
    ${props.relayer.registeredContracts
      .map(contract => {
        return ChainId[contract.chainId] + ": " + contract.contract;
      })
      .join(",\n    ")}
}`;

  const supportedChainsString = `{
    ${props.deliveryProvider.supportedChains
      .map(
        chain =>
          ChainId[chain.chainId] +
          ": " +
          chain.isSupported.toString() +
          `  // (Chain ID: ${chain.chainId})`,
      )
      .join(",\n    ")}
}`;

  const deliveryProviderString = `{
    Chain ID: ${props.deliveryProvider.chainId},
    Contract Address: ${props.deliveryProvider.contractAddress},
    Reward Address: ${props.deliveryProvider.rewardAddress},
    Owner Address: ${props.deliveryProvider.owner},
    Pending Owner: ${props.deliveryProvider.pendingOwner},
    Pricing Wallet: ${props.deliveryProvider.pricingWallet}
}`;

  const deliveryOverheadsString = `{
    ${props.deliveryProvider.deliveryOverheads
      .map(overhead => ChainId[overhead.chainId] + ": " + overhead.deliveryOverhead.toString())
      .join(",\n    ")}
}`;

  const targetChainAddressesString = `{
    ${props.deliveryProvider.targetChainAddresses
      .map(address => ChainId[address.chainId] + ": " + address.whAddress)
      .join(",\n    ")}
}`;

  const gasPricesString = `{
    ${props.deliveryProvider.gasPrices
      .map(gasPrice => ChainId[gasPrice.chainId] + ": " + gasPrice.gasPrice.toString())
      .join(",\n    ")}
}`;

  const nativePricesString = `{
    ${props.deliveryProvider.weiPrices
      .map(nativePrice => ChainId[nativePrice.chainId] + ": " + nativePrice.weiPrice.toString())
      .join(",\n    ")}
}`;

  const maximumBudgetsString = `{
    ${props.deliveryProvider.maximumBudgets
      .map(budget => ChainId[budget.chainId] + ": " + budget.maximumBudget.toString())
      .join(",\n    ")}
}`;

  const assetConversionBuffersString = `{
    ${props.deliveryProvider.assetConversionBuffers
      .map(
        buffer =>
          ChainId[buffer.chainId] +
          ": " +
          buffer.assetConversionBuffer.numerator.toString() +
          "/" +
          buffer.assetConversionBuffer.denominator.toString(),
      )
      .join(",\n    ")}
}`;

  const spacer = <div className="spacer" />;
  return (
    <div>
      <BlockSection title="RELAYER" code={relayerInfoString} />
      {spacer}
      <BlockSection title="REGISTERED CONTRACTS" code={registeredContractsString} />
      {spacer}
      <BlockSection title="SUPPORTED CHAINS" code={supportedChainsString} />
      {spacer}
      <BlockSection title="DELIVERY PROVIDER" code={deliveryProviderString} />
      {spacer}
      <BlockSection title="DELIVERY OVERHEADS" code={deliveryOverheadsString} />
      {spacer}
      <BlockSection title="TARGET CHAIN ADDRESSES" code={targetChainAddressesString} />
      {spacer}
      <BlockSection title="GAS PRICES" code={gasPricesString} />
      {spacer}
      <BlockSection title="NATIVE PRICES" code={nativePricesString} />
      {spacer}
      <BlockSection title="MAXIMUM BUDGETS" code={maximumBudgetsString} />
      {spacer}
      <BlockSection title="ASSET CONVERSION BUFFERS" code={assetConversionBuffersString} />
      {spacer}
      {spacer}
    </div>
  );
};
