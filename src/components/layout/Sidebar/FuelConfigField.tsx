import { useI18n } from '../../../i18n';
import type { CalcParams } from '../../../types/calc';
import type { Fuel } from '../../../utils/constants';
import { FUEL_OPTIONS, SECONDARY_FUEL_OPTIONS } from '../../../utils/constants';
import type { SelectOption } from '../../ui/Select';
import Select from '../../ui/Select';
import SidebarSection from './SidebarSection';

export interface FuelConfigFieldProps {
  params: CalcParams;
  onChange: (key: keyof CalcParams | string, value: unknown) => void;
  locale: string;
}

export default function FuelConfigField({ params, onChange, locale }: FuelConfigFieldProps) {
  const { t } = useI18n();

  const getFuelName = (fuel: { name?: Fuel['name'] } | undefined) =>
    fuel?.name?.[locale] || fuel?.name?.en || '';

  const primaryOptions = FUEL_OPTIONS.map((f) => ({ value: f.id, label: getFuelName(f), ...f }));
  const secondaryOptions = SECONDARY_FUEL_OPTIONS.map((f) => ({
    value: f.id,
    label: getFuelName(f),
    ...f,
  }));

  const renderFuelOption = (opt: SelectOption<string> & Partial<Fuel>) => (
    <>
      {opt.image && (
        <img src={opt.image} alt="" className="w-6 h-6 object-contain" aria-hidden="true" />
      )}
      <span>{opt.label ?? getFuelName(opt as { name?: Fuel['name'] })}</span>
    </>
  );

  const primaryFuel = FUEL_OPTIONS.find((f) => f.id === params.primaryFuelId);
  const secondaryFuel = SECONDARY_FUEL_OPTIONS.find((f) => f.id === params.secondaryFuelId);

  return (
    <SidebarSection icon="local_gas_station" title={t('fuelConfig')} className="space-y-4">
      <div className="space-y-2">
        <label
          id="primary-fuel-label"
          htmlFor="primary-fuel-select"
          className="text-sm text-endfield-text"
        >
          {t('primaryFuel')}
        </label>
        <Select
          id="primary-fuel-select"
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
        <label
          id="secondary-fuel-label"
          htmlFor="secondary-fuel-select"
          className="text-sm text-endfield-text"
        >
          {t('secondaryFuel')}
        </label>
        <Select
          id="secondary-fuel-select"
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
    </SidebarSection>
  );
}
