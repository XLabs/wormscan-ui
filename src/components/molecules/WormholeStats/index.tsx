import WormholeLogo from "src/assets/wormhole-stats.svg";
import FlipNumbers from "react-flip-numbers";
import { CSSProperties, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useEnvironment } from "src/context/EnvironmentContext";
import { WORMHOLE_PAGE_URL } from "src/consts";
import { Loader, Select, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { getClient } from "src/api/Client";
import { InfoCircleIcon, LinkIcon } from "src/icons/generic";
import "./styles.scss";
import analytics from "src/analytics";

const RANGE_LIST: { label: string; value: "24h" | "7d" | "30d" }[] = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

const WormholeStats = () => {
  const { t } = useTranslation();
  const { environment } = useEnvironment();
  const isMainnet = environment.network === "Mainnet";
  const [rangeTime, setRangeTime] = useState(RANGE_LIST[0]);

  const {
    isLoading,
    isError,
    data: scoreData,
  } = useQuery("scoresResponse", () => getClient().guardianNetwork.getScores(), {
    refetchInterval: 25000,
  });

  const {
    "24h_messages": messages24h,
    "24h_volume": volume24h,
    "30d_volume": volume30d,
    "7d_volume": volume7d,
    total_messages,
    total_volume,
  } = scoreData || {};

  const selectedVolume =
    rangeTime.value === "24h" ? volume24h : rangeTime.value === "7d" ? volume7d : volume30d;

  return (
    <div className="wormhole-stats">
      {isLoading ? (
        <div className="wormhole-stats-loader">
          <Loader />
        </div>
      ) : isError ? (
        <div className="wormhole-stats-error">
          <ErrorPlaceholder />
        </div>
      ) : (
        <div className="wormhole-stats-container">
          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              {t("home.statistics.allMessage")}
              <Tooltip
                tooltip={<div>Total messages sent since the creation of the network.</div>}
                type="info"
              >
                <div className="wormhole-stats-container-item-title-icon">
                  <InfoCircleIcon />
                </div>
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              <div className="wormhole-stats-container-item-value-flip">
                {total_messages ? (
                  <FlipNumbers
                    height={20}
                    width={14}
                    color="white"
                    background="var(--color-black)"
                    play
                    perspective={100}
                    numbers={formatNumber(Number(total_messages), 0)}
                    numberStyle={flipNumberCSS}
                    nonNumberStyle={{ ...flipNumberCSS, fontSize: 20 }}
                  />
                ) : (
                  "-"
                )}
              </div>
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              <span className="wormhole-stats-container-item-title-time">
                {t("home.statistics.dayMessageTime")}
              </span>{" "}
              {t("home.statistics.dayMessage")}
              <Tooltip
                tooltip={<div>Number of messages sent in the last 24 hours.</div>}
                type="info"
              >
                <div className="wormhole-stats-container-item-title-icon">
                  <InfoCircleIcon />
                </div>
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              <div className="wormhole-stats-container-item-value-flip">
                {messages24h ? (
                  <FlipNumbers
                    height={20}
                    width={14}
                    color="white"
                    background="var(--color-black)"
                    play
                    perspective={100}
                    numbers={formatNumber(Number(messages24h), 0)}
                    numberStyle={flipNumberCSS}
                    nonNumberStyle={{ ...flipNumberCSS, fontSize: 20 }}
                  />
                ) : (
                  "-"
                )}
              </div>
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              {t("home.statistics.allVolume")}
              <Tooltip
                tooltip={
                  <div>This metric calculates the all-time total USD value of VAA transfers.</div>
                }
                type="info"
              >
                <div className="wormhole-stats-container-item-title-icon">
                  <InfoCircleIcon />
                </div>
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              {isMainnet ? (
                <div className="wormhole-stats-container-item-value-flip">
                  <span className="wormhole-stats-container-item-value-flip-dollar">$</span>
                  <FlipNumbers
                    height={20}
                    width={14}
                    color="white"
                    background="var(--color-black)"
                    play
                    perspective={100}
                    numbers={formatNumber(Number(total_volume), 0)}
                    numberStyle={flipNumberCSS}
                    nonNumberStyle={{ ...flipNumberCSS, fontSize: 20 }}
                  />
                </div>
              ) : (
                "-"
              )}
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              <span className="wormhole-stats-container-item-title-time">
                {isMainnet ? (
                  <Select
                    ariaLabel="Select Time Range"
                    className="wormhole-stats-container-item-title-time-select"
                    items={RANGE_LIST}
                    name="topAssetTimeRange"
                    onValueChange={value => {
                      setRangeTime(value);

                      analytics.track("wormholeStatsTimeRange", {
                        network: environment.network,
                        selected: value.label,
                      });
                    }}
                    value={{
                      label: (
                        <>
                          {rangeTime.value}
                          <svg
                            className="wormhole-stats-container-item-title-time-arrow"
                            fill="none"
                            height={24}
                            viewBox="0 0 12 24"
                            width={12}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              opacity="0.8"
                              d="M3 10L6 7L9 10"
                              stroke="#CCCCCC"
                              strokeWidth="1.5"
                            />
                            <path
                              opacity="0.8"
                              d="M3 14L6 17L9 14"
                              stroke="#CCCCCC"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </>
                      ),
                      value: "",
                    }}
                  />
                ) : (
                  t("home.statistics.dayVolumeTime")
                )}
              </span>{" "}
              {t("home.statistics.dayVolume")}
              <Tooltip
                tooltip={<div>This metric calculates the last 24h USD value of VAA transfers.</div>}
                type="info"
              >
                <div className="wormhole-stats-container-item-title-icon">
                  <InfoCircleIcon />
                </div>
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              {isMainnet ? (
                <div className="wormhole-stats-container-item-value-flip">
                  <span className="wormhole-stats-container-item-value-flip-dollar">$</span>
                  {selectedVolume ? (
                    <FlipNumbers
                      height={20}
                      width={14}
                      color="white"
                      background="var(--color-black)"
                      play
                      perspective={100}
                      numbers={formatNumber(Number(selectedVolume), 0)}
                      numberStyle={flipNumberCSS}
                      nonNumberStyle={{ ...flipNumberCSS, fontSize: 20 }}
                    />
                  ) : (
                    "-"
                  )}
                </div>
              ) : (
                "-"
              )}
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title"></div>
            <div className="wormhole-stats-container-item-value">
              <a
                className="wormhole-stats-container-item-value-link"
                href={WORMHOLE_PAGE_URL}
                rel="noreferrer"
                target="_blank"
              >
                <img src={WormholeLogo} alt="wormhole" />
                <LinkIcon width={24} />
              </a>
            </div>
          </div>

          <div className="wormhole-stats-container-line" />
        </div>
      )}
    </div>
  );
};

const flipNumberCSS: CSSProperties = {
  fontFamily: "Roboto Mono",
  fontSize: "18px",
  fontWeight: 400,
  letterSpacing: "0px",
};

export default WormholeStats;
