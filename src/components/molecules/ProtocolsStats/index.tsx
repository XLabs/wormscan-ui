import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { DashIcon, TriangleDownIcon } from "@radix-ui/react-icons";
import allBridgeIcon from "src/icons/Protocols/allBridgeIcon.svg";
import cctpIcon from "src/icons/Protocols/cctpIcon.svg";
import mayanIcon from "src/icons/Protocols/mayanIcon.svg";
import portalIcon from "src/icons/Protocols/portalIcon.svg";
import { Loader } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { getClient } from "src/api/Client";
import { ProtocolName, ProtocolsStatsOutput } from "src/api/guardian-network/types";
import "./styles.scss";

const protocolIcons: Record<ProtocolName, string> = {
  allbridge: allBridgeIcon,
  cctp: cctpIcon,
  mayan: mayanIcon,
  portal: portalIcon,
};

const protocolNames: Record<ProtocolName, string> = {
  allbridge: "Allbridge",
  cctp: "CCTP",
  mayan: "Mayan",
  portal: "Portal",
};

const ProtocolsStats = () => {
  const [protocolSelected, setProtocolSelected] = useState<ProtocolsStatsOutput>();

  const { isLoading, isError, data } = useQuery("protocolsStats", () =>
    getClient().guardianNetwork.getProtocolsStats(),
  );

  useEffect(() => {
    if (data && data.length > 0) {
      setProtocolSelected(data[0]);
    }
  }, [data]);

  const handleClick = (item: ProtocolsStatsOutput) => {
    setProtocolSelected(item);
  };

  return (
    <div className="protocols-stats">
      <h3 className="protocols-stats-title">Featured Protocols Stats</h3>
      {isLoading ? (
        <div className="protocols-stats-loader">
          <Loader />
        </div>
      ) : isError ? (
        <div className="wormhole-stats-error">
          <ErrorPlaceholder />
        </div>
      ) : (
        <div className="protocols-stats-container">
          <div className="protocols-stats-container-list">
            {data?.map((item: ProtocolsStatsOutput) => (
              <div
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
              </div>
            ))}
            {/* <p className="protocols-stats-container-list-soon">MORE PROTOCOLS COMING SOON</p> */}
          </div>
          <div className="protocols-stats-container-info">
            <div className="protocols-stats-container-info-item">
              <h4 className="protocols-stats-container-info-item-title">TVT</h4>
              <p className="protocols-stats-container-info-item-value">
                ${formatNumber(+protocolSelected?.total_value_transferred)}
              </p>
            </div>
            <div className="protocols-stats-container-info-item">
              <h4 className="protocols-stats-container-info-item-title">TOTAL MESSAGES</h4>
              <p className="protocols-stats-container-info-item-value">
                {formatNumber(+protocolSelected?.total_messages)}
              </p>
            </div>
            <div className="protocols-stats-container-info-item">
              <h4 className="protocols-stats-container-info-item-title">24H MESSAGES</h4>
              <p className="protocols-stats-container-info-item-value">
                {formatNumber(+protocolSelected?.last_day_messages)}
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
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolsStats;
