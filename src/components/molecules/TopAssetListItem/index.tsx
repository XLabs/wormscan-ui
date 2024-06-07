import { getTokenIcon } from "src/utils/token";
import { formatNumber } from "src/utils/number";
import { ChevronDownIcon } from "src/icons/generic";
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
      <td className="top-asset-list-row-item">
        <div>{itemIndex + 1}</div>
      </td>

      <td className="top-asset-list-row-item">
        <div>
          <div className="image">
            <img
              src={tokenIcon}
              alt={`${symbol} icon`}
              height="24"
              width="24"
              className="top-asset-list-row-item-to-icon"
              loading="lazy"
            />
          </div>
          <div className="top-asset-list-row-item-to-asset">{symbol}</div>
        </div>
      </td>

      <td className="top-asset-list-row-item">
        <div>${formatNumber(Number(volume), 0)}</div>
      </td>

      <td className="top-asset-list-row-item">
        <div>{txs}</div>
      </td>

      <td className="top-asset-list-row-item top-asset-list-row-item-chevron">
        <div>
          <ChevronDownIcon width={24} />
        </div>
      </td>
    </tr>
  );
};

export default TopAssetListItem;
