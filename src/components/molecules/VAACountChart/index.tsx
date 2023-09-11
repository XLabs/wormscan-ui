import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { Loader } from "src/components/atoms";
import { getClient } from "src/api/Client";
import { ChainId } from "src/api";
import { VAACount } from "src/api/guardian-network/types";
import { Chart } from "./Chart";
import "./styles.scss";

const MIN_VALUE_ON_CHART = 2500;

const VAACountChart = () => {
  const { t } = useTranslation();

  const { isLoading, error, data } = useQuery("vaaCount", () =>
    getClient().guardianNetwork.getVAACount(),
  );

  const [chartData, setChartData] = useState<VAACount[]>([]);
  const [excludedChartData, setExcludedChartData] = useState<VAACount[]>([]);

  useEffect(() => {
    if (data) {
      const sortedData = data.sort((a, b) => b.count - a.count);
      setChartData(
        sortedData.filter(a => a.chainId !== ChainId.PythNet && a.count > MIN_VALUE_ON_CHART),
      );
      setExcludedChartData(
        sortedData.filter(a => a.chainId === ChainId.PythNet || a.count <= MIN_VALUE_ON_CHART),
      );
    }
  }, [data]);

  if (error) return null;

  return (
    <div className="vaa-count">
      <div className="vaa-count-title">{t("home.vaaCount.title")}</div>
      <div className="vaa-count-container">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="vaa-count-container-chart">
            <Chart chartData={chartData} />

            <div className="vaa-count-excluded">
              <span className="vaa-count-excluded-title">{t("home.vaaCount.excluded")}</span>
              <div className="vaa-count-excluded-items">
                {excludedChartData.map(a => (
                  <span
                    key={a.chainId}
                    className={`vaa-count-excluded-item ${
                      a.count > MIN_VALUE_ON_CHART ? "red" : "grey"
                    }`}
                  >
                    {ChainId[a.chainId]} ({a.count})
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
