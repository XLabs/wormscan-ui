import { useEffect, useState } from "react";
import { Chip, Tooltip } from "src/components/atoms";
import { PlayIcon } from "src/icons/generic";
import "./styles.scss";

interface Props {
  asText?: string;
  canTryToGetRedeem: boolean;
  vaa: string;
  setShowModal: (showModal: boolean) => void;
}

export const VerifyRedemption = ({ asText, canTryToGetRedeem, vaa, setShowModal }: Props) => {
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
      <a className="verify-redemption-text" onClick={() => setShowModal(true)}>
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
      <a className="verify-redemption" onClick={() => setShowModal(true)}>
        <Chip className="status-badge-status" color="pending">
          <PlayIcon width={24} />
          <p style={{ paddingRight: 4 }}>Resume Transaction</p>
        </Chip>
      </a>
    </Tooltip>
  );
};
