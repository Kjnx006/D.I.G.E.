/**
 * 计算参数与结果类型定义
 */
import type { Fuel } from '../utils/constants';

/** 侧边栏/计算器使用的完整参数 */
export interface CalcParams {
  targetPower: number;
  minBatteryPercent: number;
  maxWaste: number;
  primaryFuelId: string;
  secondaryFuelId: string;
  inputSourceId?: string;
  maxBranches?: number;
  phaseOffsetBranch1?: number;
  phaseOffsetBranch2?: number;
  phaseOffsetBranch3?: number;
  exclude_belt?: boolean;
  excludeBelt?: boolean;
  [key: string]: unknown;
}

/** 单分支配置 */
export interface OscillatingBranch {
  denominator: number;
  phaseOffsetCells: number;
  power: number;
  blueprint?: (Record<string, unknown> | null)[][];
  [key: string]: unknown;
}

/** 计算器 solve() 返回的单条方案 */
export interface SolutionResult {
  baseConfig: { totalPower: number; generators: number; belts: number };
  baseFuel: Fuel;
  oscillating: OscillatingBranch[] | null;
  oscillatingFuel: Fuel | null;
  fuel: Fuel;
  isPrimary: boolean;
  inputInterval: number;
  inputSourceId: string;
  exclude_belt: boolean;
  avgPower: number;
  waste: number;
  variance: number;
  period: number;
  minBattery: number;
  minBatteryPercent: number;
  branchCount: number;
  totalSplitters: number;
  batteryLog: number[];
  powerLog: number[];
  burnStateLog: number[][];
  preciseBatteryLog: number[];
  precisePowerLog: number[];
  preciseBurnStateLog: number[][];
  fuelConsumption: {
    base: { fuel: Fuel; perSecond: number; perMinute: number; perHour: number; perDay: number };
    oscillating: {
      fuel: Fuel | null;
      perSecond: number;
      perMinute: number;
      perHour: number;
      perDay: number;
    };
  };
  [key: string]: unknown;
}
