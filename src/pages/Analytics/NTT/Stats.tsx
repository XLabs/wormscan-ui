import { ProtocolsStatsOutput } from "src/api/guardian-network/types";
import { Loader } from "src/components/atoms";
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
            <div className="ntt-page-stats-item-label">TOTAL VOLUME</div>
            <div className="ntt-page-stats-item-value">
              ${isError ? " -" : renderValue(data?.total_value_transferred)}
            </div>
          </div>
          <div className="ntt-page-stats-item">
            <div className="ntt-page-stats-item-label">24H VOLUME</div>
            <div className="ntt-page-stats-item-value">
              ${isError ? " -" : renderValue(data?.last_24_hour_volume)}
            </div>
          </div>
          <div className="ntt-page-stats-item">
            <div className="ntt-page-stats-item-label">TOTAL VALUE SECURED</div>
            <div className="ntt-page-stats-item-value">
              ${isError ? " -" : renderValue(data?.total_value_secured)}
            </div>
          </div>
          <div className="ntt-page-stats-item">
            <div className="ntt-page-stats-item-label">TOTAL TRANSFERS</div>
            <div className="ntt-page-stats-item-value">
              {isError ? " -" : renderValue(data?.total_messages)}
            </div>
          </div>
          <div className="ntt-page-stats-item">
            <div className="ntt-page-stats-item-label">24H TRANSFERS</div>
            <div className="ntt-page-stats-item-value">
              {isError ? " -" : renderValue(data?.last_day_messages)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
