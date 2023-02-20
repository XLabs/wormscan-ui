import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import "./styles.scss";
import { Chart } from "./Chart";
import client from "src/api/Client";
import { useQuery } from "react-query";
import { Loader } from "src/components/atoms";

const CrossChainChart = () => {
  const [selectedType, setSelectedType] = useState("chains");
  const [selectedApp, setSelectedApp] = useState<number>(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(0);

  const { isLoading, error, data } = useQuery("crossChainResponse", () =>
    client.guardianNetwork.getCrossChainActivity(),
  );

  if (error) return null;
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
          <ToggleGroup.Item className="cross-chain-type-item" value="chains">
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
              <span>{selectedApp ? `App #${selectedApp}` : "All apps"}</span>
              <TriangleDownIcon className="cross-chain-filters-trigger-triangle" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content>
                {[0, 1, 2, 3].map(item => (
                  <DropdownMenu.Item
                    key={item}
                    onSelect={() => setSelectedApp(item)}
                    className="cross-chain-filters-item"
                  >
                    {item ? `App #${item}` : "All apps"}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <span className="cross-chain-filters-text">Time range</span>
            <DropdownMenu.Trigger className="cross-chain-filters-trigger">
              <span>{selectedTimeRange ? `Range #${selectedTimeRange}` : "All time"}</span>
              <TriangleDownIcon className="cross-chain-filters-trigger-triangle" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content>
                {[0, 1, 2, 3].map(item => (
                  <DropdownMenu.Item
                    key={item}
                    onSelect={() => setSelectedTimeRange(item)}
                    className="cross-chain-filters-item"
                  >
                    {item ? `Range #${item}` : "All time"}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {isLoading ? (
        <div className="cross-chain-loader">
          <Loader />
        </div>
      ) : (
        <Chart data={data} />
      )}

      <div className="cross-chain-message">Chart shows only top ten destinations / assets</div>
    </div>
  );
};

export default CrossChainChart;
