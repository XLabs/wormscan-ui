import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import "./styles.scss";

const CrossChainChart = () => {
  const [selectedType, setSelectedType] = useState("notional");

  return (
    <div className="cross-chain">
      <div className="cross-chain-title">Cross-chain activity</div>

      <div className="cross-chain-options">
        <ToggleGroup.Root
          type="single"
          className="cross-chain-type"
          value={selectedType}
          onValueChange={value => value && setSelectedType(value)}
        >
          <ToggleGroup.Item className="cross-chain-type-item" value="notional">
            Chains
          </ToggleGroup.Item>
          <ToggleGroup.Item className="cross-chain-type-item" value="count">
            Tx count
          </ToggleGroup.Item>
        </ToggleGroup.Root>

        <div className="cross-chain-filters">
          <DropdownMenu.Root>
            <span className="cross-chain-filters-text">Apps</span>
            <DropdownMenu.Trigger className="cross-chain-filters-trigger">
              <span>All apps</span>
              <TriangleDownIcon className="cross-chain-filters-trigger-triangle" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content>
                <DropdownMenu.Item className="cross-chain-filters-item">ITEM UNO</DropdownMenu.Item>
                <DropdownMenu.Item className="cross-chain-filters-item">ITEM DOS</DropdownMenu.Item>
                <DropdownMenu.Item className="cross-chain-filters-item">
                  ITEM TRES
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <span className="cross-chain-filters-text">Time range</span>
            <DropdownMenu.Trigger className="cross-chain-filters-trigger">
              <span>All time</span>
              <TriangleDownIcon className="cross-chain-filters-trigger-triangle" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content>
                <DropdownMenu.Item className="cross-chain-filters-item">
                  ITEM CUATRO
                </DropdownMenu.Item>
                <DropdownMenu.Item className="cross-chain-filters-item">
                  ITEM CINCO
                </DropdownMenu.Item>
                <DropdownMenu.Item className="cross-chain-filters-item">
                  ITEM SEIS
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  );
};

export default CrossChainChart;
