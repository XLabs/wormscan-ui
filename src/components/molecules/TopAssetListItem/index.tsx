import { formatNumber } from "src/utils/number";
import { TokenIconKeys } from "src/api/guardian-network/types";
import APT from "src/icons/tokens/APT.svg";
import ARBITRUM from "src/icons/tokens/ARBITRUM.svg";
import ATOM from "src/icons/tokens/ATOM.svg";
import AVAX from "src/icons/tokens/AVAX.svg";
import BASE from "src/icons/tokens/BASE.svg";
import BNB from "src/icons/tokens/BNB.svg";
import BONK from "src/icons/tokens/BONK.svg";
import BSC from "src/icons/tokens/BSC.svg";
import BUSD from "src/icons/tokens/BUSD.svg";
import CELO from "src/icons/tokens/CELO.svg";
import DAI from "src/icons/tokens/DAI.svg";
import ETH from "src/icons/tokens/ETH.svg";
import EVMOS from "src/icons/tokens/EVMOS.svg";
import FTM from "src/icons/tokens/FTM.svg";
import GLMR from "src/icons/tokens/GLMR.svg";
import KUJI from "src/icons/tokens/KUJI.svg";
import MATIC from "src/icons/tokens/MATIC.svg";
import OPTIMISM from "src/icons/tokens/OPTIMISM.svg";
import OSMO from "src/icons/tokens/OSMO.svg";
import PYTH from "src/icons/tokens/PYTH.svg";
import RNDR from "src/icons/tokens/RNDR.svg";
import SDEX from "src/icons/tokens/SDEX.svg";
import SEI from "src/icons/tokens/SEI.svg";
import SOL from "src/icons/tokens/SOL.svg";
import SUI from "src/icons/tokens/SUI.svg";
import tBTC from "src/icons/tokens/tBTC.svg";
import USDC from "src/icons/tokens/USDC.svg";
import USDT from "src/icons/tokens/USDT.svg";
import WBTC from "src/icons/tokens/WBTC.svg";
import WETH from "src/icons/tokens/WETH.svg";
import WSTETH from "src/icons/tokens/WSTETH.svg";
import noIconToken from "src/icons/tokens/noIcon.svg";
import "./styles.scss";

const iconTokens = {
  APT,
  ARBITRUM,
  ATOM,
  AVAX,
  BASE,
  BNB,
  BONK,
  BSC,
  BUSD,
  CELO,
  DAI,
  ETH,
  EVMOS,
  FTM,
  GLMR,
  KUJI,
  MATIC,
  OPTIMISM,
  OSMO,
  PYTH,
  RNDR,
  SDEX,
  SEI,
  SOL,
  SUI,
  tBTC,
  USDC,
  USDT,
  WBTC,
  WETH,
  WSTETH,
} as { [K in TokenIconKeys]: SVGAElement };

type Props = {
  itemIndex: number;
  rowSelected: number;
  showThisGraph: () => void;
  symbol: TokenIconKeys;
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
              src={iconTokens?.[symbol] || noIconToken}
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
