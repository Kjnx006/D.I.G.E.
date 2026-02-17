import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import Icon from '../ui/Icon';
import CollapsibleSection from '../ui/CollapsibleSection';
import SolutionSelector from './SolutionList/SolutionSelector';
import SolutionSummary from './SolutionList/SolutionSummary';
import ChartSection from './SolutionList/ChartSection';
import FuelConsumptionTable from './SolutionList/FuelConsumptionTable';
import SolutionChart from './SolutionChart';
import SolutionDiagram from './SolutionDiagram';

export default function SolutionList({ solutions, selectedIndex, onSelectSolution, params }) {
  const { t, locale } = useI18n();
  const [hideHoverDetails, setHideHoverDetails] = useState(false);
  const [preciseValues, setPreciseValues] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    chart: false,
    fuel: false,
    diagram: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHideHoverDetails(window.matchMedia('(max-width: 768px)').matches);
  }, []);

  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!solutions || solutions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-endfield-text">
        <div className="text-center max-w-sm px-4">
          <Icon name="calculate" className="mb-2" />
          <p className="mb-2">{t('clickCalculate')}</p>
          <p className="text-xs text-endfield-text/60">{t('adjustParamsHint')}</p>
        </div>
      </div>
    );
  }

  const selectedSolution = solutions[selectedIndex];

  return (
    <div className="flex-1 flex flex-col overflow-hidden notranslate" translate="no">
      <div className="shrink-0 p-2 sm:p-4 border-b border-endfield-gray-light bg-endfield-dark/50">
        <SolutionSelector
          solutions={solutions}
          selectedIndex={selectedIndex}
          onSelectSolution={onSelectSolution}
        />
        <SolutionSummary solution={selectedSolution} />
      </div>

      <div className="flex-1 overflow-auto scrollbar-gutter-stable">
        <div className={`${collapsedSections.chart ? 'px-2 sm:px-4 pt-2 sm:pt-4 pb-2 sm:pb-3' : 'p-2 sm:p-4'} border-b border-endfield-gray-light`}>
          <CollapsibleSection
            title={t('cycleChart')}
            collapsed={collapsedSections.chart}
            onToggle={() => toggleSection('chart')}
            icon="monitoring"
            expandLabel={t('expandSection')}
            collapseLabel={t('collapseSection')}
          >
            <ChartSection
              solution={selectedSolution}
              targetPower={params.targetPower}
              minBatteryThreshold={params.minBatteryPercent}
              preciseValues={preciseValues}
              setPreciseValues={setPreciseValues}
              hideHoverDetails={hideHoverDetails}
              setHideHoverDetails={setHideHoverDetails}
            />
          </CollapsibleSection>
        </div>

        {selectedSolution.fuelConsumption && (
          <div className={`${collapsedSections.fuel ? 'px-2 sm:px-4 pt-2 sm:pt-4 pb-2 sm:pb-3' : 'p-2 sm:p-4'} border-b border-endfield-gray-light`}>
            <CollapsibleSection
              title={t('fuelConsumption')}
              collapsed={collapsedSections.fuel}
              onToggle={() => toggleSection('fuel')}
              icon="local_fire_department"
              expandLabel={t('expandSection')}
              collapseLabel={t('collapseSection')}
            >
              <FuelConsumptionTable solution={selectedSolution} locale={locale} />
            </CollapsibleSection>
          </div>
        )}

        <div className={collapsedSections.diagram ? 'px-2 sm:px-4 pt-2 sm:pt-4 pb-2 sm:pb-3' : 'p-2 sm:p-4'}>
          <CollapsibleSection
            title={t('solutionDiagram')}
            collapsed={collapsedSections.diagram}
            onToggle={() => toggleSection('diagram')}
            icon="account_tree"
            expandLabel={t('expandSection')}
            collapseLabel={t('collapseSection')}
          >
            <SolutionDiagram solution={selectedSolution} params={params} />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
