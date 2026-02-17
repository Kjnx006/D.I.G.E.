export default function UnreadDot({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ${className}`.trim()}
    />
  );
}
