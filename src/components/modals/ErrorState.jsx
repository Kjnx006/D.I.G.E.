import { useI18n } from '../../i18n';
import AlertModal from '../ui/AlertModal';

export default function ErrorState({ show, onDismiss, closeOnBackdrop = false }) {
  const { t } = useI18n();

  return (
    <AlertModal
      show={show}
      onClose={onDismiss}
      closeOnBackdrop={closeOnBackdrop}
      titleId="error-state-title"
      icon="error"
      tone="danger"
      title={t('noSolutionFound')}
      message={t('errorSuggestion')}
      actionLabel={t('dismiss')}
    />
  );
}
