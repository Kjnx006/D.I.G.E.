import {
  DEFAULT_INPUT_SOURCE_ID,
  FUEL_OPTIONS,
  INPUT_SOURCE_OPTIONS,
  PARAM_LIMITS,
  SECONDARY_FUEL_OPTIONS,
} from './constants';

const SHARE_PARAM_KEY = 'p';
const BASE52_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE52_LOOKUP = new Map(BASE52_ALPHABET.split('').map((char, idx) => [char, idx]));

const PRIMARY_FUEL_BITS = 5;
const SECONDARY_FUEL_BITS = 5;
const MAX_WASTE_BITS = 12;
const MIN_BATTERY_BITS = 7;
const TARGET_POWER_BITS = 15;
const INPUT_SOURCE_BITS = 2;
const MAX_BRANCHES_BITS = 3;
const EXCLUDE_BELT_BITS = 2;
const PHASE_OFFSET_BITS = 5;
const PHASE_OFFSET_FIELD_KEYS = Array.from(
  { length: PARAM_LIMITS.MAX_BRANCHES },
  (_, index) => `phaseOffsetBranch${index + 1}`
);

const toBase52 = (value: bigint | number): string | null => {
  let num = BigInt(value);
  if (num < 0n) return null;
  if (num === 0n) return BASE52_ALPHABET[0];
  let out = '';
  while (num > 0n) {
    const idx = Number(num % 52n);
    out = BASE52_ALPHABET[idx] + out;
    num /= 52n;
  }
  return out;
};

const fromBase52 = (value: unknown): bigint | null => {
  if (!value || typeof value !== 'string') return null;
  let num = 0n;
  for (let i = 0; i < value.length; i++) {
    const idx = BASE52_LOOKUP.get(value[i]);
    if (idx === undefined) return null;
    num = num * 52n + BigInt(idx);
  }
  return num;
};

const isValidNonNegativeInt = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 0;

const defaultInputIndex = INPUT_SOURCE_OPTIONS.findIndex(
  (source) => source.id === DEFAULT_INPUT_SOURCE_ID
);

const maxValueFromBits = (bits: number): number => (1 << bits) - 1;
const bitMaskFromBits = (bits: number): bigint => (1n << BigInt(bits)) - 1n;

const encodeOptionIndex = (
  options: { id: string }[],
  id: unknown,
  fallbackIndex: number = -1
): number => {
  const resolvedId = typeof id === 'string' && id ? id : null;
  const index = options.findIndex((item) => item.id === resolvedId);
  if (index >= 0) return index;
  return fallbackIndex;
};

const decodeOptionId = (options: { id: string }[], index: number): string | null => {
  if (!isValidNonNegativeInt(index)) return null;
  if (index >= options.length) return null;
  const id = options[index]?.id;
  return typeof id === 'string' && id ? id : null;
};

const assertOptionsFitBits = (name: string, options: unknown[], bits: number): void => {
  if (options.length - 1 > maxValueFromBits(bits)) {
    throw new Error(`Share field "${name}" exceeds bit capacity`);
  }
};

interface NumberFieldConfig {
  index?: number;
  key: string;
  bits: number;
  min?: number;
  max: number;
  optional?: boolean;
  missingRawValue?: number;
}

interface OptionFieldConfig {
  index?: number;
  key: string;
  bits: number;
  options: { id: string }[];
  fallbackIndex?: number;
  optional?: boolean;
  missingRawValue?: number;
}

interface BooleanFieldConfig {
  index?: number;
  key: string;
  bits?: number;
  optional?: boolean;
  missingRawValue?: number;
}

interface ShareField {
  index: number;
  key: string;
  bits: number;
  mask: bigint;
  maxEncodedValue: number;
  optional: boolean;
  missingRawValue: number;
  encode: (value: unknown) => number | null;
  decode: (value: number) => unknown;
}

const createNumberField = ({
  index,
  key,
  bits,
  min = 0,
  max,
  optional = false,
  missingRawValue = 0,
}: NumberFieldConfig): ShareField => {
  const maxEncodedValue = maxValueFromBits(bits);
  return {
    index: index ?? 0,
    key,
    bits,
    mask: bitMaskFromBits(bits),
    maxEncodedValue,
    optional,
    missingRawValue,
    encode: (value) => {
      if (optional && (value === undefined || value === null || value === '')) {
        return missingRawValue;
      }
      const rounded = Math.round(Number(value));
      if (!isValidNonNegativeInt(rounded)) return null;
      if (rounded < min || rounded > max) return null;
      if (rounded > maxEncodedValue) return null;
      return rounded;
    },
    decode: (value) => {
      if (!isValidNonNegativeInt(value)) return null;
      if (value < min || value > max) return null;
      return value;
    },
  };
};

const createOptionField = ({
  index,
  key,
  bits,
  options,
  fallbackIndex = -1,
  optional = false,
  missingRawValue = 0,
}: OptionFieldConfig): ShareField => {
  assertOptionsFitBits(key, options, bits);
  const maxEncodedValue = maxValueFromBits(bits);
  return {
    index: index ?? 0,
    key,
    bits,
    mask: bitMaskFromBits(bits),
    maxEncodedValue,
    optional,
    missingRawValue,
    encode: (value) => {
      const encoded = encodeOptionIndex(options, value, fallbackIndex);
      if (!isValidNonNegativeInt(encoded) || encoded > maxEncodedValue) return null;
      return encoded;
    },
    decode: (value) => decodeOptionId(options, value),
  };
};

const createBooleanField = ({
  index,
  key,
  bits = 2,
  optional = false,
  missingRawValue = 0,
}: BooleanFieldConfig): ShareField => {
  const maxEncodedValue = maxValueFromBits(bits);
  return {
    index: index ?? 0,
    key,
    bits,
    mask: bitMaskFromBits(bits),
    maxEncodedValue,
    optional,
    missingRawValue,
    encode: (value) => {
      if (value === true) return 1;
      if (value === false) return 2;
      if (optional && (value === undefined || value === null)) return missingRawValue;
      return null;
    },
    decode: (value) => {
      if (optional && value === missingRawValue) return null;
      if (value === 1) return true;
      if (value === 2) return false;
      return null;
    },
  };
};

const assignFieldIndices = (fields: ShareField[]): ShareField[] =>
  fields.map((field, index) => ({ ...field, index }));
const clampMaxBranches = (value: unknown): number => {
  const numeric = Math.round(Number(value));
  if (!Number.isFinite(numeric)) return PARAM_LIMITS.MAX_BRANCHES;
  return Math.min(PARAM_LIMITS.MAX_BRANCHES, Math.max(PARAM_LIMITS.MIN_BRANCHES, numeric));
};

const getPhaseOffsetBranchIndex = (key: string): number | null => {
  const match = /^phaseOffsetBranch(\d+)$/.exec(key);
  if (!match) return null;
  const index = Number(match[1]);
  return Number.isInteger(index) && index > 0 ? index : null;
};

// Keep field order stable for backward compatibility; add new fields only at the end.
const SHARE_FIELDS = assignFieldIndices([
  createOptionField({ key: 'primaryFuelId', bits: PRIMARY_FUEL_BITS, options: FUEL_OPTIONS }),
  createOptionField({
    key: 'secondaryFuelId',
    bits: SECONDARY_FUEL_BITS,
    options: SECONDARY_FUEL_OPTIONS,
  }),
  createNumberField({ key: 'maxWaste', bits: MAX_WASTE_BITS, max: PARAM_LIMITS.MAX_MAX_WASTE }),
  createNumberField({
    key: 'minBatteryPercent',
    bits: MIN_BATTERY_BITS,
    max: PARAM_LIMITS.MAX_BATTERY_PERCENT,
  }),
  createNumberField({
    key: 'targetPower',
    bits: TARGET_POWER_BITS,
    max: PARAM_LIMITS.MAX_TARGET_POWER,
  }),
  createOptionField({
    key: 'inputSourceId',
    bits: INPUT_SOURCE_BITS,
    options: INPUT_SOURCE_OPTIONS,
    fallbackIndex: defaultInputIndex,
  }),
  createNumberField({
    key: 'maxBranches',
    bits: MAX_BRANCHES_BITS,
    min: PARAM_LIMITS.MIN_BRANCHES,
    max: PARAM_LIMITS.MAX_BRANCHES,
    optional: true,
    missingRawValue: 0,
  }),
  createBooleanField({
    key: 'exclude_belt',
    bits: EXCLUDE_BELT_BITS,
    optional: true,
    missingRawValue: 0,
  }),
  ...PHASE_OFFSET_FIELD_KEYS.map((key) =>
    createNumberField({
      key,
      bits: PHASE_OFFSET_BITS,
      min: PARAM_LIMITS.MIN_PHASE_OFFSET_CELLS,
      max: PARAM_LIMITS.MAX_PHASE_OFFSET_CELLS,
      optional: true,
      missingRawValue: 0,
    })
  ),
]);

const LAYOUT_FIELDS = [...SHARE_FIELDS].sort((a, b) => a.index - b.index);

export interface ShareParams {
  primaryFuelId?: string;
  secondaryFuelId?: string;
  maxWaste?: number;
  minBatteryPercent?: number;
  targetPower?: number;
  inputSourceId?: string;
  maxBranches?: number;
  exclude_belt?: boolean;
  [key: string]: unknown;
}

export function encodeShareParams(params: ShareParams | null): string | null {
  if (!params) return null;
  const activeBranchCount = clampMaxBranches(params.maxBranches);

  let packed = 0n;
  let offset = 0n;

  for (const field of LAYOUT_FIELDS) {
    const phaseOffsetIndex = getPhaseOffsetBranchIndex(field.key);
    const isInactivePhaseOffset = phaseOffsetIndex != null && phaseOffsetIndex > activeBranchCount;
    const sourceValue = isInactivePhaseOffset ? field.missingRawValue : params[field.key];
    const encodedValue = field.encode(sourceValue);
    if (!isValidNonNegativeInt(encodedValue)) return null;
    if (encodedValue > field.maxEncodedValue) return null;

    packed |= BigInt(encodedValue) << offset;
    offset += BigInt(field.bits);
  }

  return toBase52(packed);
}

export function decodeShareParams(value: unknown): ShareParams | null {
  if (!value || typeof value !== 'string') return null;
  let cursor = fromBase52(value);
  if (cursor === null) return null;

  const decoded: ShareParams = {};

  for (const field of LAYOUT_FIELDS) {
    const rawValue = Number(cursor & field.mask);
    cursor >>= BigInt(field.bits);

    const decodedValue = field.decode(rawValue);
    if (decodedValue === null || decodedValue === undefined) {
      if (field.optional && rawValue === field.missingRawValue) continue;
      return null;
    }

    decoded[field.key] = decodedValue;
  }

  const activeBranchCount = clampMaxBranches(decoded.maxBranches);
  for (const key of PHASE_OFFSET_FIELD_KEYS) {
    const index = getPhaseOffsetBranchIndex(key);
    if (index != null && index > activeBranchCount) {
      delete decoded[key];
    }
  }

  return decoded;
}

export function getShareParamsFromUrl(): ShareParams | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const token = params.get(SHARE_PARAM_KEY);
  return decodeShareParams(token);
}

export function buildShareUrl(params: ShareParams): string | null {
  if (typeof window === 'undefined') return null;
  const token = encodeShareParams(params);
  if (!token) return null;
  const url = new URL(window.location.href);
  url.searchParams.set(SHARE_PARAM_KEY, token);
  return url.toString();
}

export { SHARE_PARAM_KEY };
