import Icon from './Icon';

export default function ModalHeader({
  id,
  icon,
  title,
  bordered = true,
  className = '',
  iconClassName = 'text-endfield-yellow',
  titleClassName = '',
}) {
  const content = (
    <>
      {icon && <Icon name={icon} className={iconClassName} />}
      <h2
        id={id}
        className={`text-base font-bold text-endfield-text-light uppercase tracking-wider ${titleClassName}`.trim()}
      >
        {title}
      </h2>
    </>
  );

  if (!bordered) {
    return content;
  }

  return (
    <div className={`flex items-center gap-2 pb-3 border-b border-endfield-gray-light ${className}`.trim()}>
      {content}
    </div>
  );
}
