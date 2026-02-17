import Modal from '../Modal';

export default function ImagePreviewZoomModal({
  show,
  onClose,
  previewUrl,
  titleText,
  t,
  zoomScale,
  zoomOffset,
  zoomDragging,
  canPan,
  viewportRef,
  onZoomOut,
  onResetZoom,
  onZoomIn,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  onDoubleClick,
  onImageLoad,
}) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      ariaLabelledby="zoom-image-preview-title"
      fullscreen
      contentClassName="bg-endfield-black overflow-hidden"
    >
      <div className="h-full w-full bg-endfield-black flex flex-col">
        <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-endfield-gray-light/80 bg-endfield-dark/90">
          <h2
            id="zoom-image-preview-title"
            className="min-w-0 truncate text-sm sm:text-base font-bold text-endfield-text-light uppercase tracking-wider"
          >
            {titleText}
          </h2>
          <div className="shrink-0 flex items-center gap-1">
            <button
              type="button"
              onClick={onZoomOut}
              className="h-8 min-w-8 px-2 border border-endfield-gray-light bg-endfield-gray text-endfield-text-light hover:text-endfield-yellow hover:border-endfield-yellow transition-colors text-sm"
              aria-label="-"
              title="-"
            >
              -
            </button>
            <button
              type="button"
              onClick={onResetZoom}
              className="h-8 min-w-14 px-2 border border-endfield-gray-light bg-endfield-gray text-endfield-text-light hover:text-endfield-yellow hover:border-endfield-yellow transition-colors text-xs"
              aria-label="100%"
              title="100%"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              type="button"
              onClick={onZoomIn}
              className="h-8 min-w-8 px-2 border border-endfield-gray-light bg-endfield-gray text-endfield-text-light hover:text-endfield-yellow hover:border-endfield-yellow transition-colors text-sm"
              aria-label="+"
              title="+"
            >
              +
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className={`relative flex-1 min-h-0 overflow-hidden touch-none select-none ${
            canPan ? (zoomDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          }`}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchCancel}
          onDoubleClick={onDoubleClick}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={titleText}
              draggable={false}
              onLoad={onImageLoad}
              className="absolute left-1/2 top-1/2 max-w-full max-h-full"
              style={{
                transform: `translate(calc(-50% + ${zoomOffset.x}px), calc(-50% + ${zoomOffset.y}px)) scale(${zoomScale})`,
                transformOrigin: 'center center',
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-endfield-text/70">
              {t('noSolutionData')}
            </div>
          )}
        </div>

        <div className="shrink-0 px-3 py-2 border-t border-endfield-gray-light/80 bg-endfield-dark/90 flex items-center justify-between gap-2">
          <div className="text-xs text-endfield-text/70">{Math.round(zoomScale * 100)}%</div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 min-w-20 px-3 border border-endfield-gray-light bg-endfield-gray text-endfield-text-light hover:text-endfield-yellow hover:border-endfield-yellow transition-colors text-sm font-bold tracking-wider"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
