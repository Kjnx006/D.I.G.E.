import { useI18n } from '../i18n';
import { FUEL_OPTIONS, SECONDARY_FUEL_OPTIONS } from '../utils/constants';

export default function Sidebar({ params, setParams, collapsed, onClose }) {
  const { t, locale } = useI18n();
  
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
          <span className="text-sm font-bold text-white">{t('constraints')}</span>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-endfield-text hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Sidebar Content */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 ${collapsed ? 'hidden' : ''}`}>
      {/* 目标发电量 */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-endfield-yellow">target</span>
          {t('targetPower')}
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs text-endfield-text">{t('power')} (w)</label>
            <span className="text-xs font-mono text-endfield-yellow">{params.targetPower}</span>
          </div>
          <input
            type="number"
            value={params.targetPower}
            onChange={(e) => handleChange('targetPower', parseInt(e.target.value) || 0)}
            className="w-full bg-endfield-gray border border-endfield-gray-light px-3 py-2 text-sm font-mono text-white focus:border-endfield-yellow focus:outline-none"
          />
        </div>
      </div>

      <div className="h-px bg-endfield-gray-light"></div>

      {/* 约束条件 */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-endfield-yellow">tune</span>
          {t('constraints')}
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs text-endfield-text">{t('minBatteryPercent')}</label>
            <span className="text-xs font-mono text-white">{params.minBatteryPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.minBatteryPercent}
            onChange={(e) => handleChange('minBatteryPercent', parseInt(e.target.value))}
            className="w-full h-1 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs text-endfield-text">{t('maxWaste')}</label>
            <span className="text-xs font-mono text-white">{params.maxWaste} w</span>
          </div>
          <input
            type="number"
            value={params.maxWaste}
            onChange={(e) => handleChange('maxWaste', parseInt(e.target.value) || 0)}
            className="w-full bg-endfield-gray border border-endfield-gray-light px-3 py-1.5 text-xs font-mono text-white focus:border-endfield-yellow focus:outline-none"
          />
        </div>
      </div>

      <div className="h-px bg-endfield-gray-light"></div>

      {/* 燃料选择 */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-endfield-yellow">local_gas_station</span>
          {t('fuelConfig')}
        </h3>

        <div className="space-y-2">
          <label className="text-xs text-endfield-text">{t('primaryFuel')}</label>
          <select
            value={params.primaryFuelId}
            onChange={(e) => handleChange('primaryFuelId', e.target.value)}
            className="w-full bg-endfield-gray border border-endfield-gray-light px-3 py-2 text-sm text-white focus:border-endfield-yellow focus:outline-none cursor-pointer"
          >
            {FUEL_OPTIONS.map(fuel => (
              <option key={fuel.id} value={fuel.id}>
                {getFuelName(fuel)} ({fuel.power}w / {fuel.burnTime}s)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-endfield-text">{t('secondaryFuel')}</label>
          <select
            value={params.secondaryFuelId}
            onChange={(e) => handleChange('secondaryFuelId', e.target.value)}
            className="w-full bg-endfield-gray border border-endfield-gray-light px-3 py-2 text-sm text-white focus:border-endfield-yellow focus:outline-none cursor-pointer"
          >
            {SECONDARY_FUEL_OPTIONS.map(fuel => (
              <option key={fuel.id} value={fuel.id}>
                {getFuelName(fuel)} {fuel.power > 0 ? `(${fuel.power}w / ${fuel.burnTime}s)` : ''}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-endfield-text/50">{t('secondaryFuelHint')}</p>
        </div>
      </div>

      <div className="h-px bg-endfield-gray-light"></div>

        {/* 系统信息 */}
        <div className="space-y-2 text-[10px] text-endfield-text/70 font-mono">
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
      </div>
    </aside>
    </>
  );
}
