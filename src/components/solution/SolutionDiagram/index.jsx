import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import Icon from '../../ui/Icon';
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
  const pinchRef = useRef({ initialDistance: 0, initialZoom: 1 });
  const blueprintContainerRef = useRef(null);

  const clampZoom = useCallback((z) => Math.max(BLUEPRINT_ZOOM_MIN, Math.min(BLUEPRINT_ZOOM_MAX, z)), []);

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
            <span className="text-sm text-endfield-text">x {oscillatingFuel ? (oscillatingFuel.name?.[locale] || oscillatingFuel.name?.en) : (solution.fuel?.name?.[locale] || solution.fuel?.name?.en)}</span>
            <span className="text-sm text-endfield-text">=</span>
            <span className="text-sm font-bold text-endfield-yellow">
              {oscillating.reduce((sum, b) => sum + b.power, 0).toFixed(0)}w
            </span>
            <span className="text-xs text-endfield-text/70">
              ({oscillating.map((b) => `${b.power.toFixed(0)}w`).join(' + ')})
            </span>
            <span className="text-xs text-endfield-text/60 ml-auto">{t('diagramViewMode')}:</span>
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

          <div
            ref={blueprintContainerRef}
            className={`flex gap-3 p-2 sm:p-3 ${mode === 'simple' ? 'flex-col' : 'flex-wrap justify-center'}`}
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
              <li>{mode === 'blueprint' ? t('diagramTutorialBlueprint') : t('diagramTutorialSimple')}</li>
              <li>{t('diagramTutorialStep4')}</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
