import { useI18n } from '../i18n';

export default function ErrorState({ show, onDismiss }) {
  const { t } = useI18n();
  
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-endfield-black/95 backdrop-blur z-50 flex items-center justify-center">
      <div className="bg-endfield-gray border border-red-900/50 p-8 max-w-md text-center relative corner-mark mx-4">
        <span className="material-symbols-outlined text-red-500 text-5xl mb-4">
          error_outline
        </span>
        <h2 className="text-xl font-bold text-endfield-text-light mb-2 tracking-wider uppercase">
          {t('noSolutionFound')}
        </h2>
        <p className="text-endfield-text text-sm mb-6">
          {t('errorSuggestion')}
        </p>
        <button
          onClick={onDismiss}
          className="bg-endfield-gray-light hover:bg-endfield-yellow hover:text-endfield-black text-endfield-text-light px-6 py-2 border border-endfield-gray-light transition-all tracking-wider text-sm"
        >
          {t('dismiss')}
        </button>
      </div>
    </div>
  );
}
