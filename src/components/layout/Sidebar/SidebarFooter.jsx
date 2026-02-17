import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { hasUnreadAnnouncementOrChangelog } from '../../modals/Announcement';
import Icon from '../../ui/Icon';

export default function SidebarFooter({
  collapsed,
  onCalculate,
  onOpenAnnouncement,
  onOpenPrivacyPolicy,
  onOpenQA,
  onClose,
  locale,
  calcButtonRef,
  scrollContainerRef,
}) {
  const { t, changeLocale, languageOptions } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [calcButtonVisible, setCalcButtonVisible] = useState(true);
  const [scrollHintMounted, setScrollHintMounted] = useState(false);
  const [scrollHintVisible, setScrollHintVisible] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const button = calcButtonRef?.current;
    const container = scrollContainerRef?.current;
    if (!button || !container) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCalcButtonVisible(entry.isIntersecting),
      { root: container, threshold: 0.5 }
    );
    observer.observe(button);
    return () => observer.disconnect();
  }, [calcButtonRef, scrollContainerRef]);

  const shouldShowHint = !calcButtonVisible && !collapsed;
  useEffect(() => {
    if (shouldShowHint) {
      setScrollHintMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setScrollHintVisible(true)));
    } else {
      setScrollHintVisible(false);
      const timer = setTimeout(() => setScrollHintMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShowHint]);

  const scrollToCalcButton = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const currentLang = languageOptions.find((l) => l.code === locale);

  return (
    <>
      {/* 桌面端计算按钮 */}
      <button
        ref={calcButtonRef}
        onClick={() => onCalculate?.()}
        className="hidden md:flex w-full mt-4 h-10 bg-endfield-yellow hover:bg-endfield-yellow-glow hover:-translate-y-0.5 text-endfield-black font-bold tracking-wider uppercase transition-all items-center justify-center gap-2 text-sm glow-yellow shrink-0"
      >
        <Icon name="calculate" />
        {t('calculate')}
      </button>

      {/* 移动端：常见问题、隐私声明、公告、GitHub、语言切换按钮 */}
      <div className="md:hidden mt-4 pt-4 border-t border-endfield-gray-light space-y-3">
        <button
          onClick={() => {
            onOpenQA?.();
            onClose?.();
          }}
          className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center gap-2 text-endfield-text-light hover:text-endfield-yellow"
        >
          <Icon name="help_center" />
          <span className="text-sm">{t('qa')}</span>
        </button>
        <button
          onClick={() => {
            onOpenPrivacyPolicy?.();
            onClose?.();
          }}
          className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center gap-2 text-endfield-text-light hover:text-endfield-yellow"
        >
          <Icon name="policy" />
          <span className="text-sm">{t('privacyPolicyDetails')}</span>
        </button>
        <button
          onClick={() => {
            onOpenAnnouncement?.('announcement');
            onClose?.();
          }}
          className="relative w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center gap-2 text-endfield-text-light hover:text-endfield-yellow"
        >
          <Icon name="campaign" />
          <span className="text-sm">{t('announcement')}</span>
          {hasUnreadAnnouncementOrChangelog() && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        {locale === 'zh' && (
          <a
            href="https://qm.qq.com/q/zL6wp3emTQ"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center gap-2 text-endfield-text-light hover:text-endfield-yellow"
          >
            <Icon name="group" />
            <span className="text-sm">{t('joinQQGroup')}</span>
          </a>
        )}
        <a
          href="https://github.com/djkcyl/D.I.G.E."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center gap-2 text-endfield-text-light hover:text-endfield-yellow"
        >
          <Icon icon="mdi:github" />
          <span className="text-sm">GitHub</span>
        </a>
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center gap-2 text-sm text-endfield-text-light"
          >
            <Icon name="language" />
            <span>{currentLang?.nativeName || ''}</span>
          </button>
          {showLangMenu && (
            <div className="absolute left-0 right-0 bottom-full mb-1 bg-endfield-gray border border-endfield-gray-light z-50">
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLocale(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-endfield-gray-light transition-colors ${
                    locale === lang.code ? 'text-endfield-yellow' : 'text-endfield-text-light'
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 桌面端：计算按钮不可见时的底部渐变提示 */}
      {scrollHintMounted && (
        <div
          className={`hidden md:flex absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-endfield-dark from-40% to-transparent items-end justify-center pb-3 pointer-events-none transition-all duration-300 ease-out ${
            scrollHintVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={scrollToCalcButton}
            className="pointer-events-auto px-4 py-1.5 bg-endfield-yellow/15 border border-endfield-yellow/40 hover:bg-endfield-yellow/25 transition-colors flex items-center gap-1.5 text-xs text-endfield-yellow tracking-wider"
          >
            <Icon name="keyboard_double_arrow_down" />
            {t('scrollToCalculate')}
          </button>
        </div>
      )}
    </>
  );
}
