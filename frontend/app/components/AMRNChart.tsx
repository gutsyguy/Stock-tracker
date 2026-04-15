import React, { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartJS } from "chart.js";

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

interface AMRNChartProps {
  stockData: { data?: { bars?: { [key: string]: AlpacaBar[] } } } | null;
  symbol: string;
  livePrice?: number | null;
  onHoverData?: (price: number | null, label: string | null) => void;
  height?: number;
  width?: string | number;
}

const AMRNChart: React.FC<AMRNChartProps> = ({ 
  stockData, 
  symbol, 
  livePrice, 
  onHoverData, 
  height = 300, 
  width = "100%" 
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  const bars = useMemo(() => stockData?.data?.bars?.[symbol] ?? [], [stockData, symbol]);
  const labels = useMemo(() => bars.map((bar: AlpacaBar) => {
    return new Date(bar.t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }), [bars]);
  const baseClosingPrices = useMemo(() => bars.map((bar: AlpacaBar) => bar.c), [bars]);

  // Main chart initialization
  useEffect(() => {
    if (!bars.length) return;

    if (chartInstance.current) chartInstance.current.destroy();

    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const closingPrices = [...baseClosingPrices];
    
    // Inject the livePrice cleanly if passing one in right at the start
    if (livePrice) {
      closingPrices[closingPrices.length - 1] = livePrice;
    }

    const firstPrice = closingPrices[0] || 0;
    const lastPrice = closingPrices[closingPrices.length - 1] || 0;
    const isPositive = lastPrice >= firstPrice;
    const themeColor = isPositive ? "#00C805" : "#FF5000";

    const verticalLinePlugin = { 
      id: "verticalLinePlugin", 
      beforeEvent: (chart: any, args: any) => { 
        const { event } = args; 
        if (event.type === 'mousemove') { 
          const { chartArea } = chart; 
          if (chartArea) { 
            if (event.x >= chartArea.left && event.x <= chartArea.right && event.y >= chartArea.top && event.y <= chartArea.bottom) { 
              chart._cachedCrosshairX = event.x; 
            } else { 
              chart._cachedCrosshairX = undefined; 
            } 
          } 
        } else if (event.type === 'mouseout') { 
          chart._cachedCrosshairX = undefined; 
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
          ctx.strokeStyle = "rgba(100,100,100,0.3)"; 
          ctx.stroke(); 
          ctx.restore(); 
        } 
      }, 
    };

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${symbol} Closing Price`,
            data: closingPrices,
            borderColor: themeColor,
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: themeColor,
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 2,
            tension: 0.1,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 20, bottom: 20 }
        },
        interaction: { mode: "index", intersect: false },
        plugins: {
          tooltip: {
            enabled: false, // Turn off giant blocking hover tooltip
            external: (context) => {
              if (!onHoverData) return;
              if (context.tooltip.opacity === 0) {
                onHoverData(null, null); // Mouse out
                return;
              }
              const dataPoint = context.tooltip.dataPoints[0];
              if (dataPoint) {
                onHoverData(dataPoint.raw as number, dataPoint.label);
              }
            }
          },
          title: { display: false },
          legend: { display: false },
        },
        scales: {
          x: { 
            display: false, 
            grid: { display: false } 
          },
          y: { 
            display: false, 
            grid: { display: false } 
          },
        },
      },
      plugins: [verticalLinePlugin],
    });

    return () => {
      chartInstance.current?.destroy();
      chartInstance.current = null;
    };
  }, [bars, labels, baseClosingPrices, symbol]); // Intentionally omitting `onHoverPrice` and `livePrice` from full rebuild array

  // Fast Update Hook for purely real-time lines without tearing down Chart canvas
  useEffect(() => {
    if (!chartInstance.current || !livePrice) return;
    
    const chart = chartInstance.current;
    if (!chart.data.datasets || chart.data.datasets.length === 0) return;
    
    const dataArray = chart.data.datasets[0].data as number[];
    if (dataArray.length === 0) return;

    dataArray[dataArray.length - 1] = livePrice;

    const firstPrice = dataArray[0] || 0;
    const isPositive = livePrice >= firstPrice;
    
    // Smooth transition between colors
    chart.data.datasets[0].borderColor = isPositive ? "#00C805" : "#FF5000";
    (chart.data.datasets[0] as any).pointHoverBackgroundColor = isPositive ? "#00C805" : "#FF5000";

    chart.update('none'); // Update elegantly without animation jumps
  }, [livePrice]);


  return (
    <div style={{ width, height, margin: "0 auto", position: 'relative' }}>
      {bars.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">No chart data available for this time range</p>
        </div>
      ) : (
        <canvas ref={chartRef} style={{ height: "100%", width: "100%" }}></canvas>
      )}
    </div>
  );
};

export default React.memo(AMRNChart);