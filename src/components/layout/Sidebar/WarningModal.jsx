import { useI18n } from '../../../i18n';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';

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

  if (!show) return null;

  return (
    <Modal
      show={show}
      onClose={onClose}
      closeOnBackdrop={closeOnBackdrop}
      ariaLabelledby="warning-modal-title"
      title={
        <>
          <Icon name="warning" className="text-red-300" />
          <h2
            id="warning-modal-title"
            className="text-base font-bold text-endfield-text-light uppercase tracking-wider"
          >
            {title || t('importantNote')}
          </h2>
        </>
      }
      contentClassName="max-w-lg !border-red-900/50 corner-mark gap-4"
    >
      <p className="text-sm text-red-200 leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className="shrink-0 w-full h-10 min-h-10 bg-red-600/90 hover:bg-red-500 text-white font-bold tracking-wider transition-all flex items-center justify-center gap-2 text-sm"
      >
        {t('close')}
      </button>
    </Modal>
  );
}
