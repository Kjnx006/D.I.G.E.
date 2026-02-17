/**
 * 模态框基座组件
 * @param {boolean} show - 是否显示
 * @param {function} onClose - 关闭回调
 * @param {ReactNode} title - 标题内容
 * @param {string} ariaLabelledby - 标题元素 id（无障碍）
 * @param {ReactNode} children - 内容
 * @param {string} contentClassName - 内容区额外 class
 */
export default function Modal({ show, onClose, title, ariaLabelledby, children, contentClassName = '' }) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-endfield-black/95 backdrop-blur z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledby}
      onClick={onClose}
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
