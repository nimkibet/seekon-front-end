import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Color palette matching the task requirements
const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const CategoryChart = ({ categoryData }) => {
  const data = {
    labels: categoryData.map(item => item.name),
    datasets: [
      {
        data: categoryData.map(item => item.value),
        backgroundColor: COLORS.map(color => `${color}CC`), // Add transparency
        borderColor: COLORS,
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00A676',
        borderWidth: 1,
        cornerRadius: 8,
      }
    }
  };

  return <Doughnut data={data} options={options} />;
};

export default CategoryChart;


