import { useI18n } from '../../../i18n';
import { PARAM_LIMITS } from '../../../utils/constants';
import RangeField from '../../ui/RangeField';
import SidebarSection from './SidebarSection';

export default function ConstraintsField({ params, onChange, onCalculate }) {
  const { t } = useI18n();

  const handleMinBattery = (val) => {
    const clamped = Math.min(100, Math.max(0, val));
    onChange('minBatteryPercent', clamped);
  };

  const visibleBranchCount = Math.max(
    PARAM_LIMITS.MIN_BRANCHES,
    Math.min(PARAM_LIMITS.MAX_BRANCHES, params.maxBranches ?? PARAM_LIMITS.MAX_BRANCHES),
  );

  const phaseOffsetBranchKeys = Array.from(
    { length: visibleBranchCount },
    (_, index) => `phaseOffsetBranch${index + 1}`,
  );

  return (
    <SidebarSection icon="tune" title={t('constraints')} className="space-y-4">
      <div className="space-y-2">
        <RangeField
          id="min-battery-input"
          label={t('minBatteryPercent')}
          value={params.minBatteryPercent}
          min={0}
          max={100}
          onChange={(nextValue) => onChange('minBatteryPercent', nextValue)}
          ariaLabel={t('minBatteryPercent')}
          rightSlot={(
            <div className="flex items-center">
              <input
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
          )}
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

      <RangeField
        id="max-branches-input"
        label={t('maxBranches')}
        value={params.maxBranches ?? 3}
        min={PARAM_LIMITS.MIN_BRANCHES}
        max={PARAM_LIMITS.MAX_BRANCHES}
        step={1}
        onChange={(nextValue) => onChange('maxBranches', nextValue)}
        ariaLabel={t('maxBranches')}
        rightSlot={<span className="text-sm text-endfield-text-light" aria-live="polite">{params.maxBranches ?? 3}</span>}
        ticks={Array.from({ length: PARAM_LIMITS.MAX_BRANCHES }, (_, i) => i + 1)}
      />

      <div className="space-y-2">
        <div className="text-sm text-endfield-text">{t('branchPhaseOffset')}</div>
        <p className="text-xs text-endfield-text/70">{t('branchPhaseOffsetHint')}</p>
        <div className="space-y-3">
          {phaseOffsetBranchKeys.map((key, index) => (
            <RangeField
              key={key}
              id={`phase-offset-branch-${index + 1}`}
              label={`${t('branch')} ${index + 1}`}
              value={params[key] ?? 0}
              min={PARAM_LIMITS.MIN_PHASE_OFFSET_CELLS}
              max={PARAM_LIMITS.MAX_PHASE_OFFSET_CELLS}
              step={1}
              onChange={(nextValue) => onChange(key, nextValue)}
              ariaLabel={`${t('branch')} ${index + 1} ${t('branchPhaseOffset')}`}
              rightSlot={(
                <span className="text-sm text-endfield-text-light" aria-live="polite">
                  {params[key] ?? 0}
                </span>
              )}
            />
          ))}
        </div>
      </div>
    </SidebarSection>
  );
}
