import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useTheme } from '@contexts/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const ACCENT_HEX = {
  indigo: ['#6366f1', '#8b5cf6'],
  ocean: ['#06b6d4', '#38bdf8'],
  emerald: ['#10b981', '#84cc16'],
  sunset: ['#f97316', '#f43f5e'],
  rose: ['#f43f5e', '#d946ef'],
  amber: ['#f59e0b', '#f97316'],
};

const ProductivityChart = ({ data, title }) => {
  const { accent, isDark } = useTheme();
  const [primary, secondary] = ACCENT_HEX[accent] || ACCENT_HEX.indigo;

  const gridColor = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.22)';
  const textColor = isDark ? '#a5b4c7' : '#64748b';

  const chartData = useMemo(
    () => ({
      labels: data?.labels || [],
      datasets: [
        {
          label: 'Completed',
          data: data?.completed || [],
          borderColor: primary,
          backgroundColor: `${primary}22`,
          pointBackgroundColor: primary,
          pointRadius: 2.5,
          pointHoverRadius: 4,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Created',
          data: data?.created || [],
          borderColor: secondary,
          backgroundColor: `${secondary}18`,
          pointBackgroundColor: secondary,
          pointRadius: 2,
          borderDash: [4, 4],
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    }),
    [data, primary, secondary]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: textColor,
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 10, family: 'Inter' },
          },
        },
        title: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#111a2e' : '#0f172a',
          padding: 10,
          cornerRadius: 8,
          titleFont: { size: 11, family: 'Inter' },
          bodyFont: { size: 11, family: 'Inter' },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 9 }, maxRotation: 0, autoSkipPadding: 12 },
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          border: { display: false },
          ticks: { color: textColor, font: { size: 9 }, precision: 0, stepSize: 1 },
        },
      },
    }),
    [isDark, textColor, gridColor]
  );

  return (
    <div className="relative h-full">
      {title && <p className="mb-2 text-xs font-semibold text-content-muted">{title}</p>}
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProductivityChart;
