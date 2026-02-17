/**
 * Reusable modal shell.
 * `closeOnBackdrop` controls whether clicking outside content closes the modal.
 */
export default function Modal({
  show,
  onClose,
  closeOnBackdrop = true,
  title,
  ariaLabelledby,
  children,
  contentClassName = '',
}) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-endfield-black/95 backdrop-blur z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledby}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`bg-endfield-gray border border-endfield-yellow/30 p-6 max-w-xl w-full relative flex flex-col ${contentClassName}`.trim()}
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
  );
}
