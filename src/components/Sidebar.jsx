import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import { FUEL_OPTIONS, SECONDARY_FUEL_OPTIONS } from '../utils/constants';

export default function Sidebar({ params, setParams, collapsed, onClose, onCalculate, onOpenAnnouncement }) {
  const { t, locale, changeLocale, languageOptions } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showPrimaryFuelMenu, setShowPrimaryFuelMenu] = useState(false);
  const [showSecondaryFuelMenu, setShowSecondaryFuelMenu] = useState(false);

  const primaryFuelRef = useRef(null);
  const secondaryFuelRef = useRef(null);
  const langMenuRef = useRef(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (primaryFuelRef.current && !primaryFuelRef.current.contains(event.target)) {
        setShowPrimaryFuelMenu(false);
      }
      if (secondaryFuelRef.current && !secondaryFuelRef.current.contains(event.target)) {
        setShowSecondaryFuelMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const getFuelName = (fuel) => {
    return fuel.name[locale] || fuel.name.en;
  };

  return (
    <>
      {/* 移动端背景遮罩 - 使用 CSS 控制显示 */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        ${collapsed ? 'w-0' : 'w-72 sm:w-80'} 
        bg-endfield-dark/95 md:bg-endfield-dark/80 
        border-r border-endfield-gray-light 
        overflow-hidden flex flex-col shrink-0 
        transition-all duration-300
        fixed md:relative inset-y-0 left-0 z-30 md:z-10
        ${collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}>
        {/* 移动端关闭按钮 */}
        <div className={`md:hidden shrink-0 p-3 border-b border-endfield-gray-light flex items-center justify-between ${collapsed ? 'hidden' : ''}`}>
          <span className="text-sm font-bold text-endfield-text-light">{t('constraints')}</span>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-endfield-text hover:text-endfield-text-light"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Sidebar Content */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 ${collapsed ? 'hidden' : ''}`}>
      {/* 目标发电量 */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-endfield-yellow">target</span>
          {t('targetPower')}
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-endfield-text">{t('power')} (w)</label>
            <span className="text-sm text-endfield-yellow">{params.targetPower}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={params.targetPower}
              onChange={(e) => handleChange('targetPower', parseInt(e.target.value) || 0)}
              className="flex-1 bg-endfield-gray border border-endfield-gray-light px-3 py-2 text-sm text-endfield-text-light focus:border-endfield-yellow focus:outline-none"
            />
            <button
              onClick={() => {
                const newPower = Math.floor(Math.random() * 4500) + 500;
                handleChange('targetPower', newPower);
                // 延迟一帧确保状态更新后再计算
                setTimeout(() => onCalculate(), 0);
              }}
              className="w-10 h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center text-endfield-text-light hover:text-endfield-yellow cursor-pointer"
              title={t('random')}
            >
              <span className="material-symbols-outlined text-base">casino</span>
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-endfield-gray-light"></div>

      {/* 约束条件 */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-endfield-yellow">tune</span>
          {t('constraints')}
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-endfield-text">{t('minBatteryPercent')}</label>
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={params.minBatteryPercent}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                  handleChange('minBatteryPercent', val);
                }}
                className="w-12 bg-transparent border-b border-endfield-gray-light px-1 py-0.5 text-sm text-endfield-text-light text-right focus:border-endfield-yellow focus:outline-none"
              />
              <span className="text-sm text-endfield-text-light">%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.minBatteryPercent}
            onChange={(e) => handleChange('minBatteryPercent', parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-endfield-text">{t('maxWaste')}</label>
            <span className="text-sm text-endfield-text-light">{params.maxWaste} w</span>
          </div>
          <input
            type="number"
            value={params.maxWaste}
            onChange={(e) => handleChange('maxWaste', parseInt(e.target.value) || 0)}
            className="w-full bg-endfield-gray border border-endfield-gray-light px-3 py-2 text-sm text-endfield-text-light focus:border-endfield-yellow focus:outline-none"
          />
        </div>
      </div>

      <div className="h-px bg-endfield-gray-light"></div>

      {/* 燃料选择 */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-endfield-yellow">local_gas_station</span>
          {t('fuelConfig')}
        </h3>

        {/* 主燃料 */}
        <div className="space-y-2">
          <label className="text-sm text-endfield-text">{t('primaryFuel')}</label>
          <div className="relative" ref={primaryFuelRef}>
            <button
              onClick={() => {
                setShowPrimaryFuelMenu(!showPrimaryFuelMenu);
                setShowSecondaryFuelMenu(false);
              }}
              className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-between px-3 text-sm text-endfield-text-light cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {(() => {
                  const fuel = FUEL_OPTIONS.find(f => f.id === params.primaryFuelId);
                  if (!fuel) return '';
                  return (
                    <>
                      {fuel.image && <img src={fuel.image} alt={getFuelName(fuel)} className="w-6 h-6 object-contain" />}
                      <span>{getFuelName(fuel)}</span>
                    </>
                  );
                })()}
              </span>
              <span className="material-symbols-outlined text-base">
                {showPrimaryFuelMenu ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showPrimaryFuelMenu && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-endfield-gray border border-endfield-gray-light z-50 max-h-60 overflow-y-auto">
                {FUEL_OPTIONS.map((fuel) => (
                  <button
                    key={fuel.id}
                    onClick={() => {
                      handleChange('primaryFuelId', fuel.id);
                      setShowPrimaryFuelMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-endfield-gray-light transition-colors cursor-pointer flex items-center gap-2
                      ${params.primaryFuelId === fuel.id ? 'text-endfield-yellow' : 'text-endfield-text-light'}`}
                  >
                    {fuel.image && <img src={fuel.image} alt={getFuelName(fuel)} className="w-6 h-6 object-contain" />}
                    <span>{getFuelName(fuel)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {(() => {
            const fuel = FUEL_OPTIONS.find(f => f.id === params.primaryFuelId);
            if (!fuel) return null;
            return (
              <p className="text-sm text-endfield-text/70">
                {fuel.power}w / {fuel.burnTime}s
              </p>
            );
          })()}
        </div>

        {/* 副燃料 */}
        <div className="space-y-2">
          <label className="text-sm text-endfield-text">{t('secondaryFuel')}</label>
          <div className="relative" ref={secondaryFuelRef}>
            <button
              onClick={() => {
                setShowSecondaryFuelMenu(!showSecondaryFuelMenu);
                setShowPrimaryFuelMenu(false);
              }}
              className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-between px-3 text-sm text-endfield-text-light cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {(() => {
                  const fuel = SECONDARY_FUEL_OPTIONS.find(f => f.id === params.secondaryFuelId);
                  if (!fuel) return '';
                  return (
                    <>
                      {fuel.image && <img src={fuel.image} alt={getFuelName(fuel)} className="w-6 h-6 object-contain" />}
                      <span>{getFuelName(fuel)}</span>
                    </>
                  );
                })()}
              </span>
              <span className="material-symbols-outlined text-base">
                {showSecondaryFuelMenu ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showSecondaryFuelMenu && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-endfield-gray border border-endfield-gray-light z-50 max-h-60 overflow-y-auto">
                {SECONDARY_FUEL_OPTIONS.map((fuel) => (
                  <button
                    key={fuel.id}
                    onClick={() => {
                      handleChange('secondaryFuelId', fuel.id);
                      setShowSecondaryFuelMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-endfield-gray-light transition-colors cursor-pointer flex items-center gap-2
                      ${params.secondaryFuelId === fuel.id ? 'text-endfield-yellow' : 'text-endfield-text-light'}`}
                  >
                    {fuel.image && <img src={fuel.image} alt={getFuelName(fuel)} className="w-6 h-6 object-contain" />}
                    <span>{getFuelName(fuel)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {(() => {
            const fuel = SECONDARY_FUEL_OPTIONS.find(f => f.id === params.secondaryFuelId);
            if (!fuel || fuel.power === 0) {
              return <p className="text-sm text-endfield-text/50">{t('secondaryFuelHint')}</p>;
            }
            return (
              <p className="text-sm text-endfield-text/70">
                {fuel.power}w / {fuel.burnTime}s
              </p>
            );
          })()}
        </div>
      </div>

      <div className="h-px bg-endfield-gray-light"></div>

        {/* 系统信息 */}
        <div className="space-y-2 text-sm text-endfield-text/70">
          <div className="flex justify-between">
            <span>{t('basePower')}:</span>
            <span className="text-endfield-text-light">200 w</span>
          </div>
          <div className="flex justify-between">
            <span>{t('beltSpeed')}:</span>
            <span className="text-endfield-text-light">0.5 {t('itemPerSec')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('batteryCapacity')}:</span>
            <span className="text-endfield-text-light">100,000 J</span>
          </div>
        </div>

        {/* 桌面端计算按钮 */}
        <button
          onClick={onCalculate}
          className="hidden md:flex w-full mt-4 h-10 bg-endfield-yellow hover:bg-endfield-yellow-glow text-endfield-black font-bold tracking-wider transition-all items-center justify-center gap-2 text-sm glow-yellow"
        >
          <span className="material-symbols-outlined text-base">calculate</span>
          {t('calculate')}
        </button>

        {/* 移动端：公告、GitHub、语言切换按钮 */}
        <div className="md:hidden mt-4 pt-4 border-t border-endfield-gray-light space-y-3">
          {/* 公告按钮 */}
          <button
            onClick={() => {
              onOpenAnnouncement();
              onClose();
            }}
            className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center gap-2 text-endfield-text-light hover:text-endfield-yellow cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">campaign</span>
            <span className="text-sm">{t('announcement')}</span>
          </button>

          {/* GitHub 链接 */}
          <a
            href="https://github.com/djkcyl/D.I.G.E."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center gap-2 text-endfield-text-light hover:text-endfield-yellow"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="text-sm">GitHub</span>
          </a>

          {/* 语言切换 */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-full h-10 bg-endfield-gray border border-endfield-gray-light hover:border-endfield-yellow transition-colors flex items-center justify-center gap-2 text-sm text-endfield-text-light cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">language</span>
              <span>{languageOptions.find(l => l.code === locale)?.name}</span>
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
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-endfield-gray-light transition-colors cursor-pointer
                      ${locale === lang.code ? 'text-endfield-yellow' : 'text-endfield-text-light'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
