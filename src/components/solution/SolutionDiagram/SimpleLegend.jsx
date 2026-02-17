import Icon from '../../ui/Icon';

export default function SimpleLegend({ t }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-endfield-text-light">
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <div className="w-6 h-6 bg-endfield-gray border border-endfield-text-light/40 flex items-center justify-center">
          <Icon name="input" className="text-[14px]" />
        </div>
        <span>{t('legendInputSource')}</span>
      </div>
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <div className="min-w-[30px] h-6 border border-endfield-yellow/30 text-endfield-yellow bg-endfield-yellow/10 flex items-center justify-center font-bold">
          2{t('waySplit')}
        </div>
        <span>{t('legendSplit2')}</span>
      </div>
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <div className="min-w-[30px] h-6 border border-endfield-text-light/30 text-endfield-text-light bg-endfield-gray/80 flex items-center justify-center font-bold">
          3{t('waySplit')}
        </div>
        <span>{t('legendSplit3')}</span>
      </div>
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <div className="h-6 px-2 border border-endfield-yellow/50 bg-endfield-yellow/10 text-endfield-yellow flex items-center gap-1">
          <Icon name="bolt" className="text-[13px]" />
        </div>
        <span>{t('legendGenerator')}</span>
      </div>
      <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
        <Icon name="arrow_right_alt" className="text-endfield-text/70" />
        <span>{t('legendFlowDirection')}</span>
      </div>
    </div>
  );
}
