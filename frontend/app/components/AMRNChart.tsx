import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartJS } from "chart.js";
import { AMRNChartProps, StockData } from "../interfaces/types";

const AMRNChart: React.FC<AMRNChartProps> = ({ stockData }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS<"line"> | null>(null);

  const timestamps = stockData.data.chart.result[0].timestamp;

  const closingPrices =
    stockData.data.chart.result[0].indicators.quote[0].close;

  const labels = timestamps.map(
    (ts) => new Date(ts * 1000).toISOString().split("T")[0]
  );

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${stockData.data.chart.result[0].meta.symbol} Closing Price`,
            data: closingPrices,
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.1)",
            pointRadius: 3,
            tension: 0.2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${stockData.data.chart.result[0].meta.symbol} Closing Prices Over Time`,
          },
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            title: {
              display: true,
              text: "Price (USD)",
            },
          },
        },
      },
    });
  }, [labels, closingPrices]);

  return (
    <div>
      <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default AMRNChart;
