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
        const responseReversed = response.reverse();
        const totalAmount = responseReversed.reduce((prev, curr) => prev + curr.count, 0);
        const includedLabelIdxDay = [1, 4, 7, 10, 13, 16, 19, 22];
        const includedLabelIdxMonth = [1, 5, 9, 13, 17, 21, 25, 29];

        setTotalTxs(
          `Last ${range === "day" ? "24hs" : range}: ${totalAmount.toLocaleString()} txs`,
        );
        setSeriesData(responseReversed.map(item => item.count));
        setSeriesLabels(
          responseReversed.map((item, idx) => {
            const date = new Date(item.time);

            if (range === "day") {
              return includedLabelIdxDay.includes(idx) ? `${date.getHours()}:00` : "";
            }

            if (range === "week") {
              return `${date.toLocaleString("en-us", { weekday: "short" })}`;
            }

            if (range === "month") {
              return includedLabelIdxMonth.includes(idx)
                ? ` ${date.toLocaleString("en-us", { month: "short", day: "numeric" })} `
                : "";
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
          <div className="trans-history-chart">
            <ReactApexChart
              type="area"
              height={220}
              series={[
                {
                  name: "LastTxsData",
                  data: seriesData,
                },
              ]}
              options={{
                title: {
                  text: totalTxs,
                  align: "left",
                  style: {
                    color: "var(--color-primary-100)",
                    fontFamily: "IBM Plex Sans",
                    fontSize: "16px",
                    fontWeight: 400,
                  },
                },
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
                    formatter: (val: number): string => {
                      if (val >= 1000000) {
                        return (val / 1000000).toFixed(1) + "M";
                      } else if (val >= 1000) {
                        return (val / 1000).toFixed(0) + "K";
                      } else {
                        return `${val}`;
                      }
                    },
                    style: {
                      colors: "var(--color-primary-50)",
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
                      colors: "var(--color-primary-50)",
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
