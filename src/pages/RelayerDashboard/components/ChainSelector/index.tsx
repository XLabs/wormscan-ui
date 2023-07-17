import { ChainId } from "@certusone/wormhole-sdk";
import { useEffect, useState } from "react";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";
import { Select } from "src/components/atoms";
import "./styles.scss";

export default function ChainSelector() {
  const { environment, chain, setChain } = useEnvironment();

  const allChains = environment.chainInfos.map(chainInfo => {
    return {
      label: `${chainInfo.chainId} - ${chainInfo.chainName}`,
      value: `${chainInfo.chainId}`,
    };
  });

  const [selectedValue, setSelectedValue] = useState(allChains.find(c => c.value === `${chain}`));

  const handleChange = (selected: any) => {
    setSelectedValue(selected);
    setChain(+selected.value as ChainId);
  };

  return (
    <Select
      name="relayerChain"
      value={selectedValue}
      onValueChange={a => handleChange(a)}
      items={allChains}
      ariaLabel="Select chain"
      className="relayer-chain-selector"
    />
  );
}
