import { FUEL_OPTIONS, SECONDARY_FUEL_OPTIONS } from './constants';

const SHARE_PARAM_KEY = 'p';
const BASE52_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE52_LOOKUP = new Map(BASE52_ALPHABET.split('').map((char, idx) => [char, idx]));

const TARGET_POWER_BITS = 15; // 0 - 32767
const MAX_WASTE_BITS = 12;    // 0 - 4095
const MIN_BATTERY_BITS = 7;   // 0 - 127
const PRIMARY_FUEL_BITS = 5;  // 0 - 31
const SECONDARY_FUEL_BITS = 5; // 0 - 31

const MAX_TARGET_POWER = Math.pow(2, TARGET_POWER_BITS) - 1;
const MAX_MAX_WASTE = Math.pow(2, MAX_WASTE_BITS) - 1;
const MAX_PRIMARY_INDEX = Math.pow(2, PRIMARY_FUEL_BITS) - 1;
const MAX_SECONDARY_INDEX = Math.pow(2, SECONDARY_FUEL_BITS) - 1;

const toBase52 = (value) => {
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

const fromBase52 = (value) => {
  if (!value || typeof value !== 'string') return null;
  let num = 0n;
  for (let i = 0; i < value.length; i++) {
    const idx = BASE52_LOOKUP.get(value[i]);
    if (idx === undefined) return null;
    num = num * 52n + BigInt(idx);
  }
  return num;
};

const isValidNonNegativeInt = (value) => Number.isInteger(value) && value >= 0;

export function encodeShareParams(params) {
  if (!params) return null;

  const targetPower = Math.round(params.targetPower);
  const minBatteryPercent = Math.round(params.minBatteryPercent);
  const maxWaste = Math.round(params.maxWaste);

  if (!isValidNonNegativeInt(targetPower) || targetPower > MAX_TARGET_POWER) return null;
  if (!isValidNonNegativeInt(maxWaste) || maxWaste > MAX_MAX_WASTE) return null;
  if (!isValidNonNegativeInt(minBatteryPercent) || minBatteryPercent > 100) return null;

  const primaryIndex = FUEL_OPTIONS.findIndex(fuel => fuel.id === params.primaryFuelId);
  const secondaryIndex = SECONDARY_FUEL_OPTIONS.findIndex(fuel => fuel.id === params.secondaryFuelId);
  if (primaryIndex < 0 || secondaryIndex < 0) return null;
  if (primaryIndex > MAX_PRIMARY_INDEX || secondaryIndex > MAX_SECONDARY_INDEX) return null;

  const packed = (BigInt(targetPower) << BigInt(MIN_BATTERY_BITS + MAX_WASTE_BITS + SECONDARY_FUEL_BITS + PRIMARY_FUEL_BITS))
    | (BigInt(minBatteryPercent) << BigInt(MAX_WASTE_BITS + SECONDARY_FUEL_BITS + PRIMARY_FUEL_BITS))
    | (BigInt(maxWaste) << BigInt(SECONDARY_FUEL_BITS + PRIMARY_FUEL_BITS))
    | (BigInt(secondaryIndex) << BigInt(PRIMARY_FUEL_BITS))
    | BigInt(primaryIndex);

  return toBase52(packed);
}

export function decodeShareParams(value) {
  if (!value || typeof value !== 'string') return null;
  const packed = fromBase52(value);
  if (packed === null) return null;

  const primaryMask = (1n << BigInt(PRIMARY_FUEL_BITS)) - 1n;
  const secondaryMask = (1n << BigInt(SECONDARY_FUEL_BITS)) - 1n;
  const maxWasteMask = (1n << BigInt(MAX_WASTE_BITS)) - 1n;
  const minBatteryMask = (1n << BigInt(MIN_BATTERY_BITS)) - 1n;

  let cursor = packed;
  const primaryIndex = Number(cursor & primaryMask);
  cursor >>= BigInt(PRIMARY_FUEL_BITS);
  const secondaryIndex = Number(cursor & secondaryMask);
  cursor >>= BigInt(SECONDARY_FUEL_BITS);
  const maxWaste = Number(cursor & maxWasteMask);
  cursor >>= BigInt(MAX_WASTE_BITS);
  const minBatteryPercent = Number(cursor & minBatteryMask);
  cursor >>= BigInt(MIN_BATTERY_BITS);
  const targetPower = Number(cursor);

  if (!isValidNonNegativeInt(targetPower) || targetPower > MAX_TARGET_POWER) return null;
  if (!isValidNonNegativeInt(maxWaste) || maxWaste > MAX_MAX_WASTE) return null;
  if (!isValidNonNegativeInt(minBatteryPercent) || minBatteryPercent > 100) return null;
  if (!isValidNonNegativeInt(primaryIndex) || primaryIndex > MAX_PRIMARY_INDEX) return null;
  if (!isValidNonNegativeInt(secondaryIndex) || secondaryIndex > MAX_SECONDARY_INDEX) return null;

  const primaryCount = FUEL_OPTIONS.length;
  const secondaryCount = SECONDARY_FUEL_OPTIONS.length;
  if (primaryIndex >= primaryCount || secondaryIndex >= secondaryCount) return null;
  const primaryFuelId = FUEL_OPTIONS[primaryIndex]?.id;
  const secondaryFuelId = SECONDARY_FUEL_OPTIONS[secondaryIndex]?.id;

  if (!primaryFuelId || !secondaryFuelId) return null;

  return {
    targetPower,
    minBatteryPercent,
    maxWaste,
    primaryFuelId,
    secondaryFuelId,
  };
}

export function getShareParamsFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const token = params.get(SHARE_PARAM_KEY);
  return decodeShareParams(token);
}

export function buildShareUrl(params) {
  if (typeof window === 'undefined') return null;
  const token = encodeShareParams(params);
  if (!token) return null;
  const url = new URL(window.location.href);
  url.searchParams.set(SHARE_PARAM_KEY, token);
  return url.toString();
}

export const SHARE_LIMITS = {
  MAX_TARGET_POWER,
  MAX_MAX_WASTE,
  MAX_PRIMARY_INDEX,
  MAX_SECONDARY_INDEX,
};

export { SHARE_PARAM_KEY };
