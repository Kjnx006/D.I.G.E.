export default function CloseButton({
  onClick,
  label,
  className = '',
  sizeClass = 'w-6 h-6',
  iconClass = 'text-sm',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border border-endfield-gray-light hover:border-endfield-yellow text-endfield-text hover:text-endfield-yellow flex items-center justify-center transition-colors ${sizeClass} ${className}`}
      aria-label={label}
      title={label}
    >
      <span className={`material-symbols-outlined leading-none ${iconClass}`} aria-hidden="true">close</span>
    </button>
  );
}
