import WormholeConnect, {
  DEFAULT_ROUTES,
  MayanRouteMCTP,
  MayanRouteSWIFT,
  MayanRouteWH,
  nttRoutes,
  WormholeConnectConfig,
} from "@xlabs/wormhole-connect";
import { useEffect, useState } from "react";
import { ChainId, chainIdToChain, Network } from "@wormhole-foundation/sdk";
import { Loader } from "src/components/atoms";
import { fetchTokensConfig } from "./fetchTokensConfig";

type Props = {
  txHash: string;
  sourceChain: ChainId;
  CustomComponent?: () => JSX.Element;
  network: Network;
};

export const Redeem = ({ txHash, sourceChain, CustomComponent, network }: Props) => {
  const [isLoadingConnect, setIsLoadingConnect] = useState(true);
  const [config, setConfig] = useState<WormholeConnectConfig>(null);

  useEffect(() => {
    const offlineConfig: WormholeConnectConfig = {
      ui: {
        previewMode: true,
        title: "Execute Transaction",

        onlyResume: {
          chainName: chainIdToChain(sourceChain),
          txHash: txHash,
          customTxDetails: () => <CustomComponent />,
          customLoading: () => <Loader />,
        },
      },
      chains: [
        "Ethereum",
        "Solana",
        "Polygon",
        "Bsc",
        "Avalanche",
        "Aptos",
        "Celo",
        "Moonbeam",
        "Sui",
        "Base",
        "Arbitrum",
        "Optimism",
        "Scroll",
        "Blast",
        "Xlayer",
        "Mantle",
        "Worldchain",
      ],
      network: network,
      rpcs: {
        Solana: "https://bff.wormholescan.io/solanaRpcCall",
      },
      routes: [...DEFAULT_ROUTES, MayanRouteWH as any, MayanRouteMCTP, MayanRouteSWIFT],
      eventHandler: event => {
        if (event.type === "load") {
          console.log("Connect loaded", { event });
        }
      },
    };

    const asyncConfig = async () => {
      const { nttTokensConfig, tokensConfig, wrappedTokensConfig } = await fetchTokensConfig(
        network,
      );

      const nttRoutesConfig = nttTokensConfig ? nttRoutes({ tokens: nttTokensConfig }) : [];

      const allTokensConfig: any = {};
      if (wrappedTokensConfig) {
        allTokensConfig.wrappedTokens = wrappedTokensConfig;
      }
      if (tokensConfig) {
        allTokensConfig.tokensConfig = tokensConfig;
      }

      const fullConfig = {
        ...offlineConfig,
        routes: [...(offlineConfig.routes || []), ...nttRoutesConfig],

        // uncomment this:
        // ...allTokensConfig,

        // delete this:
        tokensConfig: tokensConfig,
        // wrappedTokens: wrappedTokensConfig,
      };

      setConfig(fullConfig);

      console.log("fullConfig", fullConfig);
      setIsLoadingConnect(false);
    };

    asyncConfig();
  }, []);

  return (
    <>
      <div>{isLoadingConnect ? <Loader /> : <WormholeConnect config={config} />}</div>
    </>
  );
};
