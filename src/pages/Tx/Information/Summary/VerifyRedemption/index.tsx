import { useEffect, useState } from "react";
import { ChainId } from "@certusone/wormhole-sdk";
import { Tooltip } from "src/components/atoms";
import "./styles.scss";

interface Props {
  canTryToGetRedeem: boolean;
  fromChain: ChainId | number;
  txHash: string;
  vaa: string;
}

export const VerifyRedemption = ({ canTryToGetRedeem, fromChain, txHash, vaa }: Props) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [hex, setHex] = useState("");

  useEffect(() => {
    try {
      const binaryString = atob(vaa);
      let hexString = "";
      for (let i = 0; i < binaryString.length; i++) {
        const hex = binaryString.charCodeAt(i).toString(16);
        hexString += hex.length === 2 ? hex : "0" + hex;
      }
      setHex(hexString);
    } catch (_err) {
      setHex("");
    }

    // wait for GetRedeem to disappear before showing VerifyRedemption
    setTimeout(
      () => {
        setShouldShow(true);
      },
      canTryToGetRedeem ? 3500 : 0,
    );
  }, [canTryToGetRedeem, vaa]);

  if (!shouldShow) return null;

  return (
    <Tooltip
      tooltip={<div>Click here to verify token redemption status</div>}
      type="info"
      maxWidth={false}
    >
      <a
        className="verify-redemption"
        href={
          vaa && hex
            ? `https://www.portalbridge.com/#/redeem?vaa=${hex}`
            : `https://www.portalbridge.com/#/redeem?sourceChain=${fromChain}&transactionId=${txHash}`
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        <p>VERIFY REDEMPTION</p>
      </a>
    </Tooltip>
  );
};
