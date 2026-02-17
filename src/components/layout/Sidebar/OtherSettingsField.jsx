import { useI18n } from '../../../i18n';
import Icon from '../../ui/Icon';
import Toggle from '../../ui/Toggle';

export default function OtherSettingsField({ params, onChange, onShowExcludeBeltWarning }) {
  const { t } = useI18n();
  const excludeBelt = params.exclude_belt !== false;

  return (
    <fieldset className="space-y-2 border-none p-0 m-0">
      <legend className="text-sm font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2 p-0">
        <Icon name="settings" className="text-endfield-yellow" />
        {t('otherSettings')}
      </legend>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-endfield-text">{t('excludeBelt')}</span>
            <button
              type="button"
              onClick={onShowExcludeBeltWarning}
              className="w-5 h-5 inline-flex items-center justify-center leading-none text-endfield-text/50 hover:text-endfield-yellow transition-colors"
              title={t('excludeBeltWarning')}
              aria-label={t('excludeBeltWarning')}
              aria-haspopup="dialog"
            >
              <Icon name="info" className="leading-none" />
            </button>
          </div>
          <Toggle
            checked={excludeBelt}
            onChange={(checked) => onChange('exclude_belt', checked)}
            ariaLabel={t('excludeBelt')}
          />
        </div>
      </div>
    </fieldset>
  );
}
