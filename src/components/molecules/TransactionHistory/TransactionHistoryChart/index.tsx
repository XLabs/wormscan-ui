import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Loader } from "src/components/atoms";
import ReactApexChart from "react-apexcharts";
import { DateRange } from "@xlabs-libs/wormscan-sdk";
import { getClient } from "src/api/Client";
import { numberToSuffix } from "src/utils/number";
import ErrorPlaceholder from "../../ErrorPlaceholder";
import "./styles.scss";

type Props = {
  range: DateRange;
};

const TransactionHistoryChart = ({ range }: Props) => {
  const [seriesData, setSeriesData] = useState([0]);
  const [seriesLabels, setSeriesLabels] = useState([""]);
  const [totalTxs, setTotalTxs] = useState("");
  const tickAmount = range === "month" ? 4 : 5;

  const { data, isError, isLoading, isFetching } = useQuery(
    ["getLastTxs", range],
    () => getClient().guardianNetwork.getLastTxs(range),
    { cacheTime: 0 },
  );

  useEffect(() => {
    if (!data) return;

    const responseReversed = data.reverse();
    const totalAmount = responseReversed.reduce((prev, curr) => prev + curr.count, 0);

    setTotalTxs(`Last ${range === "day" ? "24hs" : range}: ${totalAmount.toLocaleString()} txs`);
    setSeriesData(responseReversed.map(item => item.count));
    setSeriesLabels(
      responseReversed.map(item => {
        const date = new Date(item.time);

        if (range === "day") {
          return date.toLocaleString("en", {
            hourCycle: "h23",
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        if (range === "week") {
          return date.toLocaleString("en", { weekday: "short" });
        }

        if (range === "month") {
          return date.toLocaleString("en", { month: "short", day: "numeric" });
        }
      }),
    );
  }, [data, range]);

  return (
    <div className="trans-history" data-range={range}>
      {isLoading || isFetching ? (
        <Loader />
      ) : (
        <>
          {isError ? (
            <ErrorPlaceholder errorType="chart" />
          ) : (
            <div className="trans-history-chart">
              <ReactApexChart
                type="area"
                height={"100%"}
                series={[
                  {
                    name: "Transactions",
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
                  tooltip: {
                    enabled: true,
                    x: {
                      show: false,
                    },
                    y: {
                      formatter: val => String(val),
                    },
                    marker: {
                      show: false,
                    },
                  },
                  stroke: {
                    curve: "smooth",
                    width: 2,
                    colors: ["#28DFDF"],
                  },
                  dataLabels: { enabled: false },
                  yaxis: {
                    tickAmount: 4,
                    labels: {
                      formatter: numberToSuffix,
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
                      rotate: 0,
                    },
                    tickAmount,
                    tickPlacement: "on",
                    axisTicks: { show: false },
                    axisBorder: { show: true, strokeWidth: 4, color: "#FFFFFF25" },
                  },
                  responsive: [
                    {
                      breakpoint: 1200,
                      options: {
                        xaxis: {
                          labels: {
                            rotate: -45,
                          },
                        },
                      },
                    },
                  ],
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistoryChart;
