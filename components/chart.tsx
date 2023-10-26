"use client";

import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
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
import SlideIn from "./Animations/slideIn";
import FadeIn from "./Animations/fadeIn";

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

  const total_amount = thisWeek.reduce((acc, curr) => {
    return acc + curr.amount;
  }, 0);

  const amount_in_naira = useNairaFormatter(total_amount);

  // Filter the data to include only Monday to Friday
  const filteredData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
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
    aspectRatio: 1.5,
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

  return (
    <FadeIn className="w-full p-2 mt-5 rounded-md dark:bg-slate-900 bg-gray-100 h-[30rem]">
      <Bar
        //@ts-ignore
        options={options}
        data={filteredData}
      />
      <SlideIn className="text-center mt-3 wordGradient md:text-[1.1rem] sm:text-base text-2xl">
        TOTAL TRANSACTIONS THIS WEEK: <strong>{amount_in_naira}</strong>
      </SlideIn>
    </FadeIn>
  );
};

export default Chart;
