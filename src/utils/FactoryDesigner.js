import { 
  FUELS, 
  CONSTANTS, 
  getFullBeltPower, 
  getOscillatingPower,
  getGeneratorsPerBelt,
  generateValidDenominators,
  analyzeSplitterComplexity 
} from './constants';

/**
 * 工厂设计器 - 计算最优发电方案
 */
export class FactoryDesigner {
  constructor(params) {
    this.targetPower = params.targetPower;           // 目标发电量 (w)
    this.minBatteryPercent = params.minBatteryPercent; // 最小蓄电量 (%)
    this.maxWaste = params.maxWaste;                 // 功率浪费上限 (w)
    this.primaryFuel = FUELS[params.primaryFuelId];  // 主燃料
    this.secondaryFuel = params.secondaryFuelId !== 'none' ? FUELS[params.secondaryFuelId] : null; // 副燃料
    this.batteryCapacity = CONSTANTS.BATTERY_CAPACITY;
    
    this.validDenominators = generateValidDenominators();
  }

  // 最大公约数
  _gcd(a, b) {
    return !b ? a : this._gcd(b, a % b);
  }

  // 最小公倍数
  _lcm(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / this._gcd(a, b);
  }

  // 计算周期（秒）
  _getCyclePeriod(denominators, fuel) {
    if (denominators.length === 0) return CONSTANTS.BELT_INTERVAL;
    // 所有分支的输入间隔的最小公倍数
    const intervals = denominators.map(d => CONSTANTS.BELT_INTERVAL * d);
    return intervals.reduce((acc, val) => this._lcm(acc, val), CONSTANTS.BELT_INTERVAL);
  }

  // 计算基础发电配置
  calculateBasePower() {
    const basePower = CONSTANTS.BASE_POWER;
    const fuelPower = getFullBeltPower(this.primaryFuel);
    const gensPerBelt = getGeneratorsPerBelt(this.primaryFuel);
    
    // 需要补充的功率
    const needed = this.targetPower - basePower;
    if (needed <= 0) {
      return { generators: 0, totalPower: basePower, belts: 0 };
    }
    
    // 需要多少个满带发电机
    const generators = Math.floor(needed / fuelPower);
    const totalPower = basePower + generators * fuelPower;
    // 需要多少条传送带
    const belts = Math.ceil(generators / gensPerBelt);
    
    return { generators, totalPower, belts };
  }

  // 模拟一个周期的发电
  simulateCycle(baseConfig, oscillatingBranches, fuel) {
    const period = this._getCyclePeriod(oscillatingBranches.map(b => b.denominator), fuel);
    
    if (period > 100000) return { success: false, reason: 'period_too_long' };
    
    const numCycles = 3;
    const totalDuration = period * numCycles;
    
    // 记录每个时刻的发电功率
    const powerTimeline = new Array(Math.ceil(totalDuration)).fill(0);
    // 记录每个分支（每个振荡电池）的燃烧状态：1=燃烧中，0=未燃烧
    const branchBurnTimeline = oscillatingBranches.map(() => new Array(Math.ceil(totalDuration)).fill(0));
    
    // 模拟每个震荡分支
    for (const [branchIndex, branch] of oscillatingBranches.entries()) {
      const inputInterval = CONSTANTS.BELT_INTERVAL * branch.denominator;
      let lastBurnEnd = 0;
      
      for (let t = 0; t < totalDuration; t += inputInterval) {
        const burnStart = Math.max(t, lastBurnEnd);
        const burnEnd = burnStart + fuel.burnTime;
        lastBurnEnd = burnEnd;
        
        for (let i = Math.floor(burnStart); i < Math.min(Math.ceil(burnEnd), totalDuration); i++) {
          powerTimeline[i] += fuel.power;
          branchBurnTimeline[branchIndex][i] = 1;
        }
      }
    }
    
    // 计算统计数据
    const checkStart = Math.floor(totalDuration - period);
    const cyclePower = powerTimeline.slice(checkStart, Math.floor(totalDuration));
    
    // 模拟电池状态
    const minBattRequired = this.batteryCapacity * this.minBatteryPercent / 100;
    let battery = this.batteryCapacity;
    let minBattery = battery;
    const batteryLog = [];
    const powerLog = [];
    const burnStateLog = oscillatingBranches.map(() => []);
    
    // 预热
    for (let t = 0; t < checkStart; t++) {
      const supply = baseConfig.totalPower + powerTimeline[t];
      battery += (supply - this.targetPower);
      if (battery > this.batteryCapacity) battery = this.batteryCapacity;
      if (battery < 0) return { success: false, reason: 'battery_depleted_preheat' };
    }
    
    // 正式周期
    for (let t = checkStart; t < totalDuration; t++) {
      const supply = baseConfig.totalPower + powerTimeline[t];
      const net = supply - this.targetPower;
      battery += net;
      
      if (battery > this.batteryCapacity) battery = this.batteryCapacity;
      if (battery < minBattery) minBattery = battery;
      
      // 采样记录
      if (period < 2000 || ((t - checkStart) % Math.ceil(period / 500) === 0)) {
        batteryLog.push(battery);
        powerLog.push(supply);
        for (let i = 0; i < burnStateLog.length; i++) {
          burnStateLog[i].push(branchBurnTimeline[i][t] || 0);
        }
      }
      
      if (battery < minBattRequired) {
        return { success: false, reason: 'battery_below_min', minBattery };
      }
    }
    
    // 计算平均功率和方差
    const avgPower = cyclePower.reduce((a, b) => a + b, 0) / cyclePower.length + baseConfig.totalPower;
    const variance = cyclePower.reduce((sum, p) => sum + Math.pow(p - (avgPower - baseConfig.totalPower), 2), 0) / cyclePower.length;
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
    };
  }

  // 生成组合
  _getCombinations(arr, len) {
    if (len === 1) return arr.map(x => [x]);
    const combs = [];
    arr.forEach((v, i) => {
      const sub = this._getCombinations(arr.slice(i), len - 1);
      sub.forEach(s => combs.push([v, ...s]));
    });
    return combs;
  }

  // 计算单个燃料的震荡方案
  calculateOscillatingPlans(fuel, baseConfig, isPrimary) {
    const gap = this.targetPower - baseConfig.totalPower;
    if (gap <= 0) return [];
    
    const solutions = [];
    const maxBranches = 3;
    
    for (let r = 1; r <= maxBranches; r++) {
      const combos = this._getCombinations(this.validDenominators, r);
      
      for (const combo of combos) {
        // 计算理论平均功率
        const theoryPower = combo.reduce((acc, d) => acc + getOscillatingPower(fuel, d), 0);
        const theoryTotal = baseConfig.totalPower + theoryPower;
        const theoryWaste = theoryTotal - this.targetPower;
        
        // 快速过滤：只接受正溢出的方案（负溢出会断电）
        if (theoryWaste < 0 || theoryWaste > this.maxWaste + 10) continue;
        
        const branches = combo.map(d => ({ denominator: d, fuel }));
        const result = this.simulateCycle(baseConfig, branches, fuel);
        
        if (result.success && result.waste <= this.maxWaste && result.waste >= 0) {
          const complexity = combo.map(d => analyzeSplitterComplexity(d));
          const totalSplitters = complexity.reduce((sum, c) => sum + c.total, 0);
          
          solutions.push({
            fuel,
            isPrimary,
            branches: combo.map((d, i) => ({
              denominator: d,
              power: getOscillatingPower(fuel, d),
              complexity: complexity[i],
            })),
            branchCount: combo.length,
            totalSplitters,
            ...result,
          });
        }
      }
    }
    
    return solutions;
  }

  // 主求解函数
  solve() {
    // 1. 计算基础发电配置
    const baseConfig = this.calculateBasePower();
    
    // 2. 如果基础发电已足够
    if (baseConfig.totalPower >= this.targetPower) {
      const waste = baseConfig.totalPower - this.targetPower;
      if (waste <= this.maxWaste) {
        // 计算基础发电的燃料消耗
        const baseFuelPerSec = baseConfig.generators > 0 ? 
          (baseConfig.generators / getGeneratorsPerBelt(this.primaryFuel)) * CONSTANTS.BELT_SPEED : 0;
        
        return [{
          baseConfig,
          baseFuel: this.primaryFuel,  // 基础发电燃料
          oscillating: null,
          oscillatingFuel: null,       // 震荡发电燃料
          fuel: this.primaryFuel,      // 保持兼容
          isPrimary: true,
          avgPower: baseConfig.totalPower,
          waste,
          variance: 0,
          period: 0,
          minBatteryPercent: 100,
          branchCount: 0,
          totalSplitters: 0,
          batteryLog: [this.batteryCapacity],
          powerLog: [baseConfig.totalPower],
          burnStateLog: [],
          fuelConsumption: {
            base: {
              fuel: this.primaryFuel,
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
        }];
      }
    }
    
    // 3. 计算震荡发电方案
    let allSolutions = [];
    
    // 使用主燃料的方案
    const primarySolutions = this.calculateOscillatingPlans(this.primaryFuel, baseConfig, true);
    allSolutions.push(...primarySolutions);
    
    // 使用副燃料的方案（如果有）
    if (this.secondaryFuel) {
      const secondarySolutions = this.calculateOscillatingPlans(this.secondaryFuel, baseConfig, false);
      allSolutions.push(...secondarySolutions);
    }
    
    // 4. 排序：路数少 > 方差小 > 浪费少 > 仅使用主燃料
    allSolutions.sort((a, b) => {
      // 路数少优先
      if (a.branchCount !== b.branchCount) return a.branchCount - b.branchCount;
      // 方差小优先
      if (Math.abs(a.variance - b.variance) > 0.1) return a.variance - b.variance;
      // 浪费少优先
      if (Math.abs(a.waste - b.waste) > 0.1) return a.waste - b.waste;
      // 主燃料优先
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return 0;
    });
    
    // 5. 返回前5个方案
    const topSolutions = allSolutions.slice(0, 5).map(sol => {
      // 计算燃料消耗
      // 基础发电消耗（主燃料）：每条带消耗 = BELT_SPEED 个/秒
      const baseFuelPerSec = baseConfig.generators > 0 ? 
        (baseConfig.generators / getGeneratorsPerBelt(this.primaryFuel)) * CONSTANTS.BELT_SPEED : 0;
      
      // 震荡发电消耗（可能是主燃料或副燃料）
      const oscillatingFuelPerSec = sol.branches ? 
        sol.branches.reduce((sum, b) => sum + 1 / (CONSTANTS.BELT_INTERVAL * b.denominator), 0) : 0;
      
      return {
        baseConfig,
        baseFuel: this.primaryFuel,     // 基础发电始终使用主燃料
        oscillating: sol.branches,
        oscillatingFuel: sol.fuel,      // 震荡发电燃料
        fuel: sol.fuel,                 // 保持兼容
        isPrimary: sol.isPrimary,
        avgPower: sol.avgPower,
        waste: sol.waste,
        variance: sol.variance,
        period: sol.period,
        minBattery: sol.minBattery,
        minBatteryPercent: sol.minBatteryPercent,
        branchCount: sol.branchCount,
        totalSplitters: sol.totalSplitters,
        batteryLog: sol.batteryLog,
        powerLog: sol.powerLog,
        burnStateLog: sol.burnStateLog,
        // 燃料消耗数据 - 分别记录
        fuelConsumption: {
          base: {
            fuel: this.primaryFuel,
            perSecond: baseFuelPerSec,
            perMinute: baseFuelPerSec * 60,
            perHour: baseFuelPerSec * 3600,
            perDay: baseFuelPerSec * 86400,
          },
          oscillating: {
            fuel: sol.fuel,
            perSecond: oscillatingFuelPerSec,
            perMinute: oscillatingFuelPerSec * 60,
            perHour: oscillatingFuelPerSec * 3600,
            perDay: oscillatingFuelPerSec * 86400,
          },
        },
      };
    });
    
    return topSolutions;
  }
}
