import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useMemo, useRef } from 'react';
import { useI18n } from '../i18n';
import { formatTime } from '../utils/constants';

ChartJS.register(
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

export default function SolutionChart({ solution, targetPower, batteryCapacity, hideHoverDetails = false }) {
  const { t } = useI18n();
  const chartRef = useRef(null);
  const interactionRef = useRef({
    dragging: false,
    lastClientX: 0,
    pinchDistance: 0,
  });

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
  let burnStateData = solution.burnStateLog || [];

  if (batteryData.length > 500) {
    const step = Math.ceil(batteryData.length / 500);
    batteryData = batteryData.filter((_, i) => i % step === 0);
    powerData = powerData.filter((_, i) => i % step === 0);
    burnStateData = burnStateData.map(series => series.filter((_, i) => i % step === 0));
  }

  const pointCount = batteryData.length;
  const maxX = Math.max(0, pointCount - 1);
  const minVisibleSpan = Math.min(20, maxX + 1);
  const secondsPerPoint = solution?.period > 0 && pointCount > 1 ? solution.period / (pointCount - 1) : 1;
  const xValues = batteryData.map((_, i) => i);
  // 限制电池百分比在 0-100 范围内
  const batteryPercent = batteryData.map(v => Math.min(100, Math.max(0, (v / batteryCapacity) * 100)));
  const powerPoints = xValues.map((x, i) => ({ x, y: powerData[i] ?? null }));
  const targetPoints = xValues.map((x) => ({ x, y: targetPower }));
  const batteryPoints = xValues.map((x, i) => ({ x, y: batteryPercent[i] }));
  const burnStateDatasets = burnStateData.map((series, idx) => ({
    label: `${t('branch')} ${idx + 1} ${t('burnStateShort')}`,
    data: xValues.map((x, i) => ({ x, y: series[i] > 0 ? idx + 1 : null })),
    borderColor: '#ff9f43',
    backgroundColor: 'rgba(255, 159, 67, 0.15)',
    borderWidth: 2,
    pointRadius: 0,
    fill: false,
    stepped: true,
    spanGaps: false,
    yAxisID: 'y2',
  }));

  const data = useMemo(() => ({
    datasets: [
      {
        label: t('currentPower'),
        data: powerPoints,
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
        data: targetPoints,
        borderColor: '#ff6b6b',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        yAxisID: 'y',
      },
      {
        label: t('batteryLevel'),
        data: batteryPoints,
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.05)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: true,
        tension: 0.1,
        yAxisID: 'y1',
      },
      ...burnStateDatasets,
    ]
  }), [t, powerPoints, targetPoints, batteryPoints, burnStateDatasets]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: hideHoverDetails ? 'nearest' : 'index',
      intersect: hideHoverDetails,
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
        enabled: !hideHoverDetails,
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
            if (context.dataset.yAxisID === 'y1') {
              return `${label}: ${value.toFixed(1)}%`;
            }
            if (context.dataset.yAxisID === 'y2') {
              return value ? `${label}: ${t('stateOn')}` : `${label}: ${t('stateOff')}`;
            }
            return `${label}: ${Math.round(value)}w`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        display: true,
        min: 0,
        max: maxX,
        grid: { color: '#1a1a1a' },
        ticks: {
          color: '#888888',
          font: { family: fontFamily, size: 11 },
          maxTicksLimit: 6,
          callback: (value) => formatTime(Math.max(0, Number(value) * secondsPerPoint)),
        },
      },
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
      y2: {
        type: 'linear',
        display: false,
        position: 'right',
        offset: true,
        grid: { drawOnChartArea: false },
        ticks: { display: false },
        title: { display: false },
        min: 0,
        max: Math.max(1, burnStateDatasets.length + 0.5),
      },
    }
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const xOptions = chart.options?.scales?.x;
    if (!xOptions) return;

    xOptions.min = 0;
    xOptions.max = maxX;
    chart.update('none');
  }, [pointCount, maxX]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || maxX <= 0) return undefined;

    const canvas = chart.canvas;
    canvas.style.touchAction = 'none';

    const clampRange = (min, max) => {
      const fullMin = 0;
      const fullMax = maxX;
      const fullSpan = fullMax - fullMin;
      let nextMin = min;
      let nextMax = max;
      let span = nextMax - nextMin;

      if (span < Math.min(minVisibleSpan, fullSpan || 1)) {
        span = Math.min(minVisibleSpan, fullSpan || 1);
        const center = (nextMin + nextMax) / 2;
        nextMin = center - span / 2;
        nextMax = center + span / 2;
      }

      if (nextMin < fullMin) {
        nextMax += fullMin - nextMin;
        nextMin = fullMin;
      }
      if (nextMax > fullMax) {
        nextMin -= nextMax - fullMax;
        nextMax = fullMax;
      }

      if (fullSpan <= 0) return { min: fullMin, max: fullMax };
      return { min: Math.max(fullMin, nextMin), max: Math.min(fullMax, nextMax) };
    };

    const getCurrentRange = () => {
      const xScale = chart.scales.x;
      const min = Number.isFinite(xScale?.min) ? xScale.min : 0;
      const max = Number.isFinite(xScale?.max) ? xScale.max : maxX;
      return { min, max };
    };

    const applyRange = (min, max) => {
      const next = clampRange(min, max);
      const xOptions = chart.options?.scales?.x;
      if (!xOptions) return;
      xOptions.min = next.min;
      xOptions.max = next.max;
      chart.update('none');
    };

    const zoomAtClientX = (clientX, factor) => {
      const xScale = chart.scales.x;
      if (!xScale) return;
      const rect = canvas.getBoundingClientRect();
      const pixelX = clientX - rect.left;
      const centerValue = xScale.getValueForPixel(pixelX);
      if (!Number.isFinite(centerValue)) return;

      const { min, max } = getCurrentRange();
      const span = Math.max(1, max - min);
      const nextSpan = Math.max(Math.min(minVisibleSpan, maxX || 1), span * factor);
      const ratio = (centerValue - min) / span;
      const nextMin = centerValue - ratio * nextSpan;
      const nextMax = nextMin + nextSpan;
      applyRange(nextMin, nextMax);
    };

    const panByPixels = (deltaPixels) => {
      const xScale = chart.scales.x;
      if (!xScale) return;
      const { min, max } = getCurrentRange();
      const span = Math.max(1, max - min);
      const pxSpan = Math.max(1, xScale.right - xScale.left);
      const deltaX = (deltaPixels / pxSpan) * span;
      applyRange(min + deltaX, max + deltaX);
    };

    const onWheel = (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 0.9 : 1.1;
      zoomAtClientX(event.clientX, factor);
    };

    const onMouseDown = (event) => {
      interactionRef.current.dragging = true;
      interactionRef.current.lastClientX = event.clientX;
    };

    const onMouseMove = (event) => {
      if (!interactionRef.current.dragging) return;
      event.preventDefault();
      const delta = interactionRef.current.lastClientX - event.clientX;
      interactionRef.current.lastClientX = event.clientX;
      panByPixels(delta);
    };

    const stopMouseDrag = () => {
      interactionRef.current.dragging = false;
    };

    const onTouchStart = (event) => {
      if (event.touches.length === 1) {
        interactionRef.current.dragging = true;
        interactionRef.current.lastClientX = event.touches[0].clientX;
        interactionRef.current.pinchDistance = 0;
      } else if (event.touches.length === 2) {
        const [a, b] = event.touches;
        interactionRef.current.dragging = false;
        interactionRef.current.pinchDistance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      }
    };

    const onTouchMove = (event) => {
      event.preventDefault();

      if (event.touches.length === 1 && interactionRef.current.dragging) {
        const clientX = event.touches[0].clientX;
        const delta = interactionRef.current.lastClientX - clientX;
        interactionRef.current.lastClientX = clientX;
        panByPixels(delta);
        return;
      }

      if (event.touches.length === 2) {
        const [a, b] = event.touches;
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const centerX = (a.clientX + b.clientX) / 2;

        if (interactionRef.current.pinchDistance > 0) {
          const factor = interactionRef.current.pinchDistance / distance;
          zoomAtClientX(centerX, factor);
        }
        interactionRef.current.pinchDistance = distance;
      }
    };

    const onTouchEnd = (event) => {
      if (event.touches.length === 0) {
        interactionRef.current.dragging = false;
        interactionRef.current.pinchDistance = 0;
      } else if (event.touches.length === 1) {
        interactionRef.current.dragging = true;
        interactionRef.current.lastClientX = event.touches[0].clientX;
        interactionRef.current.pinchDistance = 0;
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopMouseDrag);
    canvas.addEventListener('mouseleave', stopMouseDrag);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopMouseDrag);
      canvas.removeEventListener('mouseleave', stopMouseDrag);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [maxX, minVisibleSpan]);

  return (
    <div className="h-44 sm:h-56">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
