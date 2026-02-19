import type { CalcParams, OscillatingBranch, SolutionResult } from '../types/calc';
import type { Fuel } from './constants';
import {
  analyzeSplitterComplexity,
  CONSTANTS,
  DEFAULT_INPUT_SOURCE_ID,
  FUELS,
  getOscillatingPower,
  INPUT_SOURCES,
  PARAM_LIMITS,
} from './constants';

export type FactoryDesignerParams = CalcParams;

const PART_FACE = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
} as const;

const PART_FUNCTION = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
  RECYCLE: 'RECYCLE',
} as const;

function createPart(
  partId: string,
  face: string | null,
  partFunction: string | null = null
): Record<string, unknown> {
  if (partFunction) {
    const part: Record<string, unknown> = { partId, function: partFunction };
    if (face != null) part.face = face;
    return part;
  }
  return { partId, face };
}

function buildBranchBlueprint(
  threeWay: number,
  twoWay: number,
  excludeBelt: boolean = false
): (Record<string, unknown> | null)[][] {
  const totalColumns = 1 + threeWay + twoWay + 1;
  const grid = Array.from({ length: 5 }, () => Array(totalColumns).fill(null)) as (Record<
    string,
    unknown
  > | null)[][];

  // Row 3: Input -> splitters -> thermal bank
  grid[2][0] = createPart('input_source', null, PART_FUNCTION.INPUT);
  let col = 1;

  for (let i = 0; i < threeWay; i += 1) {
    grid[2][col] = createPart('splitter', PART_FACE.RIGHT);
    grid[0][col] = createPart('converger', PART_FACE.LEFT);
    grid[4][col] = createPart('converger', PART_FACE.LEFT);
    if (excludeBelt) {
      grid[1][col] = createPart('converger', PART_FACE.UP);
      grid[3][col] = createPart('converger', PART_FACE.DOWN);
    } else {
      grid[1][col] = createPart('belt', PART_FACE.UP);
      grid[3][col] = createPart('belt', PART_FACE.DOWN);
    }
    col += 1;
  }

  for (let i = 0; i < twoWay; i += 1) {
    grid[2][col] = createPart('splitter', PART_FACE.RIGHT);
    grid[0][col] = createPart('converger', PART_FACE.LEFT);
    if (excludeBelt) {
      grid[1][col] = createPart('converger', PART_FACE.UP);
    } else {
      grid[1][col] = createPart('belt', PART_FACE.UP);
    }
    col += 1;
  }

  grid[2][col] = createPart('thermal_bank', null, PART_FUNCTION.OUTPUT);

  grid[0][0] = createPart('recycle_source', null, PART_FUNCTION.RECYCLE);
  if (grid[4].some((cell) => cell !== null)) {
    grid[4][0] = createPart('recycle_source', null, PART_FUNCTION.RECYCLE);
  }

  if (!excludeBelt) {
    for (let idx = totalColumns - 1; idx >= 0; idx -= 1) {
      if ((grid[0][idx] as Record<string, unknown>)?.partId === 'converger') {
        grid[0][idx] = createPart('left_turn_belt', PART_FACE.UP);
        break;
      }
    }
    for (let idx = totalColumns - 1; idx >= 0; idx -= 1) {
      if ((grid[4][idx] as Record<string, unknown>)?.partId === 'converger') {
        grid[4][idx] = createPart('right_turn_belt', PART_FACE.DOWN);
        break;
      }
    }
  }

  return grid;
}

interface OscillatingSolutionInput {
  branches: Array<{
    denominator: number;
    phaseOffsetCells?: number;
    power?: number;
    blueprint?: (Record<string, unknown> | null)[][];
  }>;
  fuel: Fuel;
  isPrimary: boolean;
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
}

interface BuildSolutionOutputParams {
  baseConfig: { totalPower: number; generators: number; belts: number };
  primaryFuel: Fuel;
  targetPower: number;
  inputInterval: number;
  inputSourceId: string;
  excludeBelt: boolean;
  batteryCapacity: number;
  baseFuelPerSec: number;
  solution: OscillatingSolutionInput | null;
  oscillatingFuelPerSec: number;
}

function buildSolutionOutput({
  baseConfig,
  primaryFuel,
  targetPower,
  inputInterval,
  inputSourceId,
  excludeBelt,
  batteryCapacity,
  baseFuelPerSec,
  solution,
  oscillatingFuelPerSec,
}: BuildSolutionOutputParams): SolutionResult {
  if (!solution) {
    return {
      baseConfig,
      baseFuel: primaryFuel,
      oscillating: null,
      oscillatingFuel: null,
      fuel: primaryFuel,
      isPrimary: true,
      inputInterval,
      inputSourceId,
      exclude_belt: excludeBelt,
      avgPower: baseConfig.totalPower,
      waste: baseConfig.totalPower - targetPower,
      variance: 0,
      period: 0,
      minBattery: batteryCapacity,
      minBatteryPercent: 100,
      branchCount: 0,
      totalSplitters: 0,
      batteryLog: [batteryCapacity],
      powerLog: [baseConfig.totalPower],
      burnStateLog: [],
      preciseBatteryLog: [batteryCapacity],
      precisePowerLog: [baseConfig.totalPower],
      preciseBurnStateLog: [],
      fuelConsumption: {
        base: {
          fuel: primaryFuel,
          perSecond: baseFuelPerSec,
          perMinute: baseFuelPerSec * 60,
          perHour: baseFuelPerSec * 3600,
          perDay: baseFuelPerSec * 86400,
        },
        oscillating: {
          fuel: null,
          perSecond: 0,
          perMinute: 0,
          perHour: 0,
          perDay: 0,
        },
      },
    };
  }

  const oscillating: OscillatingBranch[] = solution.branches.map((b) => ({
    denominator: b.denominator,
    phaseOffsetCells: b.phaseOffsetCells ?? 0,
    power: b.power ?? 0,
    blueprint: b.blueprint,
  }));
  return {
    baseConfig,
    baseFuel: primaryFuel,
    oscillating,
    oscillatingFuel: solution.fuel,
    fuel: solution.fuel,
    isPrimary: solution.isPrimary,
    inputInterval,
    inputSourceId,
    exclude_belt: excludeBelt,
    avgPower: solution.avgPower,
    waste: solution.waste,
    variance: solution.variance,
    period: solution.period,
    minBattery: solution.minBattery,
    minBatteryPercent: solution.minBatteryPercent,
    branchCount: solution.branchCount,
    totalSplitters: solution.totalSplitters,
    batteryLog: solution.batteryLog,
    powerLog: solution.powerLog,
    burnStateLog: solution.burnStateLog,
    preciseBatteryLog: solution.preciseBatteryLog,
    precisePowerLog: solution.precisePowerLog,
    preciseBurnStateLog: solution.preciseBurnStateLog,
    fuelConsumption: {
      base: {
        fuel: primaryFuel,
        perSecond: baseFuelPerSec,
        perMinute: baseFuelPerSec * 60,
        perHour: baseFuelPerSec * 3600,
        perDay: baseFuelPerSec * 86400,
      },
      oscillating: {
        fuel: solution.fuel,
        perSecond: oscillatingFuelPerSec,
        perMinute: oscillatingFuelPerSec * 60,
        perHour: oscillatingFuelPerSec * 3600,
        perDay: oscillatingFuelPerSec * 86400,
      },
    },
  };
}

function normalizePhaseOffsetCells(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  const rounded = Math.round(numeric);
  return Math.min(
    PARAM_LIMITS.MAX_PHASE_OFFSET_CELLS,
    Math.max(PARAM_LIMITS.MIN_PHASE_OFFSET_CELLS, rounded)
  );
}

interface SimulatorParams {
  targetPower: number;
  minBatteryPercent: number;
  batteryCapacity: number;
  inputInterval: number;
}

interface SimulateCycleSuccess {
  success: true;
  period: number;
  avgPower: number;
  waste: number;
  variance: number;
  minBattery: number;
  minBatteryPercent: number;
  batteryLog: number[];
  powerLog: number[];
  burnStateLog: number[][];
  preciseBatteryLog: number[];
  precisePowerLog: number[];
  preciseBurnStateLog: number[][];
}

interface SimulateCycleFailure {
  success: false;
  reason: 'period_too_long' | 'battery_depleted_preheat' | 'battery_below_min';
  minBattery?: number;
}

type SimulateCycleResult = SimulateCycleSuccess | SimulateCycleFailure;

class PowerCycleSimulator {
  targetPower: number;
  minBatteryPercent: number;
  batteryCapacity: number;
  inputInterval: number;

  constructor({ targetPower, minBatteryPercent, batteryCapacity, inputInterval }: SimulatorParams) {
    this.targetPower = targetPower;
    this.minBatteryPercent = minBatteryPercent;
    this.batteryCapacity = batteryCapacity;
    this.inputInterval = inputInterval;
  }

  _gcd(a: number, b: number): number {
    return b === 0 ? a : this._gcd(b, a % b);
  }

  _lcm(a: number, b: number): number {
    if (a === 0 || b === 0) {
      return 0;
    }
    return Math.abs(a * b) / this._gcd(a, b);
  }

  _getCyclePeriod(denominators: number[]): number {
    if (denominators.length === 0) {
      return this.inputInterval;
    }

    const intervals = denominators.map((d) => this.inputInterval * d);
    let period = this.inputInterval;
    for (const interval of intervals) {
      period = this._lcm(period, interval);
    }
    return period;
  }

  simulateCycle(
    baseConfig: { totalPower: number },
    oscillatingBranches: Array<{ denominator: number; phaseOffsetCells?: number }>,
    fuel: Fuel
  ): SimulateCycleResult {
    const period = this._getCyclePeriod(oscillatingBranches.map((b) => b.denominator));
    if (period > 100000) {
      return { success: false, reason: 'period_too_long' };
    }

    const warmupCycles = 2;
    const maxPhaseOffset = oscillatingBranches.reduce((maxOffset, branch) => {
      const offsetSeconds =
        normalizePhaseOffsetCells(branch.phaseOffsetCells) * CONSTANTS.BELT_INTERVAL;
      return Math.max(maxOffset, offsetSeconds);
    }, 0);
    const warmupDuration = Math.max(period * warmupCycles, maxPhaseOffset + period);
    const totalDuration = warmupDuration + period;
    const timelineSize = Math.ceil(totalDuration);

    const powerTimeline = new Array(timelineSize).fill(0);
    const branchBurnTimeline = oscillatingBranches.map(() => new Array(timelineSize).fill(0));

    for (const [branchIndex, branch] of oscillatingBranches.entries()) {
      const inputInterval = this.inputInterval * branch.denominator;
      const phaseOffsetCells = normalizePhaseOffsetCells(branch.phaseOffsetCells);
      const branchStartTime = phaseOffsetCells * CONSTANTS.BELT_INTERVAL;
      let lastBurnEnd = 0;

      for (let t = branchStartTime; t < totalDuration; t += inputInterval) {
        const burnStart = Math.max(t, lastBurnEnd);
        const burnEnd = burnStart + fuel.burnTime;
        lastBurnEnd = burnEnd;

        const start = Math.floor(burnStart);
        const end = Math.min(Math.ceil(burnEnd), totalDuration);
        for (let i = start; i < end; i += 1) {
          powerTimeline[i] += fuel.power;
          branchBurnTimeline[branchIndex][i] = 1;
        }
      }
    }

    const checkStart = Math.floor(warmupDuration);
    const checkEnd = Math.floor(totalDuration);
    const cyclePower = powerTimeline.slice(checkStart, checkEnd);

    const minBatteryRequired = (this.batteryCapacity * this.minBatteryPercent) / 100;
    let battery = this.batteryCapacity;
    let minBattery = battery;
    const batteryLog: number[] = [];
    const powerLog: number[] = [];
    const burnStateLog = oscillatingBranches.map(() => [] as number[]);
    const preciseBatteryLog: number[] = [];
    const precisePowerLog: number[] = [];
    const preciseBurnStateLog = oscillatingBranches.map(() => [] as number[]);

    for (let t = 0; t < checkStart; t += 1) {
      const supply = baseConfig.totalPower + powerTimeline[t];
      battery += supply - this.targetPower;
      if (battery > this.batteryCapacity) {
        battery = this.batteryCapacity;
      }
      if (battery < 0) {
        return { success: false, reason: 'battery_depleted_preheat' };
      }
    }

    const sampleStep = period >= 2000 ? Math.ceil(period / 500) : 1;
    for (let t = checkStart; t < checkEnd; t += 1) {
      const supply = baseConfig.totalPower + powerTimeline[t];
      battery += supply - this.targetPower;

      if (battery > this.batteryCapacity) {
        battery = this.batteryCapacity;
      }
      if (battery < minBattery) {
        minBattery = battery;
      }

      if (period < 2000 || (t - checkStart) % sampleStep === 0) {
        batteryLog.push(battery);
        powerLog.push(supply);
        for (let i = 0; i < burnStateLog.length; i += 1) {
          burnStateLog[i].push(branchBurnTimeline[i][t]);
        }
      }

      preciseBatteryLog.push(battery);
      precisePowerLog.push(supply);
      for (let i = 0; i < preciseBurnStateLog.length; i += 1) {
        preciseBurnStateLog[i].push(branchBurnTimeline[i][t]);
      }

      if (battery < minBatteryRequired) {
        return {
          success: false,
          reason: 'battery_below_min',
          minBattery,
        };
      }
    }

    const avgPower =
      cyclePower.reduce((sum: number, p: number) => sum + p, 0) / cyclePower.length +
      baseConfig.totalPower;
    const variance =
      cyclePower.reduce(
        (sum: number, p: number) => sum + (p - (avgPower - baseConfig.totalPower)) ** 2,
        0
      ) / cyclePower.length;
    const waste = avgPower - this.targetPower;

    return {
      success: true,
      period,
      avgPower,
      waste,
      variance,
      minBattery,
      minBatteryPercent: (minBattery / this.batteryCapacity) * 100,
      batteryLog,
      powerLog,
      burnStateLog,
      preciseBatteryLog,
      precisePowerLog,
      preciseBurnStateLog,
    };
  }
}

/**
 * 工厂设计器 - 计算最优发电方案
 */
export class FactoryDesigner {
  targetPower: number;
  minBatteryPercent: number;
  maxWaste: number;
  primaryFuel: Fuel;
  secondaryFuel: Fuel | null;
  inputSource: { id: string; interval: number };
  inputInterval: number;
  batteryCapacity: number;
  maxBranches: number;
  branchPhaseOffsets: number[];
  excludeBelt: boolean;
  validDenominators: number[];
  simulator: PowerCycleSimulator;

  constructor(params: FactoryDesignerParams) {
    this.targetPower = params.targetPower;
    this.minBatteryPercent = params.minBatteryPercent;
    this.maxWaste = params.maxWaste;
    this.primaryFuel = FUELS[params.primaryFuelId];
    this.secondaryFuel = params.secondaryFuelId !== 'none' ? FUELS[params.secondaryFuelId] : null;

    const inputSourceId = params.inputSourceId || DEFAULT_INPUT_SOURCE_ID;
    this.inputSource = INPUT_SOURCES[inputSourceId] || INPUT_SOURCES[DEFAULT_INPUT_SOURCE_ID];
    this.inputInterval = this.inputSource.interval;
    this.batteryCapacity = CONSTANTS.BATTERY_CAPACITY;
    const normalizedMaxBranches = Number.isInteger(params.maxBranches)
      ? (params.maxBranches ?? PARAM_LIMITS.MAX_BRANCHES)
      : PARAM_LIMITS.MAX_BRANCHES;
    this.maxBranches = Math.min(
      PARAM_LIMITS.MAX_BRANCHES,
      Math.max(PARAM_LIMITS.MIN_BRANCHES, normalizedMaxBranches)
    );
    this.branchPhaseOffsets = Array.from({ length: this.maxBranches }, (_, index) => {
      const key = `phaseOffsetBranch${index + 1}` as keyof CalcParams;
      const val = params[key];
      const num = Number(val);
      return normalizePhaseOffsetCells(Number.isFinite(num) ? num : 0);
    });
    this.excludeBelt = Boolean(params.exclude_belt ?? params.excludeBelt ?? true);

    this.validDenominators = this._generateValidDenominators();
    this.simulator = new PowerCycleSimulator({
      targetPower: this.targetPower,
      minBatteryPercent: this.minBatteryPercent,
      batteryCapacity: this.batteryCapacity,
      inputInterval: this.inputInterval,
    });
  }

  _generateValidDenominators(): number[] {
    const denominators: number[] = [];
    for (let x = 0; x < 10; x += 1) {
      for (let y = 0; y < 7; y += 1) {
        const value = 2 ** x * 3 ** y;
        if (value > 1 && value <= 512) {
          denominators.push(value);
        }
      }
    }
    return denominators.sort((a, b) => a - b);
  }

  calculateBasePower(): { generators: number; totalPower: number; belts: number } {
    const inputSpeed = this.inputInterval > 0 ? 1 / this.inputInterval : 0;
    const gensPerBelt = inputSpeed * this.primaryFuel.burnTime;
    const needed = this.targetPower - CONSTANTS.BASE_POWER;

    if (needed <= 0) {
      return { generators: 0, totalPower: CONSTANTS.BASE_POWER, belts: 0 };
    }

    const generators = Math.floor(needed / this.primaryFuel.power);
    const totalPower = CONSTANTS.BASE_POWER + generators * this.primaryFuel.power;
    const belts = gensPerBelt > 0 ? Math.ceil(generators / gensPerBelt) : 0;

    return { generators, totalPower, belts };
  }

  _getCombinations(arr: number[], length: number): number[][] {
    if (length === 1) {
      return arr.map((x) => [x]);
    }

    const combinations: number[][] = [];
    arr.forEach((v, i) => {
      const subs = this._getCombinations(arr.slice(i), length - 1);
      subs.forEach((sub) => {
        combinations.push([v, ...sub]);
      });
    });
    return combinations;
  }

  calculateOscillatingPlans(
    fuel: Fuel,
    baseConfig: { totalPower: number },
    isPrimary: boolean
  ): OscillatingSolutionInput[] {
    const gap = this.targetPower - baseConfig.totalPower;
    if (gap <= 0) {
      return [];
    }

    const solutions: OscillatingSolutionInput[] = [];
    for (let r = 1; r <= this.maxBranches; r += 1) {
      const combinations = this._getCombinations(this.validDenominators, r);

      for (const combo of combinations) {
        const theoryPower = combo.reduce(
          (sum, d) => sum + getOscillatingPower(fuel, d, this.inputInterval),
          0
        );
        const theoryTotal = baseConfig.totalPower + theoryPower;
        const theoryWaste = theoryTotal - this.targetPower;
        if (theoryWaste < 0 || theoryWaste > this.maxWaste + 10) {
          continue;
        }

        const branchConfigs = combo.map((d, i) => ({
          denominator: d,
          phaseOffsetCells: this.branchPhaseOffsets[i] ?? 0,
        }));
        const result = this.simulator.simulateCycle(baseConfig, branchConfigs, fuel);

        if (
          result.success &&
          result.waste != null &&
          result.waste >= 0 &&
          result.waste <= this.maxWaste
        ) {
          const complexity = combo.map((d) => analyzeSplitterComplexity(d));
          const totalSplitters = complexity.reduce((sum, c) => sum + c.total, 0);

          solutions.push({
            fuel,
            isPrimary,
            branches: branchConfigs.map((branchConfig, i) => ({
              denominator: branchConfig.denominator,
              phaseOffsetCells: branchConfig.phaseOffsetCells,
              power: getOscillatingPower(fuel, branchConfig.denominator, this.inputInterval),
              complexity: complexity[i],
              blueprint: buildBranchBlueprint(
                complexity[i].threeWay,
                complexity[i].twoWay,
                this.excludeBelt
              ),
            })),
            branchCount: combo.length,
            totalSplitters,
            period: result.period ?? 0,
            avgPower: result.avgPower ?? 0,
            waste: result.waste ?? 0,
            variance: result.variance ?? 0,
            minBattery: result.minBattery ?? 0,
            minBatteryPercent: result.minBatteryPercent ?? 0,
            batteryLog: result.batteryLog ?? [],
            powerLog: result.powerLog ?? [],
            burnStateLog: result.burnStateLog ?? [],
            preciseBatteryLog: result.preciseBatteryLog ?? [],
            precisePowerLog: result.precisePowerLog ?? [],
            preciseBurnStateLog: result.preciseBurnStateLog ?? [],
          });
        }
      }
    }

    return solutions;
  }

  solve(): SolutionResult[] {
    const baseConfig = this.calculateBasePower();

    if (baseConfig.totalPower >= this.targetPower) {
      const waste = baseConfig.totalPower - this.targetPower;
      if (waste <= this.maxWaste) {
        const baseFuelPerSec =
          baseConfig.generators > 0 ? baseConfig.generators / this.primaryFuel.burnTime : 0;
        return [
          buildSolutionOutput({
            baseConfig,
            primaryFuel: this.primaryFuel,
            targetPower: this.targetPower,
            inputInterval: this.inputInterval,
            inputSourceId: this.inputSource.id,
            excludeBelt: this.excludeBelt,
            batteryCapacity: this.batteryCapacity,
            baseFuelPerSec,
            solution: null,
            oscillatingFuelPerSec: 0,
          }),
        ];
      }
    }

    const allSolutions: OscillatingSolutionInput[] = [];
    allSolutions.push(...this.calculateOscillatingPlans(this.primaryFuel, baseConfig, true));
    if (this.secondaryFuel) {
      allSolutions.push(...this.calculateOscillatingPlans(this.secondaryFuel, baseConfig, false));
    }

    allSolutions.sort((a, b) => {
      const keyA = [
        a.branchCount,
        Math.round(a.variance * 10) / 10,
        Math.round(a.waste * 10) / 10,
        a.isPrimary ? 0 : 1,
      ];
      const keyB = [
        b.branchCount,
        Math.round(b.variance * 10) / 10,
        Math.round(b.waste * 10) / 10,
        b.isPrimary ? 0 : 1,
      ];
      for (let i = 0; i < keyA.length; i += 1) {
        if (keyA[i] !== keyB[i]) {
          return keyA[i] - keyB[i];
        }
      }
      return 0;
    });

    const outputs: SolutionResult[] = [];
    for (const solution of allSolutions.slice(0, 5)) {
      const baseFuelPerSec =
        baseConfig.generators > 0 ? baseConfig.generators / this.primaryFuel.burnTime : 0;
      const oscillatingFuelPerSec = solution.branches
        ? solution.branches.reduce(
            (sum: number, branch: { denominator: number }) =>
              sum + 1 / (this.inputInterval * branch.denominator),
            0
          )
        : 0;

      outputs.push(
        buildSolutionOutput({
          baseConfig,
          primaryFuel: this.primaryFuel,
          targetPower: this.targetPower,
          inputInterval: this.inputInterval,
          inputSourceId: this.inputSource.id,
          excludeBelt: this.excludeBelt,
          batteryCapacity: this.batteryCapacity,
          baseFuelPerSec,
          solution,
          oscillatingFuelPerSec,
        })
      );
    }

    return outputs;
  }
}
