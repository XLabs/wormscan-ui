import APT from "src/icons/tokens/APT.svg";
import ARBITRUM from "src/icons/tokens/ARBITRUM.svg";
import ATOM from "src/icons/tokens/ATOM.svg";
import AVAX from "src/icons/tokens/AVAX.svg";
import BASE from "src/icons/tokens/BASE.svg";
import BNB from "src/icons/tokens/BNB.svg";
import Bonk from "src/icons/tokens/Bonk.svg";
import BSC from "src/icons/tokens/BSC.svg";
import BUSD from "src/icons/tokens/BUSD.svg";
import CELO from "src/icons/tokens/CELO.svg";
import DAI from "src/icons/tokens/DAI.svg";
import ETH from "src/icons/tokens/ETH.svg";
import EVMOS from "src/icons/tokens/EVMOS.svg";
import WFTM from "src/icons/tokens/WFTM.svg";
import FTM from "src/icons/tokens/FTM.svg";
import GLMR from "src/icons/tokens/GLMR.svg";
import IDIA from "src/icons/tokens/IDIA.svg";
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
import WAVAX from "src/icons/tokens/WAVAX.svg";
import WBNB from "src/icons/tokens/BNB.svg";
import WBTC from "src/icons/tokens/WBTC.svg";
import WETH from "src/icons/tokens/WETH.svg";
import WMATIC from "src/icons/tokens/WMATIC.svg";
import WSTETH from "src/icons/tokens/WSTETH.svg";
import noIconToken from "src/icons/tokens/noIcon.svg";

const iconTokens = {
  APT,
  ARBITRUM,
  ATOM,
  AVAX,
  BASE,
  BNB,
  Bonk,
  BSC,
  BUSD,
  CELO,
  DAI,
  ETH,
  EVMOS,
  FTM,
  GLMR,
  IDIA,
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
  WAVAX,
  WBNB,
  WBTC,
  WETH,
  WFTM,
  WMATIC,
  WSTETH,
} as { [K in string]: SVGAElement };

export const getTokenIcon = (token: string) => {
  const icon = iconTokens[token];
  return icon ? icon : noIconToken;
};