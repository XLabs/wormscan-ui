import { GetSummaryResult } from "src/api/native-token-transfer/types";
import { Loader } from "src/components/atoms";
import { WORMHOLE_PAGE_URL } from "src/consts";
import { ActivityIcon, LinkIcon } from "src/icons/generic";
import { formatNumber, numberToSuffix } from "src/utils/number";
import { getTokenIcon } from "src/utils/token";

type SummaryProps = {
  summary: GetSummaryResult;
};

export const Summary = ({ summary }: SummaryProps) => {
  const tokenIcon = getTokenIcon("W");

  return (
    <div className="summary">
      <div className="summary-top">
        <div className="summary-top-img">
          <img src={tokenIcon} alt="W Token Icon" height="60" width="60" loading="lazy" />
        </div>
        <div className="summary-top-content">
          <h1 className="summary-top-content-title">Wormhole Token</h1>
          <div className="summary-top-content-container">
            <div className="summary-top-content-container-item">
              <div className="summary-top-content-container-item-up">Project Name</div>
              <div className="summary-top-content-container-item-down">Wormhole Token</div>
            </div>

            <div className="summary-top-content-container-item">
              <div className="summary-top-content-container-item-up">Project URL</div>
              <div className="summary-top-content-container-item-down">
                <a className="link" href={WORMHOLE_PAGE_URL} rel="noreferrer" target="_blank">
                  <span>https://wormhole.com</span>
                  <LinkIcon width={24} />
                </a>
              </div>
            </div>

            <div className="summary-top-content-container-item">
              <div className="summary-top-content-container-item-up">Unit Name</div>
              <div className="summary-top-content-container-item-down">W</div>
            </div>

            <div className="summary-top-content-container-item">
              <div className="summary-top-content-container-item-up">Market Cap</div>
              <div className="summary-top-content-container-item-down">
                ${summary?.marketCap ? formatNumber(+summary.marketCap, 0) : "..."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-metrics">
        <div className="summary-metrics-title">
          <div className="summary-metrics-title-icon">
            <ActivityIcon width={20} />
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
          </div>

          <div className="summary-metrics-container-item">
            {summary?.circulatingSupply && (
              <>
                <h1 className="summary-metrics-container-item-up">
                  {numberToSuffix(+summary.circulatingSupply)} W
                </h1>
                <div className="summary-metrics-container-item-down">Circulating Supply</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
