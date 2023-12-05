import { useEnvironment } from "src/context/EnvironmentContext";
import { AssetsByVolumeOrderedOutput } from "src/api/guardian-network/types";
import { BlockchainIcon } from "src/components/atoms";
import { WormholeBrand } from "src/components/molecules";
import { getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
import { ChainId } from "src/api";
import "./styles.scss";

type Props = {
  top7AssetsData: AssetsByVolumeOrderedOutput[];
  rowIndex: number;
  rowSelected: number;
};

const TopAssetsChart = ({ top7AssetsData, rowSelected, rowIndex }: Props) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const tokensLength = top7AssetsData[rowIndex]?.tokens?.length;

  function sumVolumes(start: number, end: number) {
    let sum = 0;
    for (let i = start; i <= end; i++) {
      sum += parseFloat(top7AssetsData[rowIndex].tokens[i]?.volume || "0");
    }
    return sum;
  }

  const sumOfVolumes0to1 = sumVolumes(0, 1);
  const sumOfVolumes1to2 = sumVolumes(1, 2);
  const sumOfVolumes1to3 = sumVolumes(1, 3);
  const sumOfVolumes1to4 = sumVolumes(1, 4);
  const sumOfVolumes3to5 = sumVolumes(3, 5);
  const sumOfVolumes3to6 = sumVolumes(3, 6);

  const renderChartRows = () => {
    const rows: JSX.Element[] = [];
    let currentRow: JSX.Element[] = [];

    top7AssetsData?.[rowIndex]?.tokens?.forEach(
      (
        { emitter_chain, volume, txs }: { emitter_chain: number; volume: string; txs: string },
        tokenIndex: number,
      ) => {
        if (tokenIndex >= 7) return;

        const thisVolume = parseFloat(top7AssetsData[rowIndex].tokens[tokenIndex]?.volume);

        const getBorderRadius = (): string => {
          return tokensLength >= 3 && tokenIndex === 0
            ? "4px 4px 0 0"
            : tokensLength === 1 && tokenIndex === 0
            ? "4px"
            : tokensLength === 2 && tokenIndex === 0
            ? "4px 0 0 4px"
            : tokensLength === 2 && tokenIndex === 1
            ? "0 4px 4px 0"
            : tokensLength === 3 && tokenIndex === 1
            ? "0 0 0 4px"
            : tokensLength === 3 && tokenIndex === 2
            ? "0 0 4px 0"
            : tokensLength === 4 && tokenIndex === 1
            ? "0 0 0 4px"
            : tokensLength === 4 && tokenIndex === 3
            ? "0 0 4px 0"
            : tokensLength === 5 && tokenIndex === 1
            ? "0 0 0 4px"
            : tokensLength === 5 && tokenIndex === 4
            ? "0 0 4px 0"
            : tokensLength === 6 && tokenIndex === 3
            ? "0 0 0 4px"
            : tokensLength === 6 && tokenIndex === 5
            ? "0 0 4px 0"
            : tokensLength === 7 && tokenIndex === 3
            ? "0 0 0 4px"
            : tokensLength === 7 && tokenIndex === 6
            ? "0 0 4px 0"
            : "";
        };

        const getWidth = (): string => {
          return tokensLength === 2 && (tokenIndex === 0 || tokenIndex === 1)
            ? (thisVolume / sumOfVolumes0to1) * 100 + "%"
            : tokenIndex === 0
            ? "100%"
            : tokensLength === 3 && (tokenIndex === 1 || tokenIndex === 2)
            ? (thisVolume / sumOfVolumes1to2) * 100 + "%"
            : tokensLength === 4 && (tokenIndex === 1 || tokenIndex === 2 || tokenIndex === 3)
            ? (thisVolume / sumOfVolumes1to3) * 100 + "%"
            : tokensLength === 5 &&
              (tokenIndex === 1 || tokenIndex === 2 || tokenIndex === 3 || tokenIndex === 4)
            ? (thisVolume / sumOfVolumes1to4) * 100 + "%"
            : (tokensLength === 6 || tokensLength === 7) && (tokenIndex === 1 || tokenIndex === 2)
            ? (thisVolume / sumOfVolumes1to2) * 100 + "%"
            : tokensLength === 6 && (tokenIndex === 3 || tokenIndex === 4 || tokenIndex === 5)
            ? (thisVolume / sumOfVolumes3to5) * 100 + "%"
            : tokensLength >= 7 &&
              (tokenIndex === 3 || tokenIndex === 4 || tokenIndex === 5 || tokenIndex === 6)
            ? (thisVolume / sumOfVolumes3to6) * 100 + "%"
            : "";
        };

        currentRow.push(
          <div
            key={tokenIndex}
            className={`chart-container-chart-row-item chart-container-chart-row-item-${tokenIndex}`}
            style={{
              borderRadius: `${getBorderRadius()}`,
              width: `${getWidth()}`,
            }}
          >
            {tokenIndex === 0 && (
              <div
                className={`wormhole-brand-container ${
                  tokensLength === 1
                    ? "wormhole-brand-container-center"
                    : tokensLength !== 2
                    ? ""
                    : "wormhole-brand-container-centerRight"
                }`}
              >
                <WormholeBrand size="regular" />
              </div>
            )}

            <div>
              <BlockchainIcon
                background="var(--color-white-20)"
                chainId={emitter_chain}
                className="chart-container-chart-row-item-icon"
                colorless={true}
                network={currentNetwork}
                size={24}
              />
              <p className="chart-container-chart-row-item-chain-name">
                {getChainName({
                  acronym: emitter_chain === ChainId.BSC,
                  chainId: emitter_chain,
                  network: currentNetwork,
                })}
              </p>
            </div>
            <div>
              <p className="chart-container-chart-row-item-volume">
                Volume
                <span>{`$${formatNumber(parseFloat(volume), 0)}`}</span>
              </p>
              <p className="chart-container-chart-row-item-txs">
                Txs
                <span>{txs}</span>
              </p>
            </div>
          </div>,
        );

        // Check if it's time to start a new row
        if (
          (tokensLength !== 2 && tokenIndex === 0) ||
          (tokensLength >= 7 && (tokenIndex === 2 || tokenIndex === 6)) ||
          (tokensLength === 6 && (tokenIndex === 2 || tokenIndex === 5)) ||
          (tokensLength === 5 && tokenIndex === 4) ||
          (tokensLength === 4 && tokenIndex === 3) ||
          (tokensLength === 3 && tokenIndex === 2) ||
          (tokensLength === 2 && tokenIndex === 1) ||
          (tokensLength === 1 && tokenIndex === 0)
        ) {
          rows.push(
            <div key={rows.length} className="chart-container-chart-row">
              {currentRow}
            </div>,
          );
          currentRow = [];
        }
      },
    );

    return rows;
  };

  return (
    <tr>
      <td colSpan={4}>
        <div
          className={`chart-container ${rowSelected !== rowIndex ? "" : "chart-container-expanded"}
          chart-container-expanded-${
            rowSelected !== rowIndex
              ? ""
              : tokensLength <= 2
              ? "1row"
              : tokensLength <= 5
              ? "2row"
              : "3row"
          }
          `}
        >
          <h5 className="chart-container-title">Emitter chain breakdown</h5>
          <div className="chart-container-chart">{renderChartRows()}</div>
        </div>
      </td>
    </tr>
  );
};

export default TopAssetsChart;
