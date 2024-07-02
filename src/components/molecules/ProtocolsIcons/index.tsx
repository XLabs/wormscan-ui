import { useMemo } from "react";
import { Tooltip } from "src/components/atoms";
import { ALL_BRIDGE_APP_ID, CCTP_APP_ID, MAYAN_APP_ID, NTT_APP_ID } from "src/consts";
import { allBridgeIcon, cctpIcon, mayanIcon, nttIcon, portalIcon } from "src/icons/protocols";
import { formatAppIds } from "src/utils/crypto";
import "./styles.scss";

const protocolIcons: Record<string, string> = {
  [ALL_BRIDGE_APP_ID]: allBridgeIcon,
  [CCTP_APP_ID]: cctpIcon,
  [MAYAN_APP_ID]: mayanIcon,
  [NTT_APP_ID]: nttIcon,
};

type Props = {
  appIds: string[];
};

const ProtocolsIcons = ({ appIds }: Props) => {
  const iconsToDisplay = useMemo(() => {
    let portalDisplayed = false;

    return appIds
      .map(appId => {
        const iconSrc = protocolIcons[appId] || portalIcon;
        if (iconSrc === portalIcon) {
          if (portalDisplayed) {
            return null;
          } else {
            portalDisplayed = true;
          }
        }
        return iconSrc;
      })
      .filter(Boolean);
  }, [appIds]);

  return (
    <div className="protocols-icons">
      <Tooltip maxWidth={false} tooltip={<div>{formatAppIds(appIds)}</div>} type="info">
        <div>
          {iconsToDisplay.map(iconSrc => (
            <img key={iconSrc} src={iconSrc} alt={iconSrc} height={24} width={24} />
          ))}
        </div>
      </Tooltip>
    </div>
  );
};

export default ProtocolsIcons;
