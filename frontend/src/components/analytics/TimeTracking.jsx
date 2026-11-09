import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#38bdf8', '#8b5cf6'];

const TimeTracking = ({ timeData }) => {
  const { isDark } = useTheme();
  const textColor = isDark ? '#a5b4c7' : '#64748b';
  const values = timeData?.values || [];
  const total = values.reduce((sum, value) => sum + (Number(value) || 0), 0);

  const data = useMemo(
    () => ({
      labels: timeData?.labels || [],
      datasets: [
        {
          data: values,
          backgroundColor: PALETTE.map((color) => `${color}cc`),
          borderColor: PALETTE,
          borderWidth: 1,
          hoverOffset: 6,
        },
      ],
    }),
    [timeData, values]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            boxWidth: 7,
            boxHeight: 7,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 12,
            font: { size: 9, family: 'Inter' },
          },
        },
        title: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#111a2e' : '#0f172a',
          padding: 10,
          cornerRadius: 8,
          bodyFont: { size: 11, family: 'Inter' },
        },
      },
    }),
    [isDark, textColor]
  );

  if (total === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
        <p className="text-sm font-medium text-content">Nothing to chart yet</p>
        <p className="max-w-[15rem] text-xs text-content-muted">
          Add a few tasks and the distribution will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-12">
        <p className="font-display text-xl font-bold text-content">{total}</p>
        <p className="text-[0.62rem] uppercase tracking-[0.1em] text-content-subtle">items</p>
      </div>
    </div>
  );
};

export default TimeTracking;
