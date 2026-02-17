import { useI18n } from '../../../i18n';
import Icon from '../../ui/Icon';

export default function DiagramConfig({ solution, locale }) {
  const { t } = useI18n();

  const getFuelName = (fuel) => {
    if (!fuel) return '-';
    return fuel.name?.[locale] || fuel.name?.en || '';
  };

  const { baseConfig, baseFuel, oscillating, oscillatingFuel } = solution;
  const baseFuelData = baseFuel || solution.fuel;
  const oscFuelData = oscillatingFuel || solution.fuel;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-3 bg-endfield-gray border border-endfield-gray-light">
        <Icon name="factory" className="text-endfield-yellow" />
        <span className="text-sm text-endfield-text uppercase">{t('basePowerShort')}:</span>
        {baseConfig.generators > 0 ? (
          <>
            <span className="text-sm font-bold text-endfield-text-light">{baseConfig.generators}</span>
            <span className="text-sm text-endfield-text">x {getFuelName(baseFuelData)}</span>
            <span className="text-sm text-endfield-text">=</span>
            <span className="text-sm font-bold text-endfield-yellow">{baseConfig.totalPower}w</span>
            <span className="text-xs text-endfield-text/70">
              (200w + {baseConfig.generators * baseFuelData.power}w)
            </span>
          </>
        ) : (
          <>
            <span className="text-sm font-bold text-endfield-yellow">200w</span>
            <span className="text-xs text-endfield-text/70">({t('baseOnlyHint')})</span>
          </>
        )}
      </div>

    </>
  );
}
