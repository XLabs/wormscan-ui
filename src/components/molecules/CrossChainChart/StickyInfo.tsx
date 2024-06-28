import { useState } from "react";
import { Network } from "@wormhole-foundation/sdk";
import { BlockchainIcon } from "src/components/atoms";
import { WormholeScanBrand } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { ChainId } from "@wormhole-foundation/sdk";
import { CrossChainBy } from "src/api/guardian-network/types";
import { Info } from "./Chart";

type Props = {
  chainName: string;
  currentNetwork: Network;
  destinations: any[];
  selectedDestination: "sources" | "destinations";
  selectedInfo: Info;
  selectedType: CrossChainBy;
};

export const StickyInfo = ({
  chainName,
  currentNetwork,
  destinations,
  selectedDestination,
  selectedInfo,
  selectedType,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="cross-chain-sticky">
      <div
        className="cross-chain-sticky-container"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        style={{
          height: isOpen ? 530 : 100,
        }}
      >
        <div>
          <div className="cross-chain-sticky-line">
            <svg
              className={`cross-chain-sticky-line-draw ${
                isOpen ? "cross-chain-sticky-line-draw-open" : ""
              }`}
              fill="none"
              height="40"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 13l8 -3l8 3" />
            </svg>
          </div>

          <div className="cross-chain-sticky-subtitle">
            <span>{selectedDestination === "sources" ? "Source" : "Target"}</span>
            <span>{selectedType === "tx" ? "Transactions" : "Volume"}</span>
          </div>

          <div className="cross-chain-sticky-info">
            <span
              className={`cross-chain-sticky-info-source ${
                chainName === "BNB Smart Chain" && selectedType !== "tx"
                  ? "cross-chain-sticky-info-source-small"
                  : ""
              }`}
            >
              {chainName}
            </span>
            <span className="cross-chain-sticky-info-value">
              {selectedInfo?.percentage?.toFixed(2)}% |{" "}
              {selectedType === "tx"
                ? selectedInfo.volume
                : "$" + formatNumber(+selectedInfo.volume, 0)}
            </span>
          </div>
        </div>

        <div className="cross-chain-sticky-destinations" style={{ opacity: isOpen ? 1 : 0 }}>
          <div className="cross-chain-sticky-separator" />

          <WormholeScanBrand />

          <div className="cross-chain-sticky-subtitle">
            {selectedDestination === "sources" ? "Destinations" : "Sources"}
          </div>

          {destinations.map(destination => (
            <div key={destination.chain} className="cross-chain-sticky-info spaced">
              <span>
                <BlockchainIcon
                  background="#080530"
                  chainId={destination.chain}
                  className="chain-icon"
                  colorless={true}
                  network={currentNetwork}
                  size={22}
                />
              </span>
              <span className="cross-chain-sticky-info-destination">
                {ChainId[destination.chain] ?? "Unset"}
              </span>
              <span className="cross-chain-sticky-info-value">
                {destination.percentage.toFixed(2)}% |{" "}
                {selectedType === "tx"
                  ? destination.volume
                  : "$" + formatNumber(+destination.volume, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
