import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useState } from "react";
import "./styles.scss";

const CrossChainChart = () => {
  const [selectedType, setSelectedType] = useState("notional");

  return (
    <div className="cross-chain">
      <div className="cross-chain-title">Cross-chain activity</div>

      <div>
        <ToggleGroup.Root
          type="single"
          className="cross-chain-type"
          value={selectedType}
          onValueChange={value => value && setSelectedType(value)}
        >
          <ToggleGroup.Item className="cross-chain-type-item" value="notional">
            Notional
          </ToggleGroup.Item>
          <ToggleGroup.Item className="cross-chain-type-item" value="count">
            Tx count
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>
    </div>
  );
};

export default CrossChainChart;
