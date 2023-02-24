import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import "./styles.scss";
import { Chart } from "./Chart";
import client from "src/api/Client";
import { useQuery } from "react-query";
import { Loader } from "src/components/atoms";
import { useTranslation } from "react-i18next";

const CrossChainChart = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState("chains");
  const [selectedApp, setSelectedApp] = useState<number>(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(0);

  const { isLoading, error, data } = useQuery("crossChainResponse", () =>
    client.guardianNetwork.getCrossChainActivity(),
  );

  if (error) return null;
  return (
    <div className="cross-chain">
      <div className="cross-chain-title">{t("home.crossChain.title")}</div>

      <div className="cross-chain-options">
        <ToggleGroup.Root
          type="single"
          className="cross-chain-type"
          value={selectedType}
          onValueChange={value => value && setSelectedType(value)}
        >
          <ToggleGroup.Item className="cross-chain-type-item" value="chains">
            {t("home.crossChain.chains")}
          </ToggleGroup.Item>
          <ToggleGroup.Item className="cross-chain-type-item" value="count">
            {t("home.crossChain.count")}
          </ToggleGroup.Item>
        </ToggleGroup.Root>

        <div className="cross-chain-filters">
          <DropdownMenu.Root>
            <span className="cross-chain-filters-text">{t("home.crossChain.apps")}</span>
            <DropdownMenu.Trigger className="cross-chain-filters-trigger">
              <span>
                {selectedApp
                  ? `${t("home.crossChain.app")} #${selectedApp}`
                  : t("home.crossChain.allApps")}
              </span>
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
                    {item ? `${t("home.crossChain.app")} #${item}` : t("home.crossChain.allApps")}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <span className="cross-chain-filters-text">{t("home.crossChain.timeRange")}</span>
            <DropdownMenu.Trigger className="cross-chain-filters-trigger">
              <span>
                {selectedTimeRange
                  ? `${t("home.crossChain.range")} #${selectedTimeRange}`
                  : t("home.crossChain.allTime")}
              </span>
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
                    {item ? `${t("home.crossChain.range")} #${item}` : t("home.crossChain.allTime")}
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

      <div className="cross-chain-message">{t("home.crossChain.bottomMessage")}</div>
    </div>
  );
};

export default CrossChainChart;
