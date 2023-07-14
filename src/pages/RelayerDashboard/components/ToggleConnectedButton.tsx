import { Button, Tooltip } from "@mui/material";

const ToggleConnectedButton = ({
  connect,
  disconnect,
  connected,
  pk,
}: {
  connect(): any;
  disconnect(): any;
  connected: boolean;
  pk: string;
}) => {
  const is0x = pk.startsWith("0x");
  return connected ? (
    <Tooltip title={pk}>
      <Button
        color="secondary"
        variant="contained"
        size="small"
        onClick={disconnect}
        style={{
          display: "block",
          margin: `10px auto`,
          width: "100%",
          maxWidth: 400,
        }}
      >
        Disconnect {pk.substring(0, is0x ? 6 : 3)}...
        {pk.substr(pk.length - (is0x ? 4 : 3))}
      </Button>
    </Tooltip>
  ) : (
    <Button
      color="primary"
      variant="contained"
      size="small"
      onClick={connect}
      style={{
        display: "block",
        margin: `10px auto`,
        width: "100%",
        maxWidth: 400,
      }}
    >
      Connect
    </Button>
  );
};

export default ToggleConnectedButton;
