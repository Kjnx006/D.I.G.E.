import { useState } from 'react';
import { useI18n } from '../i18n';

export default function Header({ onCalculate, sidebarCollapsed, onToggleSidebar }) {
  const { t, locale, changeLocale, languageOptions } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const currentLang = languageOptions.find(l => l.code === locale);

  return (
    <header className="bg-endfield-dark border-b border-endfield-gray-light p-2 sm:p-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 h-8 sm:h-10">
        {/* 移动端：汉堡菜单按钮 */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden w-8 h-8 flex items-center justify-center text-endfield-yellow"
          title={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
        >
          <span className="material-symbols-outlined text-xl">
            {sidebarCollapsed ? 'menu' : 'close'}
          </span>
        </button>
        
        {/* 桌面端：黄色竖条/箭头 */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hidden md:flex w-4 h-full items-center justify-start cursor-pointer self-stretch"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
        >
          <div
            className="h-full transition-all duration-200 bg-endfield-yellow"
            style={{
              width: isHovered ? '12px' : '4px',
              clipPath: isHovered 
                ? (sidebarCollapsed 
                    ? 'polygon(0 0, 100% 50%, 0 100%)' 
                    : 'polygon(0 50%, 100% 0, 100% 100%)')
                : 'none',
            }}
          />
        </div>
        {/* 标题区域 */}
        <div className="flex flex-col justify-center h-full">
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-widest uppercase">
              {t('appTitle')}
            </h1>
            <span className="hidden sm:inline text-[9px] text-endfield-yellow border border-endfield-yellow/30 bg-endfield-yellow/5 px-1.5 py-px">
              {t('appVersion')}
            </span>
          </div>
          <p className="hidden sm:block text-[10px] text-endfield-text font-mono tracking-wider mt-0.5">
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="h-8 sm:h-9 px-2 sm:px-3 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-endfield-text-light"
          >
            <span className="material-symbols-outlined text-sm sm:text-base">language</span>
            <span className="hidden sm:inline">{currentLang?.name}</span>
            <span className="material-symbols-outlined text-sm sm:text-base">
              {showLangMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-full mt-1 bg-endfield-gray border border-endfield-gray-light z-50 min-w-[140px]">
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLocale(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-endfield-gray-light transition-colors
                    ${locale === lang.code ? 'text-endfield-yellow' : 'text-endfield-text-light'}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onCalculate}
          className="h-8 sm:h-9 px-3 sm:px-4 bg-endfield-yellow hover:bg-endfield-yellow-glow text-endfield-black font-bold tracking-wider transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm glow-yellow"
        >
          <span className="material-symbols-outlined text-sm sm:text-base">calculate</span>
          <span className="hidden sm:inline">{t('calculate')}</span>
        </button>
      </div>
    </header>
  );
}
