import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Loader } from "src/components/atoms";
import ReactApexChart from "react-apexcharts";
import { DateRange } from "@xlabs-libs/wormscan-sdk";
import { getClient } from "src/api/Client";
import { numberToSuffix } from "src/utils/number";
import { ErrorPlaceholder } from "src/components/molecules";
import "./styles.scss";

type Props = {
  range: DateRange;
};

const data3Months = [
  {
    time: "2023-07-31T20:26:20.505228728Z",
    count: 2981,
  },
  {
    time: "2023-07-30T00:00:00Z",
    count: 1276,
  },
  {
    time: "2023-07-29T00:00:00Z",
    count: 1214,
  },
  {
    time: "2023-07-28T00:00:00Z",
    count: 979,
  },
  {
    time: "2023-07-27T00:00:00Z",
    count: 943,
  },
  {
    time: "2023-07-26T00:00:00Z",
    count: 1282,
  },
  {
    time: "2023-07-25T00:00:00Z",
    count: 925,
  },
  {
    time: "2023-07-24T00:00:00Z",
    count: 1132,
  },
  {
    time: "2023-07-23T00:00:00Z",
    count: 1079,
  },
  {
    time: "2023-07-22T00:00:00Z",
    count: 1073,
  },
  {
    time: "2023-07-21T00:00:00Z",
    count: 964,
  },
  {
    time: "2023-07-20T00:00:00Z",
    count: 962,
  },
  {
    time: "2023-07-19T00:00:00Z",
    count: 1010,
  },
  {
    time: "2023-07-18T00:00:00Z",
    count: 1123,
  },
  {
    time: "2023-07-17T00:00:00Z",
    count: 1215,
  },
  {
    time: "2023-07-16T00:00:00Z",
    count: 965,
  },
  {
    time: "2023-07-15T00:00:00Z",
    count: 965,
  },
  {
    time: "2023-07-14T00:00:00Z",
    count: 1189,
  },
  {
    time: "2023-07-13T00:00:00Z",
    count: 1050,
  },
  {
    time: "2023-07-12T00:00:00Z",
    count: 1239,
  },
  {
    time: "2023-07-11T00:00:00Z",
    count: 1304,
  },
  {
    time: "2023-07-10T00:00:00Z",
    count: 2004,
  },
  {
    time: "2023-07-09T00:00:00Z",
    count: 1246,
  },
  {
    time: "2023-07-08T00:00:00Z",
    count: 1130,
  },
  {
    time: "2023-07-07T00:00:00Z",
    count: 1136,
  },
  {
    time: "2023-07-06T00:00:00Z",
    count: 1165,
  },
  {
    time: "2023-07-05T00:00:00Z",
    count: 1000,
  },
  {
    time: "2023-07-04T00:00:00Z",
    count: 1126,
  },
  {
    time: "2023-07-03T00:00:00Z",
    count: 1279,
  },
  {
    time: "2023-07-02T00:00:00Z",
    count: 1122,
  },
  {
    time: "2023-07-01T00:00:00Z",
    count: 88,
  },
  {
    time: "2023-06-31T20:26:20.505228728Z",
    count: 2981,
  },
  {
    time: "2023-06-30T00:00:00Z",
    count: 1276,
  },
  {
    time: "2023-06-29T00:00:00Z",
    count: 1214,
  },
  {
    time: "2023-06-28T00:00:00Z",
    count: 979,
  },
  {
    time: "2023-06-27T00:00:00Z",
    count: 943,
  },
  {
    time: "2023-06-26T00:00:00Z",
    count: 1282,
  },
  {
    time: "2023-06-25T00:00:00Z",
    count: 925,
  },
  {
    time: "2023-06-24T00:00:00Z",
    count: 1132,
  },
  {
    time: "2023-06-23T00:00:00Z",
    count: 1079,
  },
  {
    time: "2023-06-22T00:00:00Z",
    count: 1073,
  },
  {
    time: "2023-06-21T00:00:00Z",
    count: 964,
  },
  {
    time: "2023-06-20T00:00:00Z",
    count: 962,
  },
  {
    time: "2023-06-19T00:00:00Z",
    count: 1010,
  },
  {
    time: "2023-06-18T00:00:00Z",
    count: 1123,
  },
  {
    time: "2023-06-17T00:00:00Z",
    count: 1215,
  },
  {
    time: "2023-06-16T00:00:00Z",
    count: 965,
  },
  {
    time: "2023-06-15T00:00:00Z",
    count: 965,
  },
  {
    time: "2023-06-14T00:00:00Z",
    count: 1189,
  },
  {
    time: "2023-06-13T00:00:00Z",
    count: 1050,
  },
  {
    time: "2023-06-12T00:00:00Z",
    count: 1239,
  },
  {
    time: "2023-06-11T00:00:00Z",
    count: 1304,
  },
  {
    time: "2023-06-10T00:00:00Z",
    count: 2004,
  },
  {
    time: "2023-06-09T00:00:00Z",
    count: 1246,
  },
  {
    time: "2023-06-08T00:00:00Z",
    count: 1130,
  },
  {
    time: "2023-06-07T00:00:00Z",
    count: 1136,
  },
  {
    time: "2023-06-06T00:00:00Z",
    count: 1165,
  },
  {
    time: "2023-06-05T00:00:00Z",
    count: 1000,
  },
  {
    time: "2023-06-04T00:00:00Z",
    count: 1126,
  },
  {
    time: "2023-06-03T00:00:00Z",
    count: 1279,
  },
  {
    time: "2023-06-02T00:00:00Z",
    count: 1122,
  },
  {
    time: "2023-06-01T00:00:00Z",
    count: 88,
  },
  {
    time: "2023-05-31T20:26:20.505228728Z",
    count: 2981,
  },
  {
    time: "2023-05-30T00:00:00Z",
    count: 1276,
  },
  {
    time: "2023-05-29T00:00:00Z",
    count: 1214,
  },
  {
    time: "2023-05-28T00:00:00Z",
    count: 979,
  },
  {
    time: "2023-05-27T00:00:00Z",
    count: 943,
  },
  {
    time: "2023-05-26T00:00:00Z",
    count: 1282,
  },
  {
    time: "2023-05-25T00:00:00Z",
    count: 925,
  },
  {
    time: "2023-05-24T00:00:00Z",
    count: 1132,
  },
  {
    time: "2023-05-23T00:00:00Z",
    count: 1079,
  },
  {
    time: "2023-05-22T00:00:00Z",
    count: 1073,
  },
  {
    time: "2023-05-21T00:00:00Z",
    count: 964,
  },
  {
    time: "2023-05-20T00:00:00Z",
    count: 962,
  },
  {
    time: "2023-05-19T00:00:00Z",
    count: 1010,
  },
  {
    time: "2023-05-18T00:00:00Z",
    count: 1123,
  },
  {
    time: "2023-05-17T00:00:00Z",
    count: 1215,
  },
  {
    time: "2023-05-16T00:00:00Z",
    count: 965,
  },
  {
    time: "2023-05-15T00:00:00Z",
    count: 965,
  },
  {
    time: "2023-05-14T00:00:00Z",
    count: 1189,
  },
  {
    time: "2023-05-13T00:00:00Z",
    count: 1050,
  },
  {
    time: "2023-05-12T00:00:00Z",
    count: 1239,
  },
  {
    time: "2023-05-11T00:00:00Z",
    count: 1304,
  },
  {
    time: "2023-05-10T00:00:00Z",
    count: 2004,
  },
  {
    time: "2023-05-09T00:00:00Z",
    count: 1246,
  },
  {
    time: "2023-05-08T00:00:00Z",
    count: 1130,
  },
  {
    time: "2023-05-07T00:00:00Z",
    count: 1136,
  },
  {
    time: "2023-05-06T00:00:00Z",
    count: 1165,
  },
  {
    time: "2023-05-05T00:00:00Z",
    count: 1000,
  },
  {
    time: "2023-05-04T00:00:00Z",
    count: 1126,
  },
  {
    time: "2023-05-03T00:00:00Z",
    count: 1279,
  },
  {
    time: "2023-05-02T00:00:00Z",
    count: 1122,
  },
  {
    time: "2023-05-01T00:00:00Z",
    count: 88,
  },
];

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
    /* TODO delete range !== "3-month" when api is ready */
    if (!data && range !== "3-month") return;

    /* TODO delete data3Months when api is ready */
    const responseReversed = range !== "3-month" ? [...data].reverse() : [...data3Months].reverse();
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

        if (range === "month" || range === "3-month") {
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
          {/* TODO delete range !== "3-month" when api is ready  */}
          {range !== "3-month" && isError ? (
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
                    zoom: { enabled: true },
                    toolbar: {
                      show: true,
                      tools: {
                        download: false,
                        selection: false,
                        zoom: false,
                        zoomin: range === "3-month",
                        zoomout: range === "3-month",
                        pan: range === "3-month",
                        reset: false,
                      },
                    },
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
