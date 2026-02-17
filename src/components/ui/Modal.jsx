import { createPortal } from 'react-dom';

/**
 * Reusable modal shell.
 * `closeOnBackdrop` controls whether clicking outside content closes the modal.
 */
export default function Modal({
  show,
  onClose,
  closeOnBackdrop = true,
  fullscreen = false,
  title,
  ariaLabelledby,
  children,
  contentClassName = '',
}) {
  if (!show) return null;

  const overlayClass = fullscreen
    ? 'fixed inset-0 z-[60] bg-endfield-black/95 backdrop-blur overflow-hidden'
    : 'fixed inset-0 z-50 bg-endfield-black/95 backdrop-blur overflow-y-auto';

  const node = (
    <div
      className={overlayClass}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledby}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={
          fullscreen
            ? 'h-full w-full flex items-stretch justify-stretch p-0'
            : 'min-h-full w-full flex items-center justify-center p-4'
        }
      >
        <div
          className={`${
            fullscreen
              ? 'w-full h-full relative flex flex-col'
              : 'bg-endfield-gray border border-endfield-yellow/30 p-6 max-w-xl w-full relative flex flex-col'
          } ${contentClassName}`.trim()}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-endfield-gray-light">
              {title}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return node;
  }
  return createPortal(node, document.body);
}
