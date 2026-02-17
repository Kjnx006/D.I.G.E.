import { useI18n } from '../../../i18n';

function getOscillatingSavings(solution, locale) {
  const oscillatingConsumption = solution?.fuelConsumption?.oscillating;
  const fuel = oscillatingConsumption?.fuel;
  const oscillatingBranches = solution?.oscillating || [];

  if (!fuel || oscillatingBranches.length === 0 || !fuel.power || !fuel.burnTime) {
    return null;
  }

  const oscillatingPower = oscillatingBranches.reduce((sum, branch) => sum + branch.power, 0);
  const neededGens = Math.max(1, Math.ceil(oscillatingPower / fuel.power));
  const fullBeltPerDay = neededGens * (1 / fuel.burnTime) * 86400;
  const savedPerDay = fullBeltPerDay - oscillatingConsumption.perDay;

  if (savedPerDay <= 0) {
    return null;
  }

  return {
    savedPerDay,
    savedPercent: fullBeltPerDay > 0 ? (savedPerDay / fullBeltPerDay * 100) : 0,
  };
}

export default function FuelConsumptionTable({ solution, locale }) {
  const { t } = useI18n();

  if (!solution?.fuelConsumption) return null;

  const getFuelName = (fuel) => {
    if (!fuel) return '-';
    return fuel.name?.[locale] || fuel.name?.en || '';
  };

  const oscillatingSavings = getOscillatingSavings(solution, locale);
  const { base, oscillating } = solution.fuelConsumption;

  return (
    <div className="bg-endfield-gray border border-endfield-gray-light overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-endfield-gray-light bg-endfield-dark/50">
            <th className="text-left p-2 text-endfield-text font-normal">{t('fuelType')}</th>
            <th className="text-right p-2 text-endfield-text font-normal">{t('perMinute')}</th>
            <th className="text-right p-2 text-endfield-text font-normal">{t('perHour')}</th>
            <th className="text-right p-2 text-endfield-text font-normal">{t('perDay')}</th>
            <th className="hidden md:table-cell text-right p-2 text-endfield-text font-normal">{t('savedPerDay')}</th>
          </tr>
        </thead>
        <tbody>
          {base.perDay > 0 && (
            <tr className="border-b border-endfield-gray-light/50">
              <td className="p-2">
                <span className="text-endfield-text/70">{t('basePowerShort')}: </span>
                <span className="text-endfield-text-light font-semibold">{getFuelName(base.fuel)}</span>
              </td>
              <td className="p-2 text-right text-endfield-text-light">{base.perMinute.toFixed(2)}</td>
              <td className="p-2 text-right text-endfield-text-light">{base.perHour.toFixed(1)}</td>
              <td className="p-2 text-right text-endfield-yellow font-bold">{base.perDay.toFixed(0)}</td>
              <td className="hidden md:table-cell p-2 text-right text-endfield-text/50">-</td>
            </tr>
          )}
          {oscillating.perDay > 0 && (
            <tr>
              <td className="p-2">
                <span className="text-endfield-text/70">{t('oscillatingShort')}: </span>
                <span className="text-endfield-text-light font-semibold">{getFuelName(oscillating.fuel)}</span>
              </td>
              <td className="p-2 text-right text-endfield-text-light">{oscillating.perMinute.toFixed(2)}</td>
              <td className="p-2 text-right text-endfield-text-light">{oscillating.perHour.toFixed(1)}</td>
              <td className="p-2 text-right text-endfield-yellow font-bold">{oscillating.perDay.toFixed(0)}</td>
              <td className="hidden md:table-cell p-2 text-right">
                {oscillatingSavings ? (
                  <span className="text-green-400 font-bold">
                    {oscillatingSavings.savedPerDay.toFixed(0)} ({oscillatingSavings.savedPercent.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-endfield-text/50">-</span>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {oscillating.perDay > 0 && (
        <div className="md:hidden border-t border-endfield-gray-light px-2 py-2 flex items-center justify-between text-sm">
          <span className="text-endfield-text">{t('savedPerDay')}:</span>
          {oscillatingSavings ? (
            <span className="text-green-400 font-bold">
              {oscillatingSavings.savedPerDay.toFixed(0)} ({oscillatingSavings.savedPercent.toFixed(1)}%)
            </span>
          ) : (
            <span className="text-endfield-text/50">-</span>
          )}
        </div>
      )}
    </div>
  );
}
