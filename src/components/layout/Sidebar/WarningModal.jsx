import { useI18n } from '../../../i18n';
import AlertModal from '../../ui/AlertModal';

/**
 * Warning modal (input source packer / exclude belt, etc.).
 */
export default function WarningModal({
  show,
  title,
  message,
  onClose,
  closeOnBackdrop = true,
}) {
  const { t } = useI18n();

  return (
    <AlertModal
      show={show}
      onClose={onClose}
      closeOnBackdrop={closeOnBackdrop}
      titleId="warning-modal-title"
      icon="warning"
      tone="warning"
      title={title || t('importantNote')}
      message={message}
      actionLabel={t('close')}
    />
  );
}
