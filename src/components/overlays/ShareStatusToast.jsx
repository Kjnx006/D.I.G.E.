/**
 * 分享状态提示条（复制成功/失败等）
 */
export default function ShareStatusToast({ message, visible }) {
  if (!message) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <div
        className={`bg-endfield-gray border border-endfield-yellow/50 text-endfield-yellow text-xs sm:text-sm px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-opacity duration-200 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        role="status"
        aria-live="polite"
      >
        {message}
      </div>
    </div>
  );
}
