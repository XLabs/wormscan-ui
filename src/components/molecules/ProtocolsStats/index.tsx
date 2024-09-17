import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { ALL_BRIDGE_APP_ID, BREAKPOINTS, MAYAN_APP_ID } from "src/consts";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Cube3DIcon, LinkIcon } from "src/icons/generic";
import { BlockchainIcon, Loader, NavLink, ProtocolIcon, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { chainsSupportedByProtocol, protocolLinksByProtocol } from "src/utils/filterUtils";
import {
  firstDataAvailableDate,
  oneDayAgoISOString,
  todayISOString,
  twoDaysAgoISOString,
} from "src/utils/date";
import { useWindowSize } from "src/utils/hooks";
import { getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
import { formatAppId } from "src/utils/crypto";
import { getClient } from "src/api/Client";
import "./styles.scss";

interface ITable {
  protocol: string;
  total_value_transferred: number;
  two_days_ago_value_transferred: number | string;
  last_day_value_transferred: number;
  last_day_value_diff_percentage: string;
  total_messages: number;
  two_days_ago_messages: number | string;
  last_day_messages: number;
  last_day_diff_percentage: string;
}

const calculatePercentageDiff = (newValue: number, oldValue: number) => {
  if (oldValue === 0 && newValue === 0) return "0.00%";
  if (oldValue === 0 && newValue > 0) return "N/A";
  return (((newValue - oldValue) / oldValue) * 100).toFixed(2) + "%";
};

const getClassAndPrefix = (percentage: string) => {
  const diffClass =
    percentage === "0.00%" || percentage === "N/A"
      ? ""
      : percentage.startsWith("-")
      ? "negative"
      : "positive";

  const prefix =
    !percentage.startsWith("-") && percentage !== "0.00%" && percentage !== "N/A" ? "+" : "";

  return { diffClass, prefix };
};

const ProtocolsStats = ({ numberOfProtocols }: { numberOfProtocols?: number }) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  const [dataTable, setDataTable] = useState<ITable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: allData, isError: isErrorAllData } = useQuery(["allData"], () =>
    getClient().guardianNetwork.getProtocolActivity({
      from: firstDataAvailableDate,
      to: todayISOString,
      timespan: "1mo",
    }),
  );

  const { data: last48To24HoursData, isError: isError48To24 } = useQuery(
    ["last48To24HoursData"],
    () =>
      getClient().guardianNetwork.getProtocolActivity({
        from: twoDaysAgoISOString,
        to: oneDayAgoISOString,
        timespan: "1h",
      }),
  );

  const { data: last24HoursData, isError: isError24Hours } = useQuery(["last24HoursData"], () =>
    getClient().guardianNetwork.getProtocolActivity({
      from: oneDayAgoISOString,
      to: todayISOString,
      timespan: "1h",
    }),
  );

  const { data: allTimeAllbridge, isError: isErrorAllTimeAllbridge } = useQuery(
    ["allTimeAllbridge"],
    () =>
      getClient().guardianNetwork.getAllbridgeActivity({
        from: firstDataAvailableDate,
        to: todayISOString,
      }),
    { enabled: isMainnet },
  );

  const { data: last48To24HoursAllbridge, isError: isErrorLast48To24Allbridge } = useQuery(
    ["last48To24HoursAllbridge"],
    () =>
      getClient().guardianNetwork.getAllbridgeActivity({
        from: twoDaysAgoISOString,
        to: oneDayAgoISOString,
      }),
    { enabled: isMainnet },
  );

  const { data: last24HoursAllbridge, isError: isErrorLast24HoursAllbridge } = useQuery(
    ["last24HoursAllbridge"],
    () =>
      getClient().guardianNetwork.getAllbridgeActivity({
        from: oneDayAgoISOString,
        to: todayISOString,
      }),
    { enabled: isMainnet },
  );

  const { data: stats, isError: isErrorStats } = useQuery(
    ["stats"],
    () => getClient().guardianNetwork.getProtocolsStats(),
    { enabled: isMainnet },
  );

  const { data: mayanStats, isError: isErrorMayanStats } = useQuery(
    ["mayanStats"],
    () => getClient().guardianNetwork.getMayanStats(),
    { enabled: isMainnet },
  );

  // const { data: last48To24HoursMayan, isError: isErrorLast48To24Mayan } = useQuery(
  //   ["last48To24HoursMayan"],
  //   () =>
  //     getClient().guardianNetwork.getMayanActivity({
  //       from: twoDaysAgoISOString,
  //       to: oneDayAgoISOString,
  //     }),
  //   { enabled: isMainnet },
  // );

  // const { data: last24HoursMayan, isError: isErrorLast24HoursMayan } = useQuery(
  //   ["last24HoursMayan"],
  //   () =>
  //     getClient().guardianNetwork.getMayanActivity({
  //       from: oneDayAgoISOString,
  //       to: todayISOString,
  //     }),
  //   { enabled: isMainnet },
  // );

  const isError =
    isErrorAllData ||
    isError48To24 ||
    isError24Hours ||
    isErrorAllTimeAllbridge ||
    isErrorLast48To24Allbridge ||
    isErrorLast24HoursAllbridge ||
    isErrorStats ||
    isErrorMayanStats;

  useEffect(() => {
    setIsLoading(true);
    setDataTable([]);

    if (isError) return;

    if (
      (isMainnet &&
        allData &&
        last48To24HoursData &&
        last24HoursData &&
        allTimeAllbridge &&
        last48To24HoursAllbridge &&
        last24HoursAllbridge &&
        stats &&
        mayanStats) ||
      (!isMainnet && allData && last48To24HoursData && last24HoursData)
    ) {
      const processedData: ITable[] = [];

      allData
        .filter(
          item =>
            item.app_id !== "STABLE" &&
            item.app_id !== "WORMHOLE_GATEWAY_TRANSFER" &&
            item.app_id !== MAYAN_APP_ID,
        )
        .forEach(item => {
          const last48To24HoursItem = last48To24HoursData.find(
            range => range.app_id === item.app_id,
          );
          const last24HoursItem = last24HoursData.find(range => range.app_id === item.app_id);

          const twoDaysAgoValueTransferred =
            last48To24HoursItem?.time_range_data?.reduce(
              (sum, range) => sum + range.total_value_transferred,
              0,
            ) || 0;

          const lastDayValueTransferred =
            last24HoursItem?.time_range_data?.reduce(
              (sum, range) => sum + range.total_value_transferred,
              0,
            ) || 0;

          const lastDayValueDiffPercentage = calculatePercentageDiff(
            lastDayValueTransferred,
            twoDaysAgoValueTransferred,
          );

          const twoDaysAgoMessages =
            last48To24HoursItem?.time_range_data?.reduce(
              (sum, range) => sum + range.total_messages,
              0,
            ) || 0;

          const lastDayMessages =
            last24HoursItem?.time_range_data?.reduce(
              (sum, range) => sum + range.total_messages,
              0,
            ) || 0;

          const lastDayMessagesDiffPercentage = calculatePercentageDiff(
            lastDayMessages,
            twoDaysAgoMessages,
          );

          processedData.push({
            protocol: item.app_id,
            total_value_transferred:
              item.time_range_data?.reduce(
                (sum, range) => sum + range.total_value_transferred,
                0,
              ) || 0,
            total_messages:
              item.time_range_data?.reduce((sum, range) => sum + range.total_messages, 0) || 0,
            two_days_ago_value_transferred: twoDaysAgoValueTransferred,
            last_day_value_transferred: lastDayValueTransferred,
            last_day_value_diff_percentage: lastDayValueDiffPercentage,
            two_days_ago_messages: twoDaysAgoMessages,
            last_day_messages: lastDayMessages,
            last_day_diff_percentage: lastDayMessagesDiffPercentage,
          });
        });

      if (isMainnet) {
        const allBridgeAllMessages = allTimeAllbridge.activity.reduce(
          (sum, range) => sum + +range.txs,
          0,
        );

        const allBridgeLast48To24HoursMessages = last48To24HoursAllbridge.activity.reduce(
          (sum, range) => sum + +range.txs,
          0,
        );

        const allBridgeLast24HoursMessages = last24HoursAllbridge.activity.reduce(
          (sum, range) => sum + +range.txs,
          0,
        );

        const allBridgeLast48To24HoursVolume = last48To24HoursAllbridge.activity.reduce(
          (sum, range) => {
            const value = Number(range.total_usd);
            return !isNaN(value) ? sum + value : sum;
          },
          0,
        );

        const allBridgeLast24HoursVolume = last24HoursAllbridge.activity.reduce((sum, range) => {
          const value = Number(range.total_usd);
          return !isNaN(value) ? sum + value : sum;
        }, 0);

        const allBridgeLastDayValueDiffPercentage = calculatePercentageDiff(
          allBridgeLast24HoursVolume,
          allBridgeLast48To24HoursVolume,
        );

        const allBridgeLastDayMessagesDiffPercentage = calculatePercentageDiff(
          allBridgeLast24HoursMessages,
          allBridgeLast48To24HoursMessages,
        );

        const allbridgeData = {
          protocol: ALL_BRIDGE_APP_ID,
          total_value_transferred: +allTimeAllbridge.total_value_transferred,
          total_messages: allBridgeAllMessages,
          two_days_ago_value_transferred: +last48To24HoursAllbridge.total_value_transferred,
          last_day_value_transferred: +last24HoursAllbridge.total_value_transferred,
          last_day_value_diff_percentage: allBridgeLastDayValueDiffPercentage,
          two_days_ago_messages: allBridgeLast48To24HoursMessages,
          last_day_messages: allBridgeLast24HoursMessages,
          last_day_diff_percentage: allBridgeLastDayMessagesDiffPercentage,
        };

        processedData.push(allbridgeData);

        // const mayanInfo = stats.find(item => item.protocol === "mayan");

        // const mayanLastDayValueDiffPercentage = calculatePercentageDiff(
        //   last24HoursMayan.total_value_transferred,
        //   last48To24HoursMayan.total_value_transferred,
        // );

        // const mayanLastDayMessagesDiffPercentage = calculatePercentageDiff(
        //   last24HoursMayan.total_messages,
        //   last48To24HoursMayan.total_messages,
        // );

        const mayanData = {
          protocol: MAYAN_APP_ID,
          total_value_transferred: mayanStats.allTime.volume,
          total_messages: mayanStats.allTime.swaps,
          two_days_ago_value_transferred: "N/A",
          last_day_value_transferred: mayanStats.last24h.volume,
          last_day_value_diff_percentage: "N/A",
          two_days_ago_messages: "N/A",
          last_day_messages: mayanStats.last24h.swaps,
          last_day_diff_percentage: "N/A",
        };

        processedData.push(mayanData);

        setDataTable(
          processedData.sort((a, b) => b.total_value_transferred - a.total_value_transferred),
        );
        setIsLoading(false);
      } else {
        setDataTable(processedData.sort((a, b) => b.total_messages - a.total_messages));
        setIsLoading(false);
      }
    }
  }, [
    allData,
    last48To24HoursData,
    last24HoursData,
    allTimeAllbridge,
    last48To24HoursAllbridge,
    last24HoursAllbridge,
    stats,
    isMainnet,
    isError,
    mayanStats,
  ]);

  return (
    <div className={`protocols-stats ${currentNetwork}`}>
      <h3 className="protocols-stats-title">
        <Cube3DIcon width={24} />
        {numberOfProtocols
          ? `TOP ${numberOfProtocols} Protocols by ${isMainnet ? "Volume" : "Transfers"}`
          : "Protocols Stats"}

        {numberOfProtocols && (
          <NavLink className="protocols-stats-title-link" to="/analytics/protocols">
            View More
          </NavLink>
        )}
      </h3>

      {isError ? (
        <div className="protocols-stats-error">
          <ErrorPlaceholder />
        </div>
      ) : (
        <div className="protocols-stats-container">
          <div className="protocols-stats-container-header">
            <h4 className="protocols-stats-container-header-title">PROTOCOL</h4>
            {isMainnet && (
              <>
                <h4 className="protocols-stats-container-header-title">TOTAL VOLUME</h4>
                <h4 className="protocols-stats-container-header-title">24H VOLUME</h4>
              </>
            )}
            <h4 className="protocols-stats-container-header-title">TOTAL TRANSFERS</h4>
            <h4 className="protocols-stats-container-header-title">24H TRANSFERS</h4>
            <h4 className="protocols-stats-container-header-title">CHAINS</h4>
          </div>

          {isLoading ? (
            isDesktop ? (
              Array.from({ length: numberOfProtocols || 13 }).map((_, i) => (
                <div className="protocols-stats-container-element-loader" key={i} />
              ))
            ) : (
              <Loader />
            )
          ) : (
            dataTable?.map((item, i) => {
              if (i >= numberOfProtocols) return null;

              const { diffClass: diffValueClass, prefix: prefixValue } = getClassAndPrefix(
                item?.last_day_value_diff_percentage,
              );

              const { diffClass: diffMessagesClass, prefix: prefixMessages } = getClassAndPrefix(
                item?.last_day_diff_percentage,
              );

              return (
                <div className="protocols-stats-container-element" key={item.protocol}>
                  <a
                    className="protocols-stats-container-element-item"
                    href={protocolLinksByProtocol[item.protocol]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ProtocolIcon protocol={item.protocol} />

                    <p className="protocols-stats-container-element-item-protocol">
                      {formatAppId(item.protocol)}
                    </p>

                    <LinkIcon width={24} />
                  </a>

                  {isMainnet && (
                    <>
                      <div className="protocols-stats-container-element-item">
                        <h4 className="protocols-stats-container-element-item-title">
                          TOTAL VOLUME
                        </h4>
                        <p className="protocols-stats-container-element-item-value">
                          $
                          {item?.total_value_transferred
                            ? formatNumber(item?.total_value_transferred, 0)
                            : " -"}
                        </p>
                      </div>

                      <div className="protocols-stats-container-element-item">
                        <h4 className="protocols-stats-container-element-item-title">24H VOLUME</h4>
                        <p className="protocols-stats-container-element-item-value">
                          ${formatNumber(item?.last_day_value_transferred, 0)}
                          {item?.last_day_diff_percentage !== "N/A" && (
                            <Tooltip
                              type="info"
                              tooltip={
                                <div>
                                  <p>
                                    ${formatNumber(+item?.two_days_ago_value_transferred, 0)} were
                                    transferred in the previous 24 hours.
                                  </p>
                                  <br />
                                  <p>
                                    ${formatNumber(item?.last_day_value_transferred, 0)} were
                                    transferred in the last 24 hours.
                                  </p>
                                </div>
                              }
                            >
                              <span
                                className={`protocols-stats-container-element-item-value-diff ${diffValueClass}`}
                              >
                                {prefixValue}
                                {item?.last_day_value_diff_percentage}
                              </span>
                            </Tooltip>
                          )}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="protocols-stats-container-element-item">
                    <h4 className="protocols-stats-container-element-item-title">
                      TOTAL TRANSFERS
                    </h4>
                    <p className="protocols-stats-container-element-item-value">
                      {item?.total_messages ? formatNumber(item?.total_messages, 0) : "-"}
                    </p>
                  </div>

                  <div className="protocols-stats-container-element-item">
                    <h4 className="protocols-stats-container-element-item-title">24H TRANSFERS</h4>
                    <p className="protocols-stats-container-element-item-value">
                      {formatNumber(item?.last_day_messages, 0)}
                      {item?.last_day_diff_percentage !== "N/A" && (
                        <Tooltip
                          type="info"
                          tooltip={
                            <div>
                              <p>
                                {formatNumber(+item?.two_days_ago_messages, 0)} messages were sent
                                in the previous 24 hours.
                              </p>
                              <br />
                              <p>
                                {formatNumber(item?.last_day_messages, 0)} messages were sent in the
                                last 24 hours.
                              </p>
                            </div>
                          }
                        >
                          <span
                            className={`protocols-stats-container-element-item-value-diff ${diffMessagesClass}`}
                          >
                            {prefixMessages}
                            {item?.last_day_diff_percentage}
                          </span>
                        </Tooltip>
                      )}
                    </p>
                  </div>

                  <div className="protocols-stats-container-element-item">
                    <h4 className="protocols-stats-container-element-item-title">CHAINS</h4>
                    <div className="protocols-stats-container-element-item-value">
                      <Tooltip
                        type="info"
                        maxWidth={false}
                        tooltip={
                          <div className="protocols-stats-container-element-item-value-tooltip">
                            {chainsSupportedByProtocol?.[item.protocol]?.map(chainId => {
                              return (
                                <div
                                  className="protocols-stats-container-element-item-value-tooltip-content"
                                  key={chainId}
                                >
                                  <BlockchainIcon
                                    background="#1F1F1F"
                                    chainId={chainId}
                                    network={currentNetwork}
                                    size={20}
                                  />

                                  {getChainName({ chainId, network: currentNetwork })}
                                </div>
                              );
                            })}
                          </div>
                        }
                      >
                        <div className="protocols-stats-container-element-item-value-chains">
                          {chainsSupportedByProtocol?.[item.protocol]?.map((chainId, i) => {
                            if (i > 7) return null;

                            if (i === 7 && chainsSupportedByProtocol[item.protocol].length > 8) {
                              return (
                                <div
                                  key={chainId}
                                  className="protocols-stats-container-element-item-value-chains-chain protocols-stats-container-element-item-value-chains-chain-more"
                                >
                                  {chainsSupportedByProtocol[item.protocol].length - 7}
                                </div>
                              );
                            }

                            return (
                              <BlockchainIcon
                                background="#1F1F1F"
                                chainId={chainId}
                                className="protocols-stats-container-element-item-value-chains-chain"
                                colorless={true}
                                key={chainId}
                                network={currentNetwork}
                                size={28}
                              />
                            );
                          })}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ProtocolsStats;
