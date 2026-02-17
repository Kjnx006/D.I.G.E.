import Modal from './Modal';
import Button from './Button';
import ModalHeader from './ModalHeader';

const TONE_STYLE_MAP = {
  danger: {
    iconClassName: 'text-red-300',
    messageClassName: 'text-red-200',
    contentClassName: '!border-red-900/50 corner-mark',
    actionVariant: 'danger',
  },
  warning: {
    iconClassName: 'text-red-300',
    messageClassName: 'text-red-200',
    contentClassName: '!border-red-900/50 corner-mark',
    actionVariant: 'danger',
  },
  neutral: {
    iconClassName: 'text-endfield-yellow',
    messageClassName: 'text-endfield-text-light',
    contentClassName: '',
    actionVariant: 'secondary',
  },
};

export default function AlertModal({
  show,
  onClose,
  closeOnBackdrop = false,
  titleId,
  title,
  message,
  actionLabel,
  icon = 'warning',
  tone = 'danger',
  contentClassName = '',
}) {
  if (!show) return null;

  const toneStyle = TONE_STYLE_MAP[tone] || TONE_STYLE_MAP.danger;

  return (
    <Modal
      show={show}
      onClose={onClose}
      closeOnBackdrop={closeOnBackdrop}
      ariaLabelledby={titleId}
      title={
        <ModalHeader
          id={titleId}
          icon={icon}
          iconClassName={toneStyle.iconClassName}
          title={title}
          bordered={false}
        />
      }
      contentClassName={`max-w-lg gap-4 ${toneStyle.contentClassName} ${contentClassName}`.trim()}
    >
      <p className={`text-sm leading-relaxed ${toneStyle.messageClassName}`}>{message}</p>
      <Button variant={toneStyle.actionVariant} fullWidth onClick={onClose}>
        {actionLabel}
      </Button>
    </Modal>
  );
}
