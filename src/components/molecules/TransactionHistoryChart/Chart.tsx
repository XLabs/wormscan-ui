import { useState } from "react";
import ReactApexChart from "react-apexcharts";

type Props = { data: any };

export const Chart = ({ data }: Props) => {
  const filteredData = data;
  const [chartData] = useState(filteredData);

  console.log("chartData", chartData);

  return (
    <div className="trans-history-chart">
      <ReactApexChart
        type="area"
        height={200}
        series={[
          {
            name: "Test",
            data: chartData,
          },
        ]}
        options={{
          fill: {
            type: "gradient",
            gradient: {
              type: "vertical",
              inverseColors: false,
              opacityFrom: 1,
              opacityTo: 0,
              // shade: "dark",
              shadeIntensity: 1,
              colorStops: [],
              gradientToColors: ["#28DFDF"],
            },
          },
          labels: [
            "0:00",
            "2:00",
            "4:00",
            "6:00",
            "8:00",
            "10:00",
            "12:00",
            "14:00",
            "16:00",
            "18:00",
            "20:00",
            "22:00",
          ],
          chart: {
            zoom: { enabled: false },
            toolbar: { show: false },
          },
          grid: {
            position: "back",
            show: false,
          },
          tooltip: { enabled: false },
          stroke: {
            curve: "smooth",
            width: 2,
            colors: ["#28DFDF"],
          },
          dataLabels: { enabled: false },
        }}
      />
    </div>
  );
};
