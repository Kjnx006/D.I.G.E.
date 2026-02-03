import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';

export default function Header({ onCalculate, sidebarCollapsed, onToggleSidebar, onOpenAnnouncement }) {
  const { t, locale, changeLocale, languageOptions } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const langMenuRef = useRef(null);

  const currentLang = languageOptions.find(l => l.code === locale);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className="bg-endfield-dark border-b border-endfield-gray-light p-2 sm:p-4 flex items-center justify-between shrink-0"
      role="banner"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 移动端：汉堡菜单按钮 */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden w-8 h-8 flex items-center justify-center text-endfield-yellow"
          title={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          aria-label={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          aria-expanded={!sidebarCollapsed}
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">
            {sidebarCollapsed ? 'menu' : 'close'}
          </span>
        </button>
        
        {/* 桌面端：黄色竖条/箭头 */}
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hidden md:flex w-4 items-center justify-center cursor-pointer self-stretch bg-transparent border-none p-0"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          aria-label={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          aria-expanded={!sidebarCollapsed}
        >
          <div
            className="h-full transition-all duration-200 bg-endfield-yellow animate-pulse-glow"
            style={{
              width: isHovered ? '12px' : '4px',
              clipPath: isHovered 
                ? (sidebarCollapsed 
                    ? 'polygon(0 0, 100% 50%, 0 100%)' 
                    : 'polygon(0 50%, 100% 0, 100% 100%)')
                : 'none',
            }}
            aria-hidden="true"
          />
        </button>
        {/* 标题区域 */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-endfield-text-light tracking-widest uppercase">
              {t('appTitle')}
            </h1>
            <span className="hidden sm:inline text-xs text-endfield-yellow border border-endfield-yellow/30 bg-endfield-yellow/5 px-1.5 py-px">
              v{__APP_VERSION__}
            </span>
          </div>
          <p className="hidden md:block text-sm text-endfield-text tracking-wider mt-0.5">
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Announcement Button - 桌面端显示 */}
        <button
          onClick={onOpenAnnouncement}
          className="hidden md:flex h-10 w-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors items-center justify-center text-endfield-text-light hover:text-endfield-yellow cursor-pointer"
          title={t('announcement')}
          aria-label={t('announcement')}
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">campaign</span>
        </button>

        {/* GitHub Link - 桌面端显示 */}
        <a
          href="https://github.com/djkcyl/D.I.G.E."
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex h-10 w-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors items-center justify-center text-endfield-text-light hover:text-endfield-yellow"
          title="GitHub"
          aria-label="GitHub 项目页面"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>

        {/* Language Switcher - 桌面端显示 */}
        <nav className="relative hidden md:block" ref={langMenuRef} aria-label="语言切换">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="h-10 px-3 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center gap-2 text-sm text-endfield-text-light cursor-pointer"
            aria-expanded={showLangMenu}
            aria-haspopup="listbox"
            aria-label={`当前语言: ${currentLang?.name}, 点击切换语言`}
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">language</span>
            <span>{currentLang?.name}</span>
          </button>

          {showLangMenu && (
            <ul className="absolute right-0 top-full mt-1 bg-endfield-gray border border-endfield-gray-light z-50 min-w-[140px] list-none p-0 m-0" role="listbox" aria-label="选择语言">
              {languageOptions.map((lang) => (
                <li key={lang.code} role="option" aria-selected={locale === lang.code}>
                  <button
                    onClick={() => {
                      changeLocale(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-endfield-gray-light transition-colors cursor-pointer
                      ${locale === lang.code ? 'text-endfield-yellow' : 'text-endfield-text-light'}`}
                    lang={lang.code}
                  >
                    {lang.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* 移动端计算按钮 */}
        <button
          onClick={() => onCalculate()}
          className="md:hidden h-9 px-3 bg-endfield-yellow hover:bg-endfield-yellow-glow text-endfield-black font-bold tracking-wider transition-all flex items-center gap-1.5 text-sm glow-yellow"
          aria-label={t('calculate')}
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">calculate</span>
        </button>
      </div>
    </header>
  );
}
