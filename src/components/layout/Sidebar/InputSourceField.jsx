import { useI18n } from '../../../i18n';
import Icon from '../../ui/Icon';
import { INPUT_SOURCES, INPUT_SOURCE_OPTIONS, DEFAULT_INPUT_SOURCE_ID } from '../../../utils/constants';

export default function InputSourceField({ params, onChange, locale, onShowInputWarning }) {
  const { t } = useI18n();

  const selectedInputSourceId = params.inputSourceId || DEFAULT_INPUT_SOURCE_ID;
  const inputSource = INPUT_SOURCES[selectedInputSourceId] || INPUT_SOURCES[DEFAULT_INPUT_SOURCE_ID];
  const getInputSourceName = (source) => source?.name?.[locale] || source?.name?.en || '';

  return (
    <fieldset className="space-y-2 border-none p-0 m-0">
      <legend className="text-sm font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2 p-0">
        <Icon name="input" className="text-endfield-yellow" />
        {t('inputSource')}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {INPUT_SOURCE_OPTIONS.map((source) => (
          <button
            key={source.id}
            type="button"
            onClick={() => onChange('inputSourceId', source.id)}
            className={`h-10 px-2 border text-xs sm:text-sm transition-colors ${
              selectedInputSourceId === source.id
                ? 'text-endfield-yellow border-endfield-yellow bg-endfield-yellow/10'
                : 'text-endfield-text-light border-endfield-gray-light hover:border-endfield-text'
            }`}
          >
            {getInputSourceName(source)}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-endfield-text/50">
        <span className="leading-normal">
          {t('inputSpeed')}: {inputSource?.speed} {t('itemPerSec')}
          {selectedInputSourceId === 'packer' ? ` (${t('inputHintPacker')})` : ''}
        </span>
        {selectedInputSourceId === 'packer' && (
          <button
            type="button"
            onClick={onShowInputWarning}
            className="w-5 h-5 inline-flex items-center justify-center leading-none text-endfield-text/50 hover:text-endfield-yellow transition-colors"
            title={t('inputWarningPacker')}
            aria-label={t('inputWarningPacker')}
            aria-haspopup="dialog"
          >
            <Icon name="info" className="leading-none" />
          </button>
        )}
      </div>
    </fieldset>
  );
}
