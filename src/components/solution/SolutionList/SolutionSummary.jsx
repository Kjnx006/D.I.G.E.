import { useI18n } from '../../../i18n';
import { formatTime } from '../../../utils/constants';

export default function SolutionSummary({ solution }) {
  const { t } = useI18n();

  if (!solution) return null;

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-sm">
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-endfield-text">{t('branchesShort')}:</span>
        <span className="text-endfield-text-light">{solution.branchCount}</span>
        <span className="text-endfield-text">({solution.isPrimary ? t('primaryOnly') : t('useSecondary')})</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-endfield-text">{t('actualPower')}:</span>
        <span className="text-endfield-text-light">{solution.avgPower.toFixed(1)}w</span>
        <span className={`${solution.waste >= 0 ? 'text-endfield-yellow' : 'text-green-400'}`}>
          ({solution.waste >= 0 ? '+' : ''}{solution.waste.toFixed(1)})
        </span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-endfield-text">{t('cyclePeriod')}:</span>
        <span className="text-endfield-text-light">
          {solution.period > 0 ? formatTime(solution.period) : '--:--'}
        </span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-endfield-text">{t('minBatteryShort')}:</span>
        <span className="text-endfield-text-light">{solution.minBatteryPercent?.toFixed(1) || '100'}%</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-endfield-text">{t('variance')}:</span>
        <span className="text-endfield-text-light">{solution.variance?.toFixed(2) || '0'}</span>
      </div>
    </div>
  );
}
