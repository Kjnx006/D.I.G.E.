export default function BlueprintLegend({ t }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-endfield-text-light">
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <div className="h-6 w-6 border border-endfield-gray-light bg-endfield-black/50 flex items-center justify-center overflow-hidden shrink-0">
          <img src="/svg/bg_logistic_log_splitter.png" alt="" draggable={false} className="w-full h-full object-contain pointer-events-none" style={{ transform: 'rotate(-90deg)' }} />
        </div>
        <span>{t('legendBlueprintS')}</span>
      </div>
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <div className="h-6 w-6 border border-endfield-gray-light bg-endfield-black/50 flex items-center justify-center overflow-hidden shrink-0">
          <img src="/svg/bg_logistic_log_converger.png" alt="" draggable={false} className="w-full h-full object-contain pointer-events-none" style={{ transform: 'rotate(-90deg)' }} />
        </div>
        <span>{t('legendBlueprintM')}</span>
      </div>
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <div className="h-6 min-w-[34px] px-2 border border-endfield-gray-light text-endfield-text-light bg-endfield-black/50 flex items-center justify-center text-[10px] font-semibold">
          I
        </div>
        <span>{t('legendBlueprintI')}</span>
      </div>
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <div className="h-6 min-w-[34px] px-2 border border-endfield-gray-light text-endfield-text-light bg-endfield-black/50 flex items-center justify-center text-[10px] font-semibold">
          R
        </div>
        <span>{t('legendBlueprintR')}</span>
      </div>
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <div className="h-6 min-w-[34px] px-2 border border-endfield-gray-light text-endfield-text-light bg-endfield-black/50 flex items-center justify-center text-[10px] font-semibold">
          T
        </div>
        <span>{t('legendBlueprintT')}</span>
      </div>
    </div>
  );
}
