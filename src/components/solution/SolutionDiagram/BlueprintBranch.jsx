import { useCallback, useEffect, useRef, useState } from 'react';
import BlueprintCell from './BlueprintCell';

export default function BlueprintBranch({
  branch,
  zoom = 1,
  onWheelZoom,
  onTouchStart: onPinchStart,
  onTouchMove: onPinchMove,
  onTouchEnd: onPinchEnd,
}) {
  const { denominator, power, blueprint } = branch;
  const hasBlueprint =
    Array.isArray(blueprint) && blueprint.length > 0 && Array.isArray(blueprint[0]);
  const scrollRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const isPanningRef = useRef(false);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanScroll(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [branch, zoom]);

  const handlePanStart = useCallback((clientX, clientY) => {
    const el = scrollRef.current;
    if (!el || (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)) return;
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = {
      x: clientX,
      y: clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
  }, []);

  const handlePanMove = useCallback((clientX, clientY) => {
    if (!isPanningRef.current || !scrollRef.current) return;
    const el = scrollRef.current;
    const { x, y, scrollLeft, scrollTop } = panStartRef.current;
    const z = zoomRef.current;
    const dx = (clientX - x) / z;
    const dy = (clientY - y) / z;
    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
    el.scrollLeft = Math.max(0, Math.min(maxScrollLeft, scrollLeft - dx));
    el.scrollTop = Math.max(0, Math.min(maxScrollTop, scrollTop - dy));
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanningRef.current = false;
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e) => handlePanMove(e.clientX, e.clientY);
    const onUp = () => handlePanEnd();
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isPanning, handlePanMove, handlePanEnd]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.touches.length === 2) {
        onPinchMove?.(e);
      } else if (e.touches.length === 1 && isPanningRef.current) {
        e.preventDefault();
      }
    };
    el.addEventListener('touchmove', handler, { passive: false });
    return () => el.removeEventListener('touchmove', handler);
  }, [onPinchMove]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !onWheelZoom) return;
    el.addEventListener('wheel', onWheelZoom, { passive: false });
    return () => el.removeEventListener('wheel', onWheelZoom);
  }, [onWheelZoom]);

  const onMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      handlePanStart(e.clientX, e.clientY);
      e.preventDefault();
    },
    [handlePanStart],
  );

  const onTouchMove = useCallback(
    (e) => {
      if (e.touches.length >= 2) {
        handlePanEnd();
        return;
      }
      if (e.touches.length === 1) handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    [handlePanMove, handlePanEnd],
  );

  return (
    <div className="flex flex-col gap-1.5 py-2 sm:py-3 px-1 sm:px-2">
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto pb-1 select-none min-h-0 min-w-0"
        style={{ cursor: canScroll ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={onMouseDown}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={(e) => {
          onPinchStart?.(e);
          if (e.touches.length === 1) {
            const touch = e.touches[0];
            handlePanStart(touch.clientX, touch.clientY);
          }
          if (e.touches.length >= 2) handlePanEnd();
        }}
        onTouchMove={onTouchMove}
        onTouchEnd={(e) => {
          onPinchEnd?.();
          handlePanEnd();
        }}
      >
        <div className="w-max mx-auto">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs text-endfield-yellow font-bold">1/{denominator}</span>
            <span className="text-[10px] text-endfield-text">{power.toFixed(0)}w</span>
          </div>
          {hasBlueprint ? (
            <div className="blueprint-grid inline-block border border-endfield-gray-light p-2 select-none w-max">
              <div
                className="grid gap-0 select-none w-max"
                style={{ gridTemplateColumns: `repeat(${blueprint[0].length}, minmax(2.5rem, 1fr))` }}
              >
                {blueprint.flatMap((row, rowIndex) =>
                  row.map((part, colIndex) => (
                    <BlueprintCell key={`${rowIndex}-${colIndex}`} part={part} rowIndex={rowIndex} colIndex={colIndex} />
                  )),
                )}
              </div>
            </div>
          ) : (
            <div className="h-8 px-2 border border-endfield-gray-light text-endfield-text-light bg-endfield-black/50 inline-flex items-center text-[10px] font-semibold">
              I S M T R
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
