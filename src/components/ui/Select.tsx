import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

export interface SelectOption<T = string> {
  value: T;
  label: React.ReactNode;
  [key: string]: unknown;
}

export interface SelectProps<T = string> {
  value?: T;
  options?: SelectOption<T>[];
  onChange?: (option: SelectOption<T>) => void;
  renderOption?: (option: SelectOption<T>) => React.ReactNode;
  id?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  className?: string;
  buttonClassName?: string;
}

export default function Select<T = string>({
  value,
  options = [],
  onChange,
  renderOption,
  id,
  ariaLabel,
  ariaLabelledby,
  className = '',
  buttonClassName = '',
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption
    ? renderOption
      ? renderOption(selectedOption)
      : selectedOption.label
    : '';

  return (
    <div className={`relative ${className}`.trim()} ref={containerRef}>
      <button
        type="button"
        id={id}
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
          aria-labelledby={ariaLabelledby}
        >
          {options.map((opt) => (
            <li key={String(opt.value)}>
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
