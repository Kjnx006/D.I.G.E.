import { useI18n } from '../../../i18n';
import Icon from '../../ui/Icon';
import Toggle from '../../ui/Toggle';
import SidebarSection from './SidebarSection';

export default function OtherSettingsField({ params, onChange, onShowExcludeBeltWarning }) {
  const { t } = useI18n();
  const excludeBelt = params.exclude_belt !== false;

  return (
    <SidebarSection icon="settings" title={t('otherSettings')} className="space-y-2">
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
    </SidebarSection>
  );
}
