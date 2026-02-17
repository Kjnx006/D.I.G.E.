import { useI18n } from '../../i18n';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';

export default function ErrorState({ show, onDismiss, closeOnBackdrop = false }) {
  const { t } = useI18n();

  if (!show) return null;

  return (
    <Modal
      show={show}
      onClose={onDismiss}
      closeOnBackdrop={closeOnBackdrop}
      ariaLabelledby="error-state-title"
      title={
        <>
          <Icon name="error" className="text-red-300" />
          <h2
            id="error-state-title"
            className="text-base font-bold text-endfield-text-light uppercase tracking-wider"
          >
            {t('noSolutionFound')}
          </h2>
        </>
      }
      contentClassName="max-w-lg !border-red-900/50 corner-mark gap-4"
    >
      <p className="text-sm text-red-200 leading-relaxed">{t('errorSuggestion')}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 w-full h-10 min-h-10 bg-red-600/90 hover:bg-red-500 text-white font-bold tracking-wider transition-all flex items-center justify-center gap-2 text-sm"
      >
        {t('dismiss')}
      </button>
    </Modal>
  );
}
