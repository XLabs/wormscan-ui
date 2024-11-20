import { GetSummaryResult } from "src/api/native-token-transfer/types";
import { Loader, Tooltip } from "src/components/atoms";
import { AnalyticsIcon, InfoCircleIcon } from "src/icons/generic";
import { formatNumber } from "src/utils/number";

interface IMetricsProps {
  isError: boolean;
  isLoading: boolean;
  summary: GetSummaryResult;
}

export const Metrics = ({ isError, isLoading, summary }: IMetricsProps) => {
  const renderValue = (value?: number | string) => (value ? formatNumber(+value) : " -");

  return (
    <div className="summary-metrics">
      <div className="summary-metrics-title">
        <AnalyticsIcon />
        <h2 className="summary-metrics-title-text">Summary Metrics</h2>
      </div>

      <div className="summary-metrics-container">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className="summary-metrics-container-item">
              <div className="summary-metrics-container-item-label">
                Total value transferred
                <MetricsTooltip text="Total USD value of all transfers made using this token." />
              </div>
              <h3 className="summary-metrics-container-item-value">
                ${isError ? " -" : renderValue(summary?.totalValueTokenTransferred)}
              </h3>
            </div>

            <div className="summary-metrics-container-item">
              <div className="summary-metrics-container-item-label">
                Fully diluted valuation
                <MetricsTooltip text="Current price x Total Supply. Theoretical market value if the entire supply was circulating." />
              </div>
              <h3 className="summary-metrics-container-item-value">
                {isError ? " -" : renderValue(summary?.fullyDilutedValuation)}
              </h3>
            </div>

            <div className="summary-metrics-container-item">
              <div className="summary-metrics-container-item-label">
                Market Cap
                <MetricsTooltip text="Current price x Circulating Supply. The current value of circulating tokens in USD." />
              </div>
              <h3 className="summary-metrics-container-item-value">
                ${isError ? " -" : renderValue(summary?.marketCap)}
              </h3>
            </div>

            <div className="summary-metrics-container-item">
              <div className="summary-metrics-container-item-label">
                Circulating Supply
                <MetricsTooltip text="The number of tokens currently circulating in the market and available to the public." />
              </div>
              <h3 className="summary-metrics-container-item-value">
                {isError ? " -" : renderValue(summary?.circulatingSupply)}
              </h3>
            </div>

            <div className="summary-metrics-container-item">
              <div className="summary-metrics-container-item-label">
                Total token transfers
                <MetricsTooltip text="Total number of transactions involving this token." />
              </div>
              <h3 className="summary-metrics-container-item-value">
                {isError ? " -" : renderValue(summary?.totalTokenTransferred)}
              </h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const MetricsTooltip = ({ text }: { text: string }) => (
  <Tooltip tooltip={text} type="info">
    <div className="summary-metrics-container-item-label-icon">
      <InfoCircleIcon />
    </div>
  </Tooltip>
);
