import { useI18n } from '../../../i18n';
import Icon from '../../ui/Icon';
import Select from '../../ui/Select';
import { FUEL_OPTIONS, SECONDARY_FUEL_OPTIONS } from '../../../utils/constants';

export default function FuelConfigField({ params, onChange, locale }) {
  const { t } = useI18n();

  const getFuelName = (fuel) => fuel?.name?.[locale] || fuel?.name?.en || '';

  const primaryOptions = FUEL_OPTIONS.map((f) => ({ value: f.id, ...f }));
  const secondaryOptions = SECONDARY_FUEL_OPTIONS.map((f) => ({ value: f.id, ...f }));

  const renderFuelOption = (opt) => (
    <>
      {opt.image && <img src={opt.image} alt="" className="w-6 h-6 object-contain" aria-hidden="true" />}
      <span>{getFuelName(opt)}</span>
    </>
  );

  const primaryFuel = FUEL_OPTIONS.find((f) => f.id === params.primaryFuelId);
  const secondaryFuel = SECONDARY_FUEL_OPTIONS.find((f) => f.id === params.secondaryFuelId);

  return (
    <fieldset className="space-y-4 border-none p-0 m-0">
      <legend className="text-sm font-bold text-endfield-text uppercase tracking-widest flex items-center gap-2 p-0">
        <Icon name="local_gas_station" className="text-endfield-yellow" />
        {t('fuelConfig')}
      </legend>

      <div className="space-y-2">
        <label id="primary-fuel-label" className="text-sm text-endfield-text">{t('primaryFuel')}</label>
        <Select
          value={params.primaryFuelId}
          options={primaryOptions}
          onChange={(opt) => onChange('primaryFuelId', opt.value)}
          renderOption={renderFuelOption}
          ariaLabelledby="primary-fuel-label"
        />
        {primaryFuel && (
          <p className="text-sm text-endfield-text/70">
            {primaryFuel.power}w / {primaryFuel.burnTime}s
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label id="secondary-fuel-label" className="text-sm text-endfield-text">{t('secondaryFuel')}</label>
        <Select
          value={params.secondaryFuelId}
          options={secondaryOptions}
          onChange={(opt) => onChange('secondaryFuelId', opt.value)}
          renderOption={renderFuelOption}
          ariaLabelledby="secondary-fuel-label"
        />
        {!secondaryFuel || secondaryFuel.power === 0 ? (
          <p className="text-sm text-endfield-text/50">{t('secondaryFuelHint')}</p>
        ) : (
          <p className="text-sm text-endfield-text/70">
            {secondaryFuel.power}w / {secondaryFuel.burnTime}s
          </p>
        )}
      </div>
    </fieldset>
  );
}
