import APT from "src/icons/tokens/APT.svg";
import ARBITRUM from "src/icons/tokens/ARBITRUM.svg";
import ATOM from "src/icons/tokens/ATOM.svg";
import AVAX from "src/icons/tokens/AVAX.svg";
import BASE from "src/icons/tokens/BASE.svg";
import BERA from "src/icons/blockchains/berachain.svg";
import BNB from "src/icons/tokens/BNB.svg";
import Bonk from "src/icons/tokens/Bonk.svg";
import BSC from "src/icons/tokens/BSC.svg";
import BUSD from "src/icons/tokens/BUSD.svg";
import CELO from "src/icons/tokens/CELO.svg";
import DAI from "src/icons/tokens/DAI.svg";
import DEXE from "src/icons/tokens/DEXE.svg";
import ETH from "src/icons/tokens/ETH.svg";
import EVMOS from "src/icons/tokens/EVMOS.svg";
import FTM from "src/icons/tokens/FTM.svg";
import GLMR from "src/icons/tokens/GLMR.svg";
import HXRO from "src/icons/tokens/HXRO.svg";
import IDIA from "src/icons/tokens/IDIA.svg";
import KlaytnIcon from "src/icons/blockchains/klaytn.svg";
import KUJI from "src/icons/tokens/KUJI.svg";
import LOVELY from "src/icons/tokens/LOVELY.webp";
import LUNA from "src/icons/tokens/LUNA.svg";
import MON from "src/icons/tokens/MON.svg";
import MATIC from "src/icons/tokens/MATIC.svg";
import NST from "src/icons/tokens/NST.webp";
import OPTIMISM from "src/icons/tokens/OPTIMISM.svg";
import OSMO from "src/icons/tokens/OSMO.svg";
import PENDLE from "src/icons/tokens/PENDLE.svg";
import PYTH from "src/icons/tokens/PYTH.svg";
import RNDR from "src/icons/tokens/RNDR.svg";
import SDEX from "src/icons/tokens/SDEX.svg";
import SEI from "src/icons/tokens/SEI.svg";
import SOL from "src/icons/tokens/SOL.svg";
import SPX6900 from "src/icons/tokens/SPX6900.webp";
import SUI from "src/icons/tokens/SUI.svg";
import tBTC from "src/icons/tokens/tBTC.svg";
import TRUMP from "src/icons/tokens/TRUMP.webp";
import USDC from "src/icons/tokens/USDC.svg";
import USDS from "src/icons/tokens/USDS.webp";
import USDT from "src/icons/tokens/USDT.svg";
import UST from "src/icons/tokens/UST.svg";
import W from "src/icons/tokens/W.svg";
import WAVAX from "src/icons/tokens/WAVAX.svg";
import WBTC from "src/icons/tokens/WBTC.svg";
import WELL from "src/icons/tokens/WELL.svg";
import WETH from "src/icons/tokens/WETH.svg";
import WFTM from "src/icons/tokens/WFTM.svg";
import WMATIC from "src/icons/tokens/WMATIC.svg";
import WSTETH from "src/icons/tokens/WSTETH.svg";
import XBG from "src/icons/tokens/XBG.svg";
import noIconToken from "src/icons/tokens/noIcon.svg";

const iconTokens = {
  APT,
  ARBITRUM,
  ATOM,
  AVAX,
  BASE,
  BNB,
  BERA,
  Bonk,
  BSC,
  BUSD,
  CELO,
  DAI,
  DEXE,
  ETH,
  EVMOS,
  FTM,
  GLMR,
  HXRO,
  IDIA,
  KLAY: KlaytnIcon,
  KUJI,
  LOVELY,
  LUNA,
  MATIC,
  MON,
  NST,
  OPTIMISM,
  OSMO,
  PENDLE,
  PYTH,
  RNDR,
  SDEX,
  SEI,
  SOL,
  SPX6900,
  SUI,
  tBTC,
  TRUMP,
  USDbC: USDC,
  USDC,
  USDCbs: USDC,
  USDCpo: USDC,
  USDCso: USDC,
  "USDC.e": USDC,
  USDS,
  USDT,
  UST,
  W,
  WAVAX,
  WBNB: BNB,
  WBTC,
  WELL,
  WETH,
  WFTM,
  WGLMR: GLMR,
  WKLAY: KlaytnIcon,
  WMATIC,
  WSTETH,
  wstETH: WSTETH,
  XBG,
} as { [K in string]: SVGAElement };

export const getTokenIcon = (token: string, nullIfMissing = false) => {
  const icon = iconTokens[token];
  return icon ? icon : nullIfMissing ? null : noIconToken;
};
