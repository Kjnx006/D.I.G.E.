import Icon from '../../ui/Icon';

export interface SidebarSectionProps {
  icon?: string;
  title?: React.ReactNode;
  className?: string;
  legendClassName?: string;
  children?: React.ReactNode;
}

export default function SidebarSection({
  icon,
  title,
  className = 'space-y-4',
  legendClassName = '',
  children,
}: SidebarSectionProps) {
  return (
    <fieldset className={`border-none p-0 m-0 ${className}`.trim()}>
      <legend
        className={`text-sm font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2 p-0 ${legendClassName}`.trim()}
      >
        {icon && <Icon name={icon} className="text-endfield-yellow" />}
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
