import ApexChart from "react-apexcharts";
import { ChainId, VAACount } from "@xlabs-libs/wormscan-sdk";

const chartColors = [
  "#5c30d8",
  "#7c4dff",
  "#7351d1",
  "#9877f4",
  "#8c96c6",
  "#9ebcda",
  "#bfd3e6",
  "#79afda",
  "#64b5f6",
  "#1c7fce",
  "#075b9e",
  "#004175",
];

type Props = {
  chartData: VAACount[];
};

export function Chart({ chartData }: Props) {
  return (
    <ApexChart
      series={[{ data: chartData.map((a: VAACount) => ({ x: ChainId[a.chainId], y: a.count })) }]}
      options={{
        chart: {
          type: "treemap",
          toolbar: {
            show: false,
          },
        },
        colors: chartColors,
        title: { text: "" },
        plotOptions: {
          treemap: {
            useFillColorAsStroke: true,
            distributed: true,
            enableShades: false,
          },
        },
        states: {
          hover: {
            filter: {
              type: "darken",
              value: 0.9,
            },
          },
          active: {
            filter: {
              type: "none",
              value: 0,
            },
          },
        },
      }}
      type="treemap"
      height={450}
      width={"100%"}
    />
  );
}
