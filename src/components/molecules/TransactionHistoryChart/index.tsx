import client from "src/api/Client";
import { useQuery } from "react-query";
import { Loader } from "src/components/atoms";
import "./styles.scss";
import ReactApexChart from "react-apexcharts";

const mockedResponse = {
  txs: [
    41, 26, 110, 24, 49, 32, 80, 24, 59, 18, 50, 63, 105, 70, 81, 50, 50, 55, 45, 50, 70, 20, 23,
    45,
  ],
};

const TransactionHistoryChart = () => {
  const { isLoading, error, data } = useQuery("crossChainResponse", () =>
    client.guardianNetwork.getCrossChainActivity(),
  );

  if (error) return null;
  return (
    <div className="trans-history">
      {isLoading ? (
        <div className="trans-history-loader">
          <Loader />
        </div>
      ) : (
        <div className="trans-history-chart">
          <ReactApexChart
            type="area"
            height={200}
            series={[
              {
                name: "Test",
                data: mockedResponse.txs,
              },
            ]}
            options={{
              fill: {
                type: "gradient",
                gradient: {
                  type: "vertical",
                  shade: "light",
                  inverseColors: false,
                  opacityFrom: 1,
                  opacityTo: 0,
                  stops: [0, 75, 100],
                  colorStops: [
                    {
                      offset: 0,
                      color: "#09FECB",
                    },
                    {
                      offset: 75,
                      color: "#09FECB25",
                    },
                    {
                      offset: 100,
                      color: "transparent",
                    },
                  ],
                },
              },
              labels: [
                "", // 00:00
                "01:00",
                "", // 02:00
                "", // 03:00
                "04:00",
                "", // 05:00
                "", // 06:00
                "07:00",
                "", // 08:00
                "", // 09:00
                "10:00",
                "", // 11:00
                "", // 12:00
                "13:00",
                "", // 14:00
                "", // 15:00
                "16:00",
                "", // 17:00
                "", // 18:00
                "19:00",
                "", // 20:00
                "", // 21:00
                "22:00",
                "", // 23:00
              ],
              chart: {
                zoom: { enabled: false },
                toolbar: { show: false },
              },
              grid: {
                show: false,
              },
              tooltip: { enabled: false },
              stroke: {
                curve: "smooth",
                width: 2,
                colors: ["#28DFDF"],
              },
              dataLabels: { enabled: false },
              yaxis: {
                tickAmount: 4,
                labels: {
                  formatter: val => `${val}K`,
                  style: {
                    colors: "#BFCFE7",
                    fontFamily: "IBM Plex Sans",
                    fontSize: "14px",
                  },
                },
                axisBorder: {
                  show: true,
                  width: 1,
                  color: "#FFFFFF25",
                },
              },
              xaxis: {
                labels: {
                  hideOverlappingLabels: false,
                  rotate: 180,
                  style: {
                    colors: "#BFCFE7",
                    fontFamily: "IBM Plex Sans",
                    fontSize: "14px",
                  },
                },
                axisTicks: { show: false },
                axisBorder: { show: true, strokeWidth: 4, color: "#FFFFFF25" },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryChart;
