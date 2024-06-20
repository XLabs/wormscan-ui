import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { DashIcon, ExternalLinkIcon, TriangleDownIcon } from "@radix-ui/react-icons";
import allBridgeIcon from "src/icons/Protocols/allBridgeIcon.svg";
import cctpIcon from "src/icons/Protocols/cctpIcon.svg";
import mayanIcon from "src/icons/Protocols/mayanIcon.svg";
import portalIcon from "src/icons/Protocols/portalIcon.svg";
import { ALLBRIDGE_URL, CCTP_URL, MAYAN_URL, PORTAL_BRIDGE_URL } from "src/consts";
import { Loader } from "src/components/atoms";
import { ErrorPlaceholder, WormholeBrand } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { getClient } from "src/api/Client";
import { ProtocolName, ProtocolsStatsOutput } from "src/api/guardian-network/types";
import "./styles.scss";
import analytics from "src/analytics";
import { useEnvironment } from "src/context/EnvironmentContext";

const protocolIcons: Record<ProtocolName, string> = {
  allbridge: allBridgeIcon,
  cctp: cctpIcon,
  mayan: mayanIcon,
  portal_token_bridge: portalIcon,
};

const protocolNames: Record<ProtocolName, string> = {
  allbridge: "Allbridge",
  cctp: "CCTP",
  mayan: "Mayan",
  portal_token_bridge: "Portal",
};

const protocolLinks: Record<ProtocolName, string> = {
  allbridge: ALLBRIDGE_URL,
  cctp: CCTP_URL,
  mayan: MAYAN_URL,
  portal_token_bridge: PORTAL_BRIDGE_URL,
};

const ProtocolsStats = () => {
  const { environment } = useEnvironment();

  const [protocolSelected, setProtocolSelected] = useState<ProtocolsStatsOutput>();
  const [sortedData, setSortedData] = useState<ProtocolsStatsOutput[]>([]);

  const { isLoading, isError, data } = useQuery("protocolsStats", () =>
    getClient().guardianNetwork.getProtocolsStats(),
  );

  useEffect(() => {
    if (data && data.length > 0) {
      const orderedData = [...data].sort((a: ProtocolsStatsOutput, b: ProtocolsStatsOutput) => {
        const aValue = a.total_value_transferred || 0;
        const bValue = b.total_value_transferred || 0;
        return bValue - aValue;
      });

      setSortedData(orderedData);
      setProtocolSelected(orderedData[0]);
    }
  }, [data]);

  const handleClick = (item: ProtocolsStatsOutput) => {
    setProtocolSelected(item);
    analytics.track("featuredProtocols", {
      selected: item.protocol,
      network: environment.network,
    });
  };

  return (
    <div className="protocols-stats">
      <h3 className="protocols-stats-title">Featured Protocols Stats</h3>
      {isLoading ? (
        <div className="protocols-stats-loader">
          <Loader />
        </div>
      ) : isError ? (
        <div className="protocols-stats-error">
          <ErrorPlaceholder />
        </div>
      ) : (
        <div className="protocols-stats-container">
          <div className="protocols-stats-container-list">
            {sortedData?.map((item: ProtocolsStatsOutput) => {
              if (!protocolNames[item?.protocol]) return null;

              return (
                <button
                  key={item.protocol}
                  className={`protocols-stats-container-list-item ${
                    protocolSelected?.protocol === item.protocol ? "active" : ""
                  }`}
                  onClick={() => handleClick(item)}
                >
                  <div className="protocols-stats-container-list-item-logo">
                    <img src={protocolIcons[item.protocol]} alt={item.protocol} />
                  </div>
                  <div className="protocols-stats-container-list-item-name">
                    {protocolNames[item.protocol]}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="protocols-stats-container-info">
            <a
              className="protocols-stats-container-info-link"
              href={protocolLinks[protocolSelected?.protocol]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {protocolNames[protocolSelected?.protocol]}
              <ExternalLinkIcon height={15} width={15} />
            </a>
            <WormholeBrand />
            <div className="protocols-stats-container-info-item">
              <h4 className="protocols-stats-container-info-item-title">
                <span>TOTAL TRANSFERRED</span>
                <span>TOTAL VALUE TRANSFERRED</span>
              </h4>
              <p className="protocols-stats-container-info-item-value">
                $
                {protocolSelected?.total_value_transferred
                  ? formatNumber(protocolSelected?.total_value_transferred, 0)
                  : " -"}
              </p>
            </div>
            <div className="protocols-stats-container-info-item">
              <h4 className="protocols-stats-container-info-item-title">TOTAL MESSAGES</h4>
              <p className="protocols-stats-container-info-item-value">
                {protocolSelected?.total_messages
                  ? formatNumber(protocolSelected?.total_messages, 0)
                  : "-"}
              </p>
            </div>
            <div className="protocols-stats-container-info-item">
              <h4 className="protocols-stats-container-info-item-title">24H MESSAGES</h4>
              <p className="protocols-stats-container-info-item-value">
                {protocolSelected?.last_day_messages &&
                protocolSelected?.last_day_diff_percentage ? (
                  <>
                    {formatNumber(protocolSelected?.last_day_messages, 0)}
                    <span
                      className={`protocols-stats-container-info-item-value-diff ${
                        protocolSelected?.last_day_diff_percentage === "0.00%"
                          ? ""
                          : protocolSelected?.last_day_diff_percentage.startsWith("-")
                          ? "negative"
                          : "positive"
                      }`}
                    >
                      {protocolSelected?.last_day_diff_percentage === "0.00%" ? (
                        <DashIcon height={15} width={15} />
                      ) : (
                        <TriangleDownIcon height={15} width={15} />
                      )}

                      {protocolSelected?.last_day_diff_percentage.startsWith("-")
                        ? protocolSelected?.last_day_diff_percentage.slice(1)
                        : protocolSelected?.last_day_diff_percentage}
                    </span>
                  </>
                ) : (
                  "-"
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolsStats;
