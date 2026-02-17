import { useI18n } from '../../i18n';
import Icon from '../ui/Icon';

const MENU_ITEM_CLASS = 'w-full px-3 py-2.5 flex items-center gap-2 text-left text-sm text-endfield-text-light hover:bg-endfield-gray-light hover:text-endfield-yellow';

export default function HeaderMoreMenu({ onClose, onOpenPrivacyPolicy, onOpenQA }) {
  const { t, locale, changeLocale, languageOptions } = useI18n();

  const closeAnd = (fn) => () => { fn(); onClose(); };

  return (
    <ul
      className="absolute right-0 top-full mt-1 bg-endfield-gray border border-endfield-gray-light z-50 min-w-[180px] list-none p-0 m-0 shadow-xl"
      role="menu"
    >
      <li role="none">
        <button type="button" onClick={closeAnd(onOpenPrivacyPolicy)} className={MENU_ITEM_CLASS} role="menuitem">
          <Icon name="policy" className="text-base" />
          {t('privacyPolicyDetails')}
        </button>
      </li>
      <li role="none">
        <button type="button" onClick={closeAnd(onOpenQA)} className={MENU_ITEM_CLASS} role="menuitem">
          <Icon name="help_center" className="text-base" />
          {t('qa')}
        </button>
      </li>
      <li role="none">
        <a
          href="https://github.com/djkcyl/D.I.G.E."
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className={MENU_ITEM_CLASS}
          role="menuitem"
        >
          <Icon icon="mdi:github" className="text-base" />
          GitHub
        </a>
      </li>
      <li className="border-t border-endfield-gray-light" role="none">
        <div className="px-3 py-2 text-xs text-endfield-text/70">{t('language')}</div>
        {languageOptions.map((lang) => (
          <button
            key={lang.code}
            onClick={() => { changeLocale(lang.code); onClose(); }}
            className={`w-full px-3 py-1.5 pl-6 text-left text-sm hover:bg-endfield-gray-light transition-colors ${
              locale === lang.code ? 'text-endfield-yellow' : 'text-endfield-text-light'
            }`}
            role="menuitem"
            lang={lang.code}
          >
            {lang.nativeName}
          </button>
        ))}
      </li>
    </ul>
  );
}
