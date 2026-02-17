import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import {
  downloadEndfieldBlueprint,
  downloadEndfieldBlueprintZip,
} from '../../../utils/endfieldBlueprint';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';
import SimpleBranch from './SimpleBranch';
import BlueprintBranch from './BlueprintBranch';
import BlueprintLegend from './BlueprintLegend';
import SimpleLegend from './SimpleLegend';
import DiagramConfig from './DiagramConfig';

const BLUEPRINT_ZOOM_MIN = 1;
const BLUEPRINT_ZOOM_MAX = 3;

export default function SolutionDiagram({ solution }) {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState('blueprint');
  const [blueprintZoom, setBlueprintZoom] = useState(1);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const pinchRef = useRef({ initialDistance: 0, initialZoom: 1 });
  const blueprintContainerRef = useRef(null);

  const clampZoom = useCallback(
    (z) => Math.max(BLUEPRINT_ZOOM_MIN, Math.min(BLUEPRINT_ZOOM_MAX, z)),
    [],
  );

  const handleBlueprintWheel = useCallback(
    (e) => {
      if (mode !== 'blueprint') return;
      e.preventDefault();
      const delta = -e.deltaY * 0.002;
      setBlueprintZoom((z) => clampZoom(z + delta));
    },
    [mode, clampZoom],
  );

  const handleBlueprintTouchStart = useCallback(
    (e) => {
      if (mode !== 'blueprint' || e.touches.length !== 2) return;
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY,
      );
      pinchRef.current = { initialDistance: dist, initialZoom: blueprintZoom };
    },
    [mode, blueprintZoom],
  );

  const handleBlueprintTouchMove = useCallback(
    (e) => {
      if (e.touches.length !== 2 || !pinchRef.current.initialDistance) return;
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY,
      );
      const { initialDistance, initialZoom } = pinchRef.current;
      const scale = dist / initialDistance;
      setBlueprintZoom(clampZoom(initialZoom * scale));
    },
    [clampZoom],
  );

  const handleBlueprintTouchEnd = useCallback(() => {
    pinchRef.current = { initialDistance: 0, initialZoom: 1 };
  }, []);

  const handleOpenExportModal = useCallback(() => {
    setExportModalOpen(true);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    setExportModalOpen(false);
  }, []);

  useEffect(() => {
    if (mode !== 'blueprint') setBlueprintZoom(1);
  }, [mode]);

  if (!solution) {
    return (
      <div className="h-32 flex items-center justify-center text-endfield-text text-sm">
        {t('noSolutionData')}
      </div>
    );
  }

  const { oscillating, oscillatingFuel, inputSourceId, exclude_belt } = solution;
  const showPackerWarning = inputSourceId === 'packer';
  const showExcludeBeltWarning = exclude_belt === false;
  const canExportBlueprint =
    mode === 'blueprint' && Array.isArray(oscillating) && oscillating.length > 0;

  const handleExportSingleBranch = useCallback(
    (branchIndex) => {
      const branch = oscillating?.[branchIndex];
      if (!branch) return;
      try {
        const denominator = Number(branch.denominator);
        const safeDenominator =
          Number.isFinite(denominator) && denominator > 0 ? denominator : 'unknown';
        downloadEndfieldBlueprint(branch, {
          filename: `dige_branch_${branchIndex + 1}_1_${safeDenominator}.json`,
        });
      } catch (error) {
        console.error('Blueprint export failed:', error);
      }
    },
    [oscillating],
  );

  const handleExportAllBranchesZip = useCallback(() => {
    if (!Array.isArray(oscillating) || oscillating.length === 0) return;
    try {
      const totalPower = oscillating.reduce((sum, branch) => {
        const branchPower = Number(branch?.power);
        return sum + (Number.isFinite(branchPower) ? branchPower : 0);
      }, 0);
      const powerToken = `${Math.round(totalPower)}w`;

      downloadEndfieldBlueprintZip(oscillating, {
        filename: `dige_branches_all_${oscillating.length}_${powerToken}.zip`,
      });
      setExportModalOpen(false);
    } catch (error) {
      console.error('Blueprint zip export failed:', error);
    }
  }, [oscillating]);

  return (
    <div className="space-y-2 sm:space-y-3 notranslate" translate="no">
      {showPackerWarning && (
        <div className="p-2.5 bg-red-900/20 border border-red-900/50 text-sm text-red-300 flex items-center gap-2">
          <Icon name="warning" />
          <span>{t('inputWarningPacker')}</span>
        </div>
      )}

      {showExcludeBeltWarning && (
        <div className="p-2.5 bg-red-900/20 border border-red-900/50 text-sm text-red-300 flex items-center gap-2">
          <Icon name="warning" />
          <span>{t('excludeBeltWarning')}</span>
        </div>
      )}

      <DiagramConfig solution={solution} locale={locale} />

      {oscillating && oscillating.length > 0 && (
        <div className="border border-endfield-gray-light bg-endfield-gray/30">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-endfield-gray-light bg-endfield-gray/50">
            <Icon name="electric_bolt" className="text-endfield-yellow" />
            <span className="text-sm text-endfield-text uppercase">{t('oscillatingShort')}:</span>
            <span className="text-sm font-bold text-endfield-text-light">{oscillating.length}</span>
            <span className="text-sm text-endfield-text">
              x{' '}
              {oscillatingFuel
                ? oscillatingFuel.name?.[locale] || oscillatingFuel.name?.en
                : solution.fuel?.name?.[locale] || solution.fuel?.name?.en}
            </span>
            <span className="text-sm text-endfield-text">=</span>
            <span className="text-sm font-bold text-endfield-yellow">
              {oscillating.reduce((sum, b) => sum + b.power, 0).toFixed(0)}w
            </span>
            <span className="text-xs text-endfield-text/70">
              ({oscillating.map((b) => `${b.power.toFixed(0)}w`).join(' + ')})
            </span>
            <div className="ml-auto flex items-center gap-2">
              {canExportBlueprint && (
                <button
                  type="button"
                  onClick={handleOpenExportModal}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs border border-endfield-gray-light text-endfield-text-light bg-endfield-gray/80 hover:text-endfield-yellow hover:border-endfield-yellow transition-colors"
                  title={t('exportBlueprintJson')}
                  aria-label={t('exportBlueprintJson')}
                >
                  <Icon name="download" className="w-4 h-4" />
                  <span>{t('exportBlueprintJson')}</span>
                </button>
              )}
              <div className="inline-flex border border-endfield-gray-light bg-endfield-gray/80">
                <button
                  type="button"
                  onClick={() => setMode('blueprint')}
                  className={`px-2 py-1 text-xs transition-colors ${
                    mode === 'blueprint'
                      ? 'text-endfield-yellow bg-endfield-yellow/10'
                      : 'text-endfield-text-light hover:text-endfield-yellow'
                  }`}
                >
                  {t('blueprintMode')}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('simple')}
                  className={`px-2 py-1 text-xs border-l border-endfield-gray-light transition-colors ${
                    mode === 'simple'
                      ? 'text-endfield-yellow bg-endfield-yellow/10'
                      : 'text-endfield-text-light hover:text-endfield-yellow'
                  }`}
                >
                  {t('simpleMode')}
                </button>
              </div>
            </div>
          </div>

          <div
            ref={blueprintContainerRef}
            className={`flex gap-3 p-2 sm:p-3 ${
              mode === 'simple' ? 'flex-col' : 'flex-wrap justify-center'
            }`}
          >
            {oscillating.map((branch, idx) => (
              <div
                key={idx}
                className={mode === 'simple' ? 'w-full' : 'min-w-[min(100%,360px)]'}
                style={mode === 'blueprint' ? { zoom: blueprintZoom } : undefined}
              >
                {mode === 'simple' ? (
                  <SimpleBranch branch={branch} t={t} />
                ) : (
                  <BlueprintBranch
                    branch={branch}
                    zoom={blueprintZoom}
                    onWheelZoom={handleBlueprintWheel}
                    onTouchStart={handleBlueprintTouchStart}
                    onTouchMove={handleBlueprintTouchMove}
                    onTouchEnd={handleBlueprintTouchEnd}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {oscillating && oscillating.length > 0 && (
        <div className="border border-endfield-gray-light bg-endfield-gray/20 p-3 sm:p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-xs font-bold text-endfield-text uppercase tracking-widest">
                {t('diagramLegend')}
              </div>
              <div className="text-[10px] sm:text-xs text-endfield-text/60">
                {mode === 'blueprint' ? t('blueprintMode') : t('simpleMode')}
              </div>
            </div>
            {mode === 'blueprint' ? <BlueprintLegend t={t} /> : <SimpleLegend t={t} />}
          </div>

          <div className="pt-3 border-t border-endfield-gray-light/70">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-xs font-bold text-endfield-text uppercase tracking-widest">
                {t('diagramTutorial')}
              </div>
              <div className="text-[10px] sm:text-xs text-endfield-text/60">
                {mode === 'blueprint' ? t('blueprintMode') : t('simpleMode')}
              </div>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-endfield-text/80">
              <li>{t('diagramTutorialStep1')}</li>
              <li>{t('diagramTutorialStep2')}</li>
              <li>
                {mode === 'blueprint' ? t('diagramTutorialBlueprint') : t('diagramTutorialSimple')}
              </li>
              <li>{t('diagramTutorialStep4')}</li>
            </ol>
          </div>
        </div>
      )}

      {oscillating && oscillating.length > 0 && (
        <Modal
          show={exportModalOpen}
          onClose={handleCloseExportModal}
          ariaLabelledby="export-blueprint-title"
          title={
            <>
              <Icon name="download" className="text-endfield-yellow" />
              <h2
                id="export-blueprint-title"
                className="text-base font-bold text-endfield-text-light uppercase tracking-wider"
              >
                {t('exportBlueprintJson')}
              </h2>
            </>
          }
          contentClassName="max-w-md"
        >
          <div className="space-y-3">
            <p className="text-xs text-endfield-text/70">{t('selectExportBranch')}</p>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {oscillating.map((branch, idx) => (
                <div
                  key={idx}
                  className="w-full border border-endfield-gray-light bg-endfield-gray/40 px-3 py-2 flex items-center justify-between gap-2 transition-colors hover:border-endfield-yellow/70 hover:bg-endfield-gray/70"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-endfield-text-light">
                      {t('branch')} {idx + 1}
                    </div>
                    <div className="text-xs text-endfield-text/80">
                      1/{branch.denominator} | {branch.power.toFixed(0)}w
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportSingleBranch(idx)}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs border border-endfield-gray-light text-endfield-text-light bg-endfield-gray/80 hover:text-endfield-yellow hover:border-endfield-yellow transition-colors"
                  >
                    <Icon name="download" className="w-4 h-4" />
                    {t('downloadSingleBranch')}
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportAllBranchesZip}
                className="h-10 bg-endfield-yellow hover:bg-endfield-yellow-glow text-endfield-black font-bold tracking-wider transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Icon name="folder_zip" className="w-4 h-4" />
                {t('downloadAllBranchesZip')}
              </button>
              <button
                type="button"
                onClick={handleCloseExportModal}
                className="h-10 w-full bg-endfield-gray hover:border-endfield-yellow border border-endfield-gray-light text-endfield-text-light font-bold tracking-wider transition-all flex items-center justify-center gap-2 text-sm"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
