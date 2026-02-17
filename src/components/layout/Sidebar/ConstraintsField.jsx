import { useI18n } from '../../../i18n';
import Icon from '../../ui/Icon';
import { PARAM_LIMITS } from '../../../utils/constants';

export default function ConstraintsField({ params, onChange, onCalculate }) {
  const { t } = useI18n();

  const handleMinBattery = (val) => {
    const clamped = Math.min(100, Math.max(0, val));
    onChange('minBatteryPercent', clamped);
  };

  return (
    <fieldset className="space-y-4 border-none p-0 m-0">
      <legend className="text-sm font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2 p-0">
        <Icon name="tune" className="text-endfield-yellow" />
        {t('constraints')}
      </legend>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="min-battery-input" className="text-sm text-endfield-text">{t('minBatteryPercent')}</label>
          <div className="flex items-center">
            <input
              id="min-battery-input"
              type="number"
              min="0"
              max="100"
              value={params.minBatteryPercent}
              onChange={(e) => handleMinBattery(parseInt(e.target.value) || 0)}
              onKeyDown={(e) => e.key === 'Enter' && onCalculate?.()}
              className="w-12 bg-transparent border-b border-endfield-gray-light px-1 py-0.5 text-sm text-endfield-text-light text-right focus:border-endfield-yellow focus:outline-none"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={params.minBatteryPercent}
            />
            <span className="text-sm text-endfield-text-light">%</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={params.minBatteryPercent}
          onChange={(e) => onChange('minBatteryPercent', parseInt(e.target.value))}
          className="w-full cursor-pointer"
          aria-label={t('minBatteryPercent')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={params.minBatteryPercent}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label htmlFor="max-waste-input" className="text-sm text-endfield-text">{t('maxWaste')}</label>
          <span className="text-sm text-endfield-text-light" aria-live="polite">{params.maxWaste} w</span>
        </div>
        <input
          id="max-waste-input"
          type="number"
          min="0"
          max={PARAM_LIMITS.MAX_MAX_WASTE}
          value={params.maxWaste}
          onChange={(e) => onChange('maxWaste', parseInt(e.target.value, 10) || 0)}
          onKeyDown={(e) => e.key === 'Enter' && onCalculate?.()}
          className="w-full bg-endfield-gray border border-endfield-gray-light px-3 py-2 text-sm text-endfield-text-light focus:border-endfield-yellow focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label htmlFor="max-branches-input" className="text-sm text-endfield-text">{t('maxBranches')}</label>
          <span className="text-sm text-endfield-text-light" aria-live="polite">{params.maxBranches ?? 3}</span>
        </div>
        <input
          id="max-branches-input"
          type="range"
          min={PARAM_LIMITS.MIN_BRANCHES}
          max={PARAM_LIMITS.MAX_BRANCHES}
          step="1"
          value={params.maxBranches ?? 3}
          onChange={(e) => onChange('maxBranches', parseInt(e.target.value, 10))}
          className="w-full cursor-pointer"
          aria-label={t('maxBranches')}
          aria-valuemin={PARAM_LIMITS.MIN_BRANCHES}
          aria-valuemax={PARAM_LIMITS.MAX_BRANCHES}
          aria-valuenow={params.maxBranches ?? 3}
        />
        <div className="flex justify-between text-xs text-endfield-text/50 px-0.5">
          {Array.from({ length: PARAM_LIMITS.MAX_BRANCHES }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
