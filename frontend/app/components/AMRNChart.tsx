import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartJS } from "chart.js";
import type { ChartConfiguration } from "chart.js";

const AMRNChart: React.FC<any> = ({ stockData }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS<
    "line",
    (number | null)[],
    string
  > | null>(null);

  // Validate that we have the required data structure
  if (!stockData?.data?.chart?.result?.[0]) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No chart data available for this time range</p>
      </div>
    );
  }

  const chartResult = stockData.data.chart.result[0];
  const timestamps = chartResult.timestamp;
  const closingPrices = chartResult.indicators.quote[0]
    .close as (number | null)[];

  // Additional validation for required arrays
  if (!timestamps || !closingPrices || timestamps.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Invalid chart data structure</p>
      </div>
    );
  }

  const labels = timestamps.map((ts:any) => new Date(ts * 1000).toLocaleString());

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const verticalLinePlugin = {
      id: "verticalLinePlugin",
      beforeEvent: (chart: any, args: any) => {
        const { event } = args;
        if (event.type === 'mousemove') {
          const { chartArea } = chart;
          if (chartArea) {
            if (
              event.x >= chartArea.left &&
              event.x <= chartArea.right &&
              event.y >= chartArea.top &&
              event.y <= chartArea.bottom
            ) {
              chart._cachedCrosshairX = event.x;
            } else {
              chart._cachedCrosshairX = null;
            }
          }
        } else if (event.type === 'mouseout') {
          chart._cachedCrosshairX = null;
        }
      },
      afterDraw: (chart: any) => {
        const x = chart._cachedCrosshairX;
        const { ctx, chartArea } = chart;

        if (x != null && chartArea) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, chartArea.top);
          ctx.lineTo(x, chartArea.bottom);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(0,0,0,0.5)";
          ctx.stroke();
          ctx.restore();
        }
      },
    };

    const config: ChartConfiguration<"line", (number | null)[], string> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${chartResult.meta.symbol} Closing Price`,
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
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                const idx = tooltipItems[0].dataIndex;
                return labels[idx];
              },
            },
          },
          title: {
            display: true,
            text: `${chartResult.meta.symbol} Closing Prices Over Time`,
          },
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            display: false,
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
      plugins: [verticalLinePlugin],
    };

    chartInstance.current = new Chart(ctx, config);

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [labels, closingPrices, chartResult.meta.symbol]);

  return (
    <div>
      <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default AMRNChart;
