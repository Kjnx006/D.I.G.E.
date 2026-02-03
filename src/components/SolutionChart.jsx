import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useI18n } from '../i18n';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 全局字体配置
const fontFamily = "'JetBrains Mono', ui-monospace, monospace";

export default function SolutionChart({ solution, targetPower, batteryCapacity }) {
  const { t } = useI18n();

  if (!solution || !solution.batteryLog || solution.batteryLog.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-endfield-text text-sm">
        {t('noChartData')}
      </div>
    );
  }

  // 采样数据以提高性能
  let batteryData = solution.batteryLog;
  let powerData = solution.powerLog || [];
  
  if (batteryData.length > 500) {
    const step = Math.ceil(batteryData.length / 500);
    batteryData = batteryData.filter((_, i) => i % step === 0);
    powerData = powerData.filter((_, i) => i % step === 0);
  }

  const labels = batteryData.map((_, i) => i);
  // 限制电池百分比在 0-100 范围内
  const batteryPercent = batteryData.map(v => Math.min(100, Math.max(0, (v / batteryCapacity) * 100)));

  const data = {
    labels,
    datasets: [
      {
        label: t('currentPower'),
        data: powerData,
        borderColor: '#d4ff00',
        backgroundColor: 'rgba(212, 255, 0, 0.05)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: true,
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: t('targetPowerLine'),
        data: new Array(batteryData.length).fill(targetPower),
        borderColor: '#ff6b6b',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        yAxisID: 'y',
      },
      {
        label: t('batteryLevel'),
        data: batteryPercent,
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.05)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: true,
        tension: 0.1,
        yAxisID: 'y1',
      },
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'start',
        labels: {
          color: '#666666',
          font: { family: fontFamily, size: 12 },
          boxWidth: 12,
          boxHeight: 12,
          padding: 10,
        }
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#888888',
        bodyColor: '#cccccc',
        borderColor: '#333333',
        borderWidth: 1,
        titleFont: { family: fontFamily, size: 12 },
        bodyFont: { family: fontFamily, size: 12 },
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (context.datasetIndex === 2) {
              return `${label}: ${value.toFixed(1)}%`;
            }
            return `${label}: ${Math.round(value)}w`;
          }
        }
      }
    },
    scales: {
      x: { display: false },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: '#1a1a1a' },
        ticks: { 
          color: '#d4ff00', 
          font: { family: fontFamily, size: 12 },
          maxTicksLimit: 5,
        },
        title: {
          display: true,
          text: t('powerAxis') + ' (w)',
          color: '#d4ff00',
          font: { family: fontFamily, size: 12 },
        },
        min: 0,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { 
          color: '#4ecdc4', 
          font: { family: fontFamily, size: 12 },
          callback: (value) => value + '%',
          maxTicksLimit: 5,
        },
        title: {
          display: true,
          text: t('batteryAxis') + ' (%)',
          color: '#4ecdc4',
          font: { family: fontFamily, size: 12 },
        },
        min: 0,
        max: 100,
      },
    }
  };

  return (
    <div className="h-36 sm:h-48">
      <Line data={data} options={options} />
    </div>
  );
}
