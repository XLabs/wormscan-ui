import { useEffect } from "react";
import { Select } from "src/components/atoms";

import Search from "./Search";
import { useEthereumProvider } from "../../context/EthereumProviderContext";
import { shortAddress } from "src/utils/crypto";
import "./styles.scss";
import { useEnvironment } from "../../context/EnvironmentContext";
import ChainSelector from "../ChainSelector";

const setOverflowHidden = (hidden: boolean) => {
  if (hidden) {
    document.body.style.overflow = "hidden";
    document.body.style.width = "calc(100% - 15px)";
  } else {
    document.body.style.overflow = "unset";
    document.body.style.width = "auto";
  }
};

type NetworkSelectProps = { label: string; value: "MAINNET" | "TESTNET" | "DEVNET" };

const NETWORK_LIST: NetworkSelectProps[] = [
  { label: "Mainnet", value: "MAINNET" },
  { label: "Testnet", value: "TESTNET" },
  { label: "Tilt Devnet", value: "DEVNET" },
];

const Header = () => {
  const { environment, setEnvironment } = useEnvironment();

  useEffect(() => {
    return () => setOverflowHidden(false);
  }, []);

  const onChangeNetworkSelect = (network: NetworkSelectProps) => {
    setEnvironment(network.value);
  };

  const { connect, disconnect, signerAddress, providerError } = useEthereumProvider();
  const isConnected = !!signerAddress;

  return (
    <header className="header-RELAYER" data-testid="header">
      <div className="header-RELAYER-actions">
        <ChainSelector />
        <Select
          name={"relayerNetworkSelect"}
          value={NETWORK_LIST.find(a => a.value === environment.network)}
          onValueChange={(value: NetworkSelectProps) => onChangeNetworkSelect(value)}
          items={NETWORK_LIST}
          ariaLabel={"Select Network"}
          className={"header-RELAYER-network-selector"}
        />

        <div>
          <button
            onClick={() => {
              if (isConnected) {
                disconnect();
              } else {
                connect();
              }
            }}
            className="button-RELAYER"
          >
            {isConnected ? `Disconnect ${shortAddress(signerAddress)}` : "Connect Wallet"}
          </button>
        </div>
      </div>

      <Search />
    </header>
  );
};

export default Header;
