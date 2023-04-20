import client from "src/api/Client";
import { useMutation } from "react-query";
import { Loader } from "src/components/atoms";
import "./styles.scss";
import ReactApexChart from "react-apexcharts";
import { DateRange } from "@xlabs-libs/wormscan-sdk";
import { useEffect, useState } from "react";

type Props = {
  range: DateRange;
};

const TransactionHistoryChart = ({ range }: Props) => {
  const [seriesData, setSeriesData] = useState([0]);
  const [seriesLabels, setSeriesLabels] = useState([""]);
  const [totalTxs, setTotalTxs] = useState("");

  const { isLoading, isError, mutate } = useMutation(
    "lastTxsResponse",
    () => client.guardianNetwork.getLastTxs(range),
    {
      onSuccess: response => {
        const totalAmount = response.reduce((prev, curr) => prev + curr.count, 0);
        const excludedLabelsIdxs = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28];

        setTotalTxs(
          `Last ${range === "day" ? "24hs" : range}: ${totalAmount.toLocaleString()} txns`,
        );
        setSeriesData(response.map(item => item.count));
        setSeriesLabels(
          response.map((item, idx) => {
            const date = new Date(item.time);

            if (range === "day") {
              return excludedLabelsIdxs.includes(idx) ? `${date.getHours()}:00` : "";
            }

            if (range === "week") {
              return `${date.toLocaleString("en-us", { weekday: "short" })}`;
            }

            if (range === "month") {
              return excludedLabelsIdxs.includes(idx) ? `${date.getMonth()}/${date.getDate()}` : "";
            }
          }),
        );
      },
    },
  );

  // when range changes, we fetch the new range
  useEffect(mutate, [range]);

  if (isError) return null;
  return (
    <div className="trans-history" data-range={range}>
      {isLoading ? (
        <div className="trans-history-loader">
          <Loader />
        </div>
      ) : (
        <>
          <span className="trans-history-text">{isLoading ? "" : totalTxs}</span>
          <div className="trans-history-chart">
            <ReactApexChart
              type="area"
              height={200}
              series={[
                {
                  name: "LastTxsData",
                  data: seriesData,
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
                labels: seriesLabels,
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
        </>
      )}
    </div>
  );
};

export default TransactionHistoryChart;
