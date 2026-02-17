/**
 * 开关组件
 * @param {boolean} checked - 是否选中
 * @param {function} onChange - 切换回调（interactive=false 时由父级处理，可省略）
 * @param {boolean} disabled - 是否禁用
 * @param {boolean} interactive - 是否可独立点击，false 时仅展示，由父级容器处理点击
 * @param {string} ariaLabel - 无障碍标签
 */
export default function Toggle({ checked, onChange, disabled = false, interactive = true, ariaLabel, className = '' }) {
  const track = (
    <span
      className={`relative inline-flex w-8 h-4 items-center border transition-colors ${
        checked
          ? 'bg-endfield-yellow/25 border-endfield-yellow/70'
          : 'bg-endfield-gray border-endfield-gray-light'
      }`}
    >
      <span
        className={`absolute left-px top-1/2 w-3 h-3 -translate-y-1/2 bg-endfield-yellow transition-transform duration-200 ${
          checked ? 'translate-x-[15px]' : 'translate-x-0'
        }`}
      />
    </span>
  );

  if (!interactive) {
    return (
      <span aria-hidden className={`inline-flex items-center gap-2 ${className}`.trim()}>
        {track}
      </span>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange?.(!checked);
        }
      }}
      className={`inline-flex items-center gap-2 cursor-pointer select-none border-0 bg-transparent p-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`.trim()}
    >
      {track}
    </button>
  );
}
