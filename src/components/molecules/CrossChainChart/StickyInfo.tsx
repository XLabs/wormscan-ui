import { ChainId, CrossChainBy } from "@xlabs-libs/wormscan-sdk";
import { formatCurrency } from "src/utils/number";
import { Info } from "./Chart";
import { useState } from "react";
import { BlockchainIcon } from "src/components/atoms";

type Props = {
  chainName: string;
  selectedInfo: Info;
  selectedType: CrossChainBy;
  destinations: any[];
};

export const StickyInfo = ({ chainName, selectedInfo, selectedType, destinations }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="cross-chain-sticky">
      <div
        className="cross-chain-sticky-container"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: isOpen ? 530 : 100,
        }}
      >
        <div className="cross-chain-sticky-line">
          <div className="cross-chain-sticky-line-draw" />
        </div>
        <div className="cross-chain-sticky-subtitle">Source</div>
        <div className="cross-chain-sticky-info">
          <span className="cross-chain-sticky-info-source">{chainName}</span>
          <span className="cross-chain-sticky-info-value">
            {selectedInfo?.percentage.toFixed(2)}% |{" "}
            {selectedType === "tx"
              ? selectedInfo.volume
              : "$" + formatCurrency(+selectedInfo.volume, 0)}
          </span>
        </div>

        <div className="cross-chain-sticky-destinations" style={{ opacity: isOpen ? 1 : 0 }}>
          <div className="cross-chain-sticky-separator" />

          <div className="cross-chain-sticky-subtitle">Destination</div>

          {destinations.map(destination => (
            <div key={destination.chain} className="cross-chain-sticky-info spaced">
              <span>
                <BlockchainIcon
                  className="chain-icon"
                  dark={true}
                  size={22}
                  chainId={destination.chain}
                />
              </span>
              <span className="cross-chain-sticky-info-destination">
                {ChainId[destination.chain] ?? "Unset"}
              </span>
              <span className="cross-chain-sticky-info-value">
                {destination.percentage.toFixed(2)}% |{" "}
                {selectedType === "tx"
                  ? destination.volume
                  : "$" + formatCurrency(+destination.volume, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
