import { useEffect, useState } from "react";
import { Tooltip } from "src/components/atoms";
import "./styles.scss";
import { ChainId } from "@wormhole-foundation/sdk";

interface Props {
  asText?: string;
  canTryToGetRedeem: boolean;
  fromChain: ChainId | number;
  isJustPortalUnknown: boolean;
  txHash: string;
  vaa: string;
  setShowModal: (showModal: boolean) => void;
}

export const VerifyRedemption = ({
  asText,
  canTryToGetRedeem,
  fromChain,
  isJustPortalUnknown,
  txHash,
  vaa,
  setShowModal,
}: Props) => {
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
      canTryToGetRedeem ? 5000 : 0,
    );
  }, [canTryToGetRedeem, vaa]);

  if (asText)
    return (
      <a
        className="verify-redemption-text"
        // href={
        //   isJustPortalUnknown
        //     ? vaa && hex
        //       ? `https://www.portalbridge.com/#/redeem?vaa=${hex}`
        //       : `https://www.portalbridge.com/#/redeem?sourceChain=${fromChain}&transactionId=${txHash}`
        //     : `https://portalbridge.com/?sourceChain=${fromChain}&txHash=${txHash}`
        // }
        // target="_blank"
        // rel="noopener noreferrer"
        onClick={() => setShowModal(true)}
      >
        {asText}
      </a>
    );

  if (!shouldShow) return null;

  return (
    <Tooltip
      tooltip={<div>Click here to verify token execution status</div>}
      type="info"
      maxWidth={false}
    >
      <a
        className="verify-redemption"
        // href={
        //   isJustPortalUnknown
        //     ? vaa && hex
        //       ? `https://www.portalbridge.com/#/redeem?vaa=${hex}`
        //       : `https://www.portalbridge.com/#/redeem?sourceChain=${fromChain}&transactionId=${txHash}`
        //     : `https://portalbridge.com/?sourceChain=${fromChain}&txHash=${txHash}`
        // }
        // target="_blank"
        // rel="noopener noreferrer"
        onClick={() => setShowModal(true)}
      >
        <p>Resume Transaction</p>
      </a>
    </Tooltip>
  );
};
