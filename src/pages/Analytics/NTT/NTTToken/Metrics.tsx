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
              <div className="summary-metrics-container-item-label">Total value transferred</div>
              <h3 className="summary-metrics-container-item-value">
                ${isError ? " -" : renderValue(summary?.totalValueTokenTransferred)}
              </h3>
            </div>

            <div className="summary-metrics-container-item">
              <div className="summary-metrics-container-item-label">
                Fully diluted valuation
                <Tooltip tooltip="FDV=Current Price x Total Supply" type="info">
                  <div className="summary-metrics-container-item-label-icon">
                    <InfoCircleIcon />
                  </div>
                </Tooltip>
              </div>
              <h3 className="summary-metrics-container-item-value">
                {isError ? " -" : renderValue(summary?.fullyDilutedValuation)}
              </h3>
            </div>

            <div className="summary-metrics-container-item">
              <div className="summary-metrics-container-item-label">Market Cap</div>
              <h3 className="summary-metrics-container-item-value">
                ${isError ? " -" : renderValue(summary?.marketCap)}
              </h3>
            </div>

            <div className="summary-metrics-container-item">
              <div className="summary-metrics-container-item-label">Total Supply</div>
              <h3 className="summary-metrics-container-item-value">
                {isError ? " -" : renderValue(summary?.totalSupply)}
              </h3>
            </div>

            <div className="summary-metrics-container-item">
              <div className="summary-metrics-container-item-label">Total token transfers</div>
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
