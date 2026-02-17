import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

/**
 * 下拉选择组件
 * @param {*} value - 当前选中值
 * @param {Array} options - 选项列表 [{ value, label, ... }]
 * @param {function} onChange - 选择回调 (option) => void
 * @param {function} renderOption - 自定义选项渲染 (option) => ReactNode
 * @param {string} ariaLabel - 无障碍标签
 * @param {string} ariaLabelledby - 关联的 label id
 */
export default function Select({
  value,
  options = [],
  onChange,
  renderOption,
  ariaLabel,
  ariaLabelledby,
  className = '',
  buttonClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? (renderOption ? renderOption(selectedOption) : selectedOption.label) : '';

  return (
    <div className={`relative ${className}`.trim()} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-between px-3 text-sm text-endfield-text-light ${buttonClassName}`.trim()}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={ariaLabelledby}
        aria-label={ariaLabel}
      >
        <span className="flex items-center gap-2">{displayLabel}</span>
        <Icon name={open ? 'expand_less' : 'expand_more'} />
      </button>

      {open && (
        <ul
          className="absolute left-0 right-0 top-full mt-1 bg-endfield-gray border border-endfield-gray-light z-50 max-h-60 overflow-y-auto list-none p-0 m-0"
          role="listbox"
          aria-labelledby={ariaLabelledby}
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={value === opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange?.(opt);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-endfield-gray-light transition-colors flex items-center gap-2 ${
                  value === opt.value ? 'text-endfield-yellow' : 'text-endfield-text-light'
                }`}
              >
                {renderOption ? renderOption(opt) : opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
