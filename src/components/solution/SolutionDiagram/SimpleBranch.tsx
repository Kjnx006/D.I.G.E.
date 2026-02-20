import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../ui/Icon';

function factorDenominator(denominator: number): number[] {
  let d = denominator;
  const steps: number[] = [];
  while (d % 3 === 0) {
    steps.push(3);
    d /= 3;
  }
  while (d % 2 === 0) {
    steps.push(2);
    d /= 2;
  }
  return steps.sort((a, b) => b - a);
}
function BranchLabel({ denominator, power }: { denominator: number; power: number }) {
  return (
    <div className="shrink-0 w-14 text-center self-center">
      <div className="text-xs text-endfield-yellow font-bold">1/{denominator}</div>
      <div className="text-[10px] text-endfield-text">{power.toFixed(0)}w</div>
    </div>
  );
}

function SimpleSplitter({ type, t }: { type: number; t: (key: string) => string }) {
  const isTwoWay = type === 2;
  return (
    <div className="flex items-center gap-1 shrink-0">
      <div
        className={`min-w-[46px] sm:min-w-[52px] h-8 sm:h-9 border px-1 flex items-center justify-center ${
          isTwoWay
            ? 'bg-endfield-gray border-endfield-yellow/30 text-endfield-yellow'
            : 'bg-endfield-gray border-endfield-text-light/20 text-endfield-text-light'
        }`}
      >
        <div className="text-xs uppercase font-bold leading-none">
          {isTwoWay ? '2' : '3'}
          {t('waySplit')}
        </div>
      </div>
      <Icon name="arrow_right_alt" className="text-endfield-text/50 shrink-0" />
    </div>
  );
}

export interface SimpleBranchProps {
  branch: { denominator: number; power: number };
  t: (key: string) => string;
}

export default function SimpleBranch({ branch, t }: SimpleBranchProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLFieldSetElement>(null);
  const dragStateRef = useRef({
    active: false,
    startClientX: 0,
    startScrollLeft: 0,
  });
  const steps = factorDenominator(branch.denominator);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;
    dragStateRef.current = {
      active: true,
      startClientX: e.clientX,
      startScrollLeft: container.scrollLeft,
    };
    setIsDragging(true);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (event: MouseEvent) => {
      const container = containerRef.current;
      const dragState = dragStateRef.current;
      if (!container || !dragState.active) return;
      const delta = event.clientX - dragState.startClientX;
      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      const nextScrollLeft = Math.max(
        0,
        Math.min(maxScrollLeft, dragState.startScrollLeft - delta)
      );
      container.scrollLeft = nextScrollLeft;
    };
    const stopDragging = () => {
      if (!dragStateRef.current.active) return;
      dragStateRef.current.active = false;
      setIsDragging(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragging);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopDragging);
    };
  }, [isDragging]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 py-1 sm:py-2 px-1 sm:px-2">
      <BranchLabel denominator={branch.denominator} power={branch.power} />

      <fieldset
        aria-label={t('solutionPreview')}
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-visible scrollbar-hide pb-1 min-w-0 border-0 p-0 m-0"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="inline-flex items-center gap-1 w-max px-1.5 py-1.5 border border-endfield-gray-light bg-endfield-black/30">
          <div className="h-7 sm:h-8 min-w-[44px] px-1.5 bg-endfield-gray border border-endfield-text-light/40 flex items-center justify-center gap-1 text-endfield-text-light shrink-0">
            <Icon name="input" className="text-[14px]" />
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase">In</span>
          </div>
          <Icon name="arrow_right_alt" className="text-endfield-text/50 shrink-0" />

          {steps.map((type, idx) => (
            <SimpleSplitter key={`${steps.slice(0, idx).join('-')}-${type}`} type={type} t={t} />
          ))}

          <div className="h-7 sm:h-8 px-2 bg-endfield-yellow/10 border border-endfield-yellow/50 flex items-center gap-1 text-endfield-yellow shrink-0">
            <Icon name="bolt" />
            <span className="text-xs font-bold uppercase">{t('gen')}</span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
