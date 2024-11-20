import { ProtocolsStatsOutput } from "src/api/guardian-network/types";
import { Loader, Tooltip } from "src/components/atoms";
import { InfoCircleIcon } from "src/icons/generic";
import { formatNumber } from "src/utils/number";

interface Props {
  data: ProtocolsStatsOutput;
  isLoading: boolean;
  isError: boolean;
}

export const Stats = ({ data, isLoading, isError }: Props) => {
  const renderValue = (value?: number) => (value ? formatNumber(+value, 0) : " -");

  return (
    <div className="ntt-page-stats">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="ntt-page-stats-item">
            <div className="ntt-page-stats-item-label">
              TOTAL VOLUME
              <StatsTooltip text="Total value in USD transferred through Wormhole NTT." />
            </div>
            <div className="ntt-page-stats-item-value">
              ${isError ? " -" : renderValue(data?.total_value_transferred)}
            </div>
          </div>
          <div className="ntt-page-stats-item">
            <div className="ntt-page-stats-item-label">
              24H VOLUME
              <StatsTooltip text="USD volume transferred via NTT in the last 24 hours." />
            </div>
            <div className="ntt-page-stats-item-value">
              ${isError ? " -" : renderValue(data?.last_24_hour_volume)}
            </div>
          </div>
          <div className="ntt-page-stats-item">
            <div className="ntt-page-stats-item-label">
              TOTAL VALUE SECURED
              <StatsTooltip text="Sum of the fully diluted valuations of all NTT tokens." />
            </div>
            <div className="ntt-page-stats-item-value">
              ${isError ? " -" : renderValue(data?.total_value_secured)}
            </div>
          </div>
          <div className="ntt-page-stats-item">
            <div className="ntt-page-stats-item-label">
              TOTAL TRANSFERS
              <StatsTooltip text="Total number of NTT transfers made over time." />
            </div>
            <div className="ntt-page-stats-item-value">
              {isError ? " -" : renderValue(data?.total_messages)}
            </div>
          </div>
          <div className="ntt-page-stats-item">
            <div className="ntt-page-stats-item-label">
              24H TRANSFERS
              <StatsTooltip text="Number of NTT transactions made in the last 24 hours." />
            </div>
            <div className="ntt-page-stats-item-value">
              {isError ? " -" : renderValue(data?.last_day_messages)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatsTooltip = ({ text }: { text: string }) => (
  <Tooltip tooltip={text} type="info">
    <div className="ntt-page-stats-item-label-icon">
      <InfoCircleIcon />
    </div>
  </Tooltip>
);
