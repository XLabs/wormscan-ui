import { useQuery } from "react-query";
import { wormscanClient } from "src/App";
import { Chart } from "./Chart";
import { ChainID } from "wormscan-sdk";

import Loader from "src/components/atoms/Loader";
import "./styles.scss";
import { useEffect, useState } from "react";

const MIN_VALUE_ON_CHART = 2500;

const VAACountChart = () => {
  const {
    isLoading,
    error,
    data: response,
  } = useQuery("vaaCount", () => wormscanClient.getVAAsCount());

  if (error) return null;

  const [chartData, setChartData] = useState<(typeof response)["data"]>([]);
  const [excludedChartData, setExcludedChartData] = useState<(typeof response)["data"]>([]);

  useEffect(() => {
    if (response?.data) {
      const sortedData = response.data.sort((a, b) => b.count - a.count);

      setChartData(sortedData.filter(a => a.chainId !== 26 && a.count > MIN_VALUE_ON_CHART));
      setExcludedChartData(
        sortedData.filter(a => a.chainId === 26 || a.count <= MIN_VALUE_ON_CHART),
      );
    }
  }, [response]);

  return (
    <div className="vaa-count">
      <div className="vaa-count-title">VAAs count by blockchain</div>

      <div className="vaa-count-container">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="vaa-count-container-chart">
            <Chart chartData={chartData} />

            <div className="vaa-count-excluded">
              <span className="vaa-count-excluded-title">
                The following blockchains were excluded from the chart:
              </span>
              <div className="vaa-count-excluded-items">
                {excludedChartData.map(a => (
                  <span
                    key={a.chainId}
                    className={`vaa-count-excluded-item ${
                      a.count > MIN_VALUE_ON_CHART ? "red" : "grey"
                    }`}
                  >
                    {ChainID[a.chainId]} ({a.count})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VAACountChart;
