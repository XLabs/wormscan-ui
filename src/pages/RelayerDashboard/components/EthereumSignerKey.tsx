import { Typography } from "@mui/material";
import { useEthereumProvider } from "../context/EthereumProviderContext";
import ToggleConnectedButton from "./ToggleConnectedButton";

const EthereumSignerKey = () => {
  const { connect, disconnect, signerAddress, providerError } = useEthereumProvider();
  return (
    <>
      <ToggleConnectedButton
        connect={() => connect()}
        disconnect={disconnect}
        connected={!!signerAddress}
        pk={signerAddress || ""}
      />
      {providerError ? (
        <Typography variant="body2" color="error">
          {providerError}
        </Typography>
      ) : null}
    </>
  );
};

export default EthereumSignerKey;
