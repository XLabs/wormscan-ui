import { getTokenIcon } from "src/utils/token";
import { formatNumber } from "src/utils/number";
import "./styles.scss";

type Props = {
  itemIndex: number;
  rowSelected: number;
  showThisGraph: () => void;
  symbol: string;
  txs: string;
  volume: string;
};

const TopAssetListItem = ({
  itemIndex,
  rowSelected,
  showThisGraph,
  symbol,
  txs,
  volume,
}: Props) => {
  const tokenIcon = getTokenIcon(symbol);

  return (
    <tr
      className={`top-asset-list-row ${rowSelected === itemIndex ? "active" : ""}`}
      onClick={showThisGraph}
    >
      <td className="top-asset-list-row-item">{itemIndex + 1}</td>

      <td className="top-asset-list-row-item">
        <div>
          <div className="image">
            <img
              src={tokenIcon}
              alt={`${symbol} icon`}
              height="19.20"
              width="19.20"
              className="top-asset-list-item-to-icon"
              loading="lazy"
            />
          </div>
          <div className="top-asset-list-item-to-asset">{symbol}</div>
        </div>
      </td>

      <td className="top-asset-list-row-item">${formatNumber(Number(volume), 0)}</td>

      <td className="top-asset-list-row-item">{txs}</td>
    </tr>
  );
};

export default TopAssetListItem;
