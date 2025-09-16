import React, { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartJS } from "chart.js";
import type { ChartConfiguration } from "chart.js";

interface AlpacaBar {
  c: number;
  h: number;
  l: number;
  n: number;
  o: number;
  t: string;
  v: number;
  vw: number;
}

interface AMRNChartMiniProps {
  stockData: { data?: { bars?: { [key: string]: { [key: string]: AlpacaBar[] } } } } | null;
  symbol: string;
}

const AMRNChartMini: React.FC<AMRNChartMiniProps> = ({ stockData, symbol }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS<
    "line",
    (number | null)[],
    string
  > | null>(null);

  const bars: AlpacaBar[] | undefined = stockData?.data?.bars?.[symbol]?.[symbol];

  const labels = useMemo(() => bars?.map((bar) => new Date(bar.t).toLocaleTimeString()) ?? [], [bars]);
  const closingPrices = useMemo(() => bars?.map((bar) => bar.c) ?? [], [bars]);

  useEffect(() => {
    if (!bars || bars.length === 0) return;
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config: ChartConfiguration<"line", (number | null)[], string> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: undefined,
            data: closingPrices,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.08)",
            pointRadius: 0,
            tension: 0.2,
            fill: true,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          title: { display: false, text: "" },
          tooltip: { enabled: false },
        },
        scales: {
          x: { display: false },
          y: { display: false },
        },
        elements: {
          line: { borderJoinStyle: "round" },
        },
      },
      plugins: [],
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [labels, closingPrices, symbol, bars]);

  if (!bars || bars.length === 0) {
    return (
      <div className="flex justify-center items-center h-8">
        <p className="text-gray-500 text-xs">No chart</p>
      </div>
    );
  }

  return (
    <div style={{ width: 120, height: 32 }}>
      <canvas ref={chartRef} height={32} width={120}></canvas>
    </div>
  );
};

export default AMRNChartMini; 