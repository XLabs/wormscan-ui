import { useEnvironment } from "src/context/EnvironmentContext";
import { Top7AssetsData } from "src/types";
import { BlockchainIcon } from "src/components/atoms";
import { getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
import { ChainId } from "src/api";
import "./styles.scss";

type Props = {
  top7AssetsData: Top7AssetsData;
  itemIndex: number;
  rowSelected: number;
};

const TopAssetsChart = ({ top7AssetsData, rowSelected, itemIndex }: Props) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const renderChartRows = () => {
    const rows: JSX.Element[] = [];
    let currentRow: JSX.Element[] = [];

    top7AssetsData[itemIndex].tokens.forEach(
      (
        { emitterChainId, volume, txs }: { emitterChainId: number; volume: string; txs: number },
        i: number,
      ) => {
        const sumOfVolumes1and2 =
          Number(top7AssetsData[itemIndex].tokens[1].volume) +
          Number(top7AssetsData[itemIndex].tokens[2].volume);

        const sumOfVolumes3to6 =
          Number(top7AssetsData[itemIndex].tokens[3].volume) +
          Number(top7AssetsData[itemIndex].tokens[4].volume) +
          Number(top7AssetsData[itemIndex].tokens[5].volume) +
          Number(top7AssetsData[itemIndex].tokens[6].volume);

        currentRow.push(
          <div
            key={i}
            className={`chart-container-chart-row-item chart-container-chart-row-item-${i}`}
            style={{
              width: `${
                i === 0
                  ? "100%"
                  : i === 1 || i === 2
                  ? (Number(top7AssetsData[itemIndex].tokens[i].volume) / sumOfVolumes1and2) * 100 +
                    "%"
                  : (Number(top7AssetsData[itemIndex].tokens[i].volume) / sumOfVolumes3to6) * 100 +
                    "%"
              }`,
            }}
          >
            <div>
              <BlockchainIcon
                background="var(--color-white-20)"
                chainId={emitterChainId}
                className="chart-container-chart-row-item-icon"
                colorless={true}
                network={currentNetwork}
                size={24}
              />

              <p className="chart-container-chart-row-item-txs">{txs}</p>
            </div>
            <p className="chart-container-chart-row-item-chain-name">
              {getChainName({
                acronym: emitterChainId === ChainId.BSC,
                chainId: emitterChainId,
                network: currentNetwork,
              })}
            </p>
            <p className="chart-container-chart-row-item-volume">
              {`$${formatNumber(Number(volume), 0)}`}
            </p>
          </div>,
        );

        // Check if it's time to start a new row
        if (i === 0 || i === 2 || i === 6) {
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
          className={`chart-container ${
            rowSelected !== itemIndex ? "" : "chart-container-expanded"
          }`}
        >
          <h5 className="chart-container-title">Emitter chain breakdown</h5>
          <div className="chart-container-chart">{renderChartRows()}</div>
        </div>
      </td>
    </tr>
  );
};

export default TopAssetsChart;
