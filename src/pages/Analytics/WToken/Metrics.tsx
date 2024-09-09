import { GetSummaryResult } from "src/api/native-token-transfer/types";
import { Loader } from "src/components/atoms";
import { AnalyticsIcon } from "src/icons/generic";
import { formatNumber, numberToSuffix } from "src/utils/number";

interface IMetricsProps {
  summary: GetSummaryResult;
}

const Metrics = ({ summary }: IMetricsProps) => {
  return (
    <div className="summary-metrics">
      <div className="summary-metrics-title">
        <div className="summary-metrics-title-icon">
          <AnalyticsIcon width={20} />
        </div>
        <h2 className="summary-metrics-title-text">Summary Metrics</h2>
      </div>

      <div className="summary-metrics-container">
        <div className="summary-metrics-container-item">
          {summary?.totalValueTokenTransferred && (
            <>
              <h1 className="summary-metrics-container-item-up">
                ${numberToSuffix(+summary.totalValueTokenTransferred)}
              </h1>
              <div className="summary-metrics-container-item-down">
                Total value of W tokens transferred
              </div>
            </>
          )}
        </div>

        <div className="summary-metrics-container-item">
          {summary?.totalTokenTransferred && (
            <>
              <h1 className="summary-metrics-container-item-up">
                {formatNumber(+summary.totalTokenTransferred)}
              </h1>
              <div className="summary-metrics-container-item-down">
                Total W token transfers across chains
              </div>
            </>
          )}
        </div>

        <div className="summary-metrics-container-item">
          {summary?.circulatingSupply && (
            <>
              <h1 className="summary-metrics-container-item-up">
                {numberToSuffix(+summary.circulatingSupply)}
              </h1>
              <div className="summary-metrics-container-item-down">Circulating Supply</div>
            </>
          )}
        </div>

        <div className="summary-metrics-container-item">
          {summary?.marketCap && (
            <>
              <h1 className="summary-metrics-container-item-up">
                ${numberToSuffix(+summary.marketCap)}
              </h1>
              <div className="summary-metrics-container-item-down">Market Cap</div>
            </>
          )}
        </div>

        {/* <div className="summary-metrics-container-item">
          {summary?.averageTransferSize ? (
            <>
              <h1 className="summary-metrics-container-item-up">
                ${formatNumber(+summary.averageTransferSize, 0)}
              </h1>
              <div className="summary-metrics-container-item-down">Average transfer size</div>
            </>
          ) : (
            <Loader />
          )}
        </div>

        <div className="summary-metrics-container-item">
          {summary?.medianTransferSize && (
            <>
              <h1 className="summary-metrics-container-item-up">
                ${formatNumber(+summary.medianTransferSize)}
              </h1>
              <div className="summary-metrics-container-item-down">Median transfer size</div>
            </>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Metrics;
