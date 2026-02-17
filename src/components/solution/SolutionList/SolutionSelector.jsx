import { useI18n } from '../../../i18n';

export default function SolutionSelector({ solutions, selectedIndex, onSelectSolution }) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <span className="text-sm text-endfield-text uppercase tracking-widest">{t('selectSolution')}:</span>
      <div className="flex gap-1">
        {solutions.map((_, idx) => (
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
  );
}
