import { useI18n } from '../i18n';
import { formatTime, CONSTANTS, FUELS } from '../utils/constants';
import SolutionChart from './SolutionChart';
import SolutionDiagram from './SolutionDiagram';

export default function SolutionList({ solutions, selectedIndex, onSelectSolution, params }) {
  const { t, locale } = useI18n();

  if (!solutions || solutions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-endfield-text">
        <div className="text-center max-w-sm px-4">
          <span className="material-symbols-outlined text-4xl mb-2">calculate</span>
          <p className="mb-2">{t('clickCalculate')}</p>
          <p className="text-xs text-endfield-text/60">{t('adjustParamsHint')}</p>
        </div>
      </div>
    );
  }

  const selectedSolution = solutions[selectedIndex];

  const getFuelName = (fuel) => {
    if (!fuel) return '-';
    return fuel.name[locale] || fuel.name.en;
  };

  const getOscillatingSavings = () => {
    const oscillatingConsumption = selectedSolution?.fuelConsumption?.oscillating;
    const fuel = oscillatingConsumption?.fuel;
    const oscillatingBranches = selectedSolution?.oscillating || [];

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
  };

  const oscillatingSavings = getOscillatingSavings();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 方案选择 + 数据摘要 - 紧凑横向布局 */}
      <div className="shrink-0 p-2 sm:p-4 border-b border-endfield-gray-light bg-endfield-dark/50">
        {/* 方案标签 */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-sm text-endfield-text uppercase tracking-widest">{t('selectSolution')}:</span>
          <div className="flex gap-1">
            {solutions.map((sol, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSolution(idx)}
                className={`px-3 py-1.5 text-sm transition-colors border ${
                  selectedIndex === idx
                    ? 'text-endfield-yellow border-endfield-yellow bg-endfield-yellow/10'
                    : 'text-endfield-text border-endfield-gray-light hover:border-endfield-text'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* 数据摘要 - 响应式布局 */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-endfield-text">{t('branchesShort')}:</span>
            <span className="text-endfield-text-light">{selectedSolution.branchCount}</span>
            <span className="text-endfield-text">({selectedSolution.isPrimary ? t('primaryOnly') : t('useSecondary')})</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-endfield-text">{t('actualPower')}:</span>
            <span className="text-endfield-text-light">{selectedSolution.avgPower.toFixed(1)}w</span>
            <span className={`${selectedSolution.waste >= 0 ? 'text-endfield-yellow' : 'text-green-400'}`}>
              ({selectedSolution.waste >= 0 ? '+' : ''}{selectedSolution.waste.toFixed(1)})
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-endfield-text">{t('cyclePeriod')}:</span>
            <span className="text-endfield-text-light">
              {selectedSolution.period > 0 ? formatTime(selectedSolution.period) : '--:--'}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-endfield-text">{t('minBatteryShort')}:</span>
            <span className="text-endfield-text-light">{selectedSolution.minBatteryPercent?.toFixed(1) || '100'}%</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-endfield-text">{t('variance')}:</span>
            <span className="text-endfield-text-light">{selectedSolution.variance?.toFixed(2) || '0'}</span>
          </div>
        </div>
      </div>

      {/* 主内容区 - 纵向布局，可滚动 */}
      <div className="flex-1 overflow-auto">
        {/* 图表区 */}
        <div className="p-2 sm:p-4 border-b border-endfield-gray-light">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-base text-endfield-yellow">monitoring</span>
            <span className="text-sm font-bold text-endfield-text uppercase tracking-widest">
              {t('cycleChart')}
            </span>
          </div>
          <div className="bg-endfield-gray border border-endfield-gray-light p-2 sm:p-4">
            <SolutionChart 
              solution={selectedSolution} 
              targetPower={params.targetPower}
              batteryCapacity={CONSTANTS.BATTERY_CAPACITY}
            />
          </div>
        </div>

        {/* 燃料消耗 */}
        {selectedSolution.fuelConsumption && (
          <div className="p-2 sm:p-4 border-b border-endfield-gray-light">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-base text-endfield-yellow">local_fire_department</span>
              <span className="text-sm font-bold text-endfield-text uppercase tracking-widest">
                {t('fuelConsumption')}
              </span>
            </div>
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
                  {selectedSolution.fuelConsumption.base.perDay > 0 && (
                    <tr className="border-b border-endfield-gray-light/50">
                      <td className="p-2">
                        <span className="text-endfield-text/70">{t('basePowerShort')}: </span>
                        <span className="text-endfield-text-light font-semibold">{getFuelName(selectedSolution.fuelConsumption.base.fuel)}</span>
                      </td>
                      <td className="p-2 text-right text-endfield-text-light">{selectedSolution.fuelConsumption.base.perMinute.toFixed(2)}</td>
                      <td className="p-2 text-right text-endfield-text-light">{selectedSolution.fuelConsumption.base.perHour.toFixed(1)}</td>
                      <td className="p-2 text-right text-endfield-yellow font-bold">{selectedSolution.fuelConsumption.base.perDay.toFixed(0)}</td>
                      <td className="hidden md:table-cell p-2 text-right text-endfield-text/50">-</td>
                    </tr>
                  )}
                  {selectedSolution.fuelConsumption.oscillating.perDay > 0 && (
                    <tr>
                      <td className="p-2">
                        <span className="text-endfield-text/70">{t('oscillatingShort')}: </span>
                        <span className="text-endfield-text-light font-semibold">{getFuelName(selectedSolution.fuelConsumption.oscillating.fuel)}</span>
                      </td>
                      <td className="p-2 text-right text-endfield-text-light">{selectedSolution.fuelConsumption.oscillating.perMinute.toFixed(2)}</td>
                      <td className="p-2 text-right text-endfield-text-light">{selectedSolution.fuelConsumption.oscillating.perHour.toFixed(1)}</td>
                      <td className="p-2 text-right text-endfield-yellow font-bold">{selectedSolution.fuelConsumption.oscillating.perDay.toFixed(0)}</td>
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
              {selectedSolution.fuelConsumption.oscillating.perDay > 0 && (
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
          </div>
        )}

        {/* 方案流程图 */}
        <div className="p-2 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-base text-endfield-yellow">account_tree</span>
            <span className="text-sm font-bold text-endfield-text uppercase tracking-widest">
              {t('solutionDiagram')}
            </span>
          </div>
          <SolutionDiagram solution={selectedSolution} />
        </div>
      </div>
    </div>
  );
}