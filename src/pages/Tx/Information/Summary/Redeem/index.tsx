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
  CustomComponent?: () => JSX.Element;
  CustomError?: (props: { error: string }) => JSX.Element;
  CustomLoading?: (props: { shouldShowDisclaimer: boolean }) => JSX.Element;
  CustomSuccess?: () => JSX.Element;
  network: Network;
  sourceChain: ChainId;
  txHash: string;
};

export const Redeem = ({
  CustomComponent,
  CustomError,
  CustomLoading,
  CustomSuccess,
  network,
  sourceChain,
  txHash,
}: Props) => {
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
          customLoading: shouldShowDisclaimer => (
            <CustomLoading shouldShowDisclaimer={shouldShowDisclaimer} />
          ),
          buttonStyles: {
            backgroundColor: "var(--color-plum)",
            borderRadius: "16px",
            color: "var(--color-black)",
            fontSize: "14px",
            fontWeight: "600",
          },
          customError: error => <CustomError error={error} />,
          customSuccess: () => <CustomSuccess />,
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
        ...allTokensConfig,
      };

      setConfig(fullConfig);
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
