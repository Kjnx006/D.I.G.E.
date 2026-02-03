import { useI18n } from '../i18n';

export default function LoadingOverlay({ isLoading }) {
  const { t } = useI18n();
  
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-endfield-black/90 backdrop-blur z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-endfield-yellow text-5xl animate-spin">
          settings
        </span>
        <span className="text-endfield-yellow font-mono tracking-[0.3em] text-sm">
          {t('calculating')}
        </span>
      </div>
    </div>
  );
}
