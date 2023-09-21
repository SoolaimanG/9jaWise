import { useStore } from "@/provider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export type chartProps = {
  thisWeek: { day: string; amount: number }[];
};

const Chart = (props: chartProps) => {
  const { is_darkmode } = useStore();
  const { thisWeek } = props;

  // Filter the data to include only Monday to Friday
  const filteredData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "THIS-WEEK",
        color: "#252525",
        data: thisWeek.map((l) => l.amount),
        backgroundColor: "#7609f8",
        borderRadius: 20,
        callback: function () {
          console.log(this);
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: is_darkmode ? "#d1d5db" : "#334155",
          callback: function (value: number) {
            return value > 1000 ? value / 1000 + "K" : value;
          },
        },
        border: {
          color: is_darkmode ? "#d1d5db" : "#334155",
        },
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          drawOnChartArea: false,
          drawBorder: false,
        },
        ticks: {
          color: is_darkmode ? "#d1d5db" : "#334155",
        },
        border: {
          color: is_darkmode ? "#d1d5db" : "#334155",
        },
      },
    },
  };

  //@ts-ignore
  return <Bar options={options} data={filteredData} />;
};

export default Chart;
