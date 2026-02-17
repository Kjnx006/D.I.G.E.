import Icon from './Icon';

/**
 * 可折叠区块组件
 * @param {string} title - 标题
 * @param {boolean} collapsed - 是否折叠
 * @param {function} onToggle - 切换回调
 * @param {ReactNode} children - 内容
 * @param {string} icon - 图标名称
 * @param {string} expandLabel - 展开时的辅助文字
 * @param {string} collapseLabel - 折叠时的辅助文字
 */
export default function CollapsibleSection({
  title,
  collapsed,
  onToggle,
  children,
  icon,
  expandLabel,
  collapseLabel,
  className = '',
}) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full min-h-8 sm:min-h-9 flex items-center gap-2 text-left"
        aria-expanded={!collapsed}
      >
        {icon && <Icon name={icon} className="text-endfield-yellow leading-none" />}
        <span className="text-sm font-bold text-endfield-text uppercase tracking-widest leading-none">{title}</span>
        <span className="ml-auto text-xs text-endfield-text/70 leading-none">
          {collapsed ? expandLabel : collapseLabel}
        </span>
        <Icon name={collapsed ? 'expand_more' : 'expand_less'} className="text-endfield-text leading-none" />
      </button>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows,margin,opacity] duration-300 ease-out ${
          collapsed ? 'grid-rows-[0fr] mt-0 opacity-0' : 'grid-rows-[1fr] mt-3 opacity-100'
        }`}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
