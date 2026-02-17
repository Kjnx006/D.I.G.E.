import { useI18n } from '../../i18n';
import Icon from '../ui/Icon';

/**
 * 参数已修改未计算时的遮罩提示
 */
export default function DirtyOverlay({
  show,
  canRestore,
  onCalculate,
  onRestore,
  onDismiss,
}) {
  const { t } = useI18n();

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-40 bg-endfield-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
      <Icon name="sync_problem" className="text-endfield-yellow" />
      <p className="text-lg font-bold text-endfield-text-light tracking-wider">{t('paramsChanged')}</p>
      <p className="text-sm text-endfield-text">{t('clickCalculateToUpdate')}</p>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 w-72 sm:w-[28rem]">
        <button
          onClick={onCalculate}
          className="min-h-10 px-3 py-2 bg-endfield-yellow hover:bg-endfield-yellow-glow hover:-translate-y-0.5 text-endfield-black font-bold tracking-wider uppercase transition-all flex items-center justify-center text-sm glow-yellow"
        >
          <span className="inline-flex items-center gap-2">
            <Icon name="calculate" />
            {t('calculate')}
          </span>
        </button>
        {canRestore && (
          <button
            onClick={onRestore}
            className="min-h-10 px-3 py-2 border border-endfield-yellow/40 text-endfield-yellow font-bold tracking-wider uppercase hover:bg-endfield-yellow/10 hover:-translate-y-0.5 transition-all flex items-center justify-center text-sm"
          >
            <span className="inline-flex items-center gap-2">
              <Icon name="undo" />
              {t('restoreParams')}
            </span>
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-xs text-endfield-text hover:text-endfield-text-light transition-colors tracking-wider"
      >
        {t('ignoreWarning')}
      </button>
    </div>
  );
}
