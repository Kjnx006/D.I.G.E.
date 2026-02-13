import { useState, useRef, useCallback } from 'react';
import { useI18n } from '../i18n';
import { CONSTANTS } from '../utils/constants';
import Icon from './Icon';

// 可拖拽的电路分支组件
function DraggableBranch({ branch, idx, t }) {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const containerRef = useRef(null);

  // 鼠标事件
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart(e.clientX + scrollLeft);
    e.preventDefault();
  }, [scrollLeft]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const newScrollLeft = dragStart - e.clientX;
    containerRef.current.scrollLeft = Math.max(0, newScrollLeft);
    setScrollLeft(Math.max(0, newScrollLeft));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 触摸事件
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart(touch.clientX + scrollLeft);
  }, [scrollLeft]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const touch = e.touches[0];
    const newScrollLeft = dragStart - touch.clientX;
    containerRef.current.scrollLeft = Math.max(0, newScrollLeft);
    setScrollLeft(Math.max(0, newScrollLeft));
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const { denominator, power } = branch;
  
  let d = denominator;
  let steps = [];
  while (d % 3 === 0) { steps.push(3); d /= 3; }
  while (d % 2 === 0) { steps.push(2); d /= 2; }
  steps.sort((a, b) => b - a);

  // 渲染分流器
  const renderSplitter = (type, stepIdx) => {
    const isTwoWay = type === 2;
    
    return (
      <div key={stepIdx} className="flex items-center gap-1 shrink-0">
        <div className={`relative px-1.5 sm:px-2 py-1 sm:py-1.5 border text-center min-w-[40px] sm:min-w-[50px] ${
          isTwoWay 
            ? 'bg-endfield-gray border-endfield-yellow/30 text-endfield-yellow' 
            : 'bg-endfield-gray border-endfield-text-light/20 text-endfield-text-light'
        }`}>
          <div className="text-xs uppercase font-bold">
            {isTwoWay ? '2' : '3'}{t('waySplit')}
          </div>
          {/* 上方回收 */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-px h-2 bg-endfield-text/40"></div>
            <div className="text-xs text-endfield-text/60 whitespace-nowrap px-1 bg-endfield-dark border border-endfield-gray-light">
              {t('storageShort')}
            </div>
          </div>
          {/* 三分器下方回收 */}
          {!isTwoWay && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="text-xs text-endfield-text/60 whitespace-nowrap px-1 bg-endfield-dark border border-endfield-gray-light">
                {t('storageShort')}
              </div>
              <div className="w-px h-2 bg-endfield-text/40"></div>
            </div>
          )}
        </div>
        <Icon name="arrow_right_alt" className="text-endfield-text/50 shrink-0" />
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-2">
      {/* 分支标签 - 固定 */}
      <div className="shrink-0 w-16 text-center">
        <div className="text-sm text-endfield-yellow font-bold">1/{denominator}</div>
        <div className="text-xs text-endfield-text">{power.toFixed(0)}w</div>
      </div>

      {/* 可拖拽的电路区域 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-visible scrollbar-hide py-4 sm:py-5 touch-pan-x"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-1 w-max">
          {/* 输入 */}
          <div className="w-8 h-8 bg-endfield-gray border border-endfield-gray-light flex items-center justify-center text-endfield-text shrink-0">
            <Icon name="input" />
          </div>
          <Icon name="arrow_right_alt" className="text-endfield-text/50 shrink-0" />

          {/* 分流器序列 */}
          {steps.map((type, stepIdx) => renderSplitter(type, stepIdx))}

          {/* 发电机 */}
          <div className="h-8 px-2.5 bg-endfield-yellow/10 border border-endfield-yellow/50 flex items-center gap-1 text-endfield-yellow shrink-0">
            <Icon name="bolt" />
            <span className="text-sm font-bold uppercase">{t('gen')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolutionDiagram({ solution }) {
  const { t, locale } = useI18n();

  if (!solution) {
    return (
      <div className="h-32 flex items-center justify-center text-endfield-text text-sm">
        {t('noSolutionData')}
      </div>
    );
  }

  const getFuelName = (fuel) => {
    if (!fuel) return '-';
    return fuel.name[locale] || fuel.name.en;
  };

  const { baseConfig, baseFuel, oscillating, oscillatingFuel, inputSourceId } = solution;
  const showPackerWarning = inputSourceId === 'packer';
  
  // 基础发电使用主燃料
  const baseFuelData = baseFuel || solution.fuel;
  // 震荡发电燃料
  const oscFuelData = oscillatingFuel || solution.fuel;

  return (
    <div className="space-y-2 sm:space-y-3 notranslate" translate="no">
      {/* 警告 */}
      <div className="p-2.5 bg-red-900/20 border border-red-900/50 text-sm text-red-300 flex items-center gap-2">
        <Icon name="warning" />
        <span>{t('storageBoxWarningShort')}</span>
      </div>
      {showPackerWarning && (
        <div className="p-2.5 bg-red-900/20 border border-red-900/50 text-sm text-red-300 flex items-center gap-2">
          <Icon name="warning" />
          <span>{t('inputWarningPacker')}</span>
        </div>
      )}

      {/* 基础发电 - 静态显示 */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-endfield-gray border border-endfield-gray-light">
        <Icon name="factory" className="text-endfield-yellow" />
        <span className="text-sm text-endfield-text uppercase">{t('basePowerShort')}:</span>
        {baseConfig.generators > 0 ? (
          <>
            <span className="text-sm font-bold text-endfield-text-light">{baseConfig.generators}</span>
            <span className="text-sm text-endfield-text">× {getFuelName(baseFuelData)}</span>
            <span className="text-sm text-endfield-text">=</span>
            <span className="text-sm font-bold text-endfield-yellow">{baseConfig.totalPower}w</span>
            <span className="text-xs text-endfield-text/70">
              (200w + {baseConfig.generators * baseFuelData.power}w)
            </span>
          </>
        ) : (
          <>
            <span className="text-sm font-bold text-endfield-yellow">200w</span>
            <span className="text-xs text-endfield-text/70">
              ({t('baseOnlyHint')})
            </span>
          </>
        )}
      </div>

      {/* 震荡发电 - 每个分支可独立拖拽 */}
      {oscillating && oscillating.length > 0 && (
        <div className="border border-endfield-gray-light bg-endfield-gray/30">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-endfield-gray-light bg-endfield-gray/50">
            <Icon name="electric_bolt" className="text-endfield-yellow" />
            <span className="text-sm text-endfield-text uppercase">{t('oscillatingShort')}:</span>
            <span className="text-sm font-bold text-endfield-text-light">{oscillating.length}</span>
            <span className="text-sm text-endfield-text">× {getFuelName(oscFuelData)}</span>
            <span className="text-sm text-endfield-text">=</span>
            <span className="text-sm font-bold text-endfield-yellow">
              {oscillating.reduce((sum, b) => sum + b.power, 0).toFixed(0)}w
            </span>
            <span className="text-xs text-endfield-text/70">
              ({oscillating.map(b => `${b.power.toFixed(0)}w`).join(' + ')})
            </span>
            <span className="text-xs text-endfield-text/50 ml-auto">
              {t('dragHint')}
            </span>
          </div>
          <div className="divide-y divide-endfield-gray-light/50">
            {oscillating.map((branch, idx) => (
              <DraggableBranch key={idx} branch={branch} idx={idx} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
