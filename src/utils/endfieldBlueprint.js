import { strToU8, zipSync } from 'fflate';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { CONSTANTS, formatTime } from './constants';

const DEFAULT_BLUEPRINT_ICON = Object.freeze({
  icon: 'blueprint_default_icon',
  baseColor: 101,
});

const DEFAULT_BLUEPRINT_PARAM = Object.freeze({
  sourceType: 2,
  myBpUid: 0,
  hasMyBpUid: false,
  sysBpKey: '',
  hasSysBpKey: false,
  giftBpKey: {
    bpUid: 4,
    targetRoleId: 1000041441,
    shareIdx: 1,
  },
  presetBpKey: '',
  hasPresetBpKey: false,
  opPayloadCase: 13,
});

const DEFAULT_META = Object.freeze({
  creatorRoleId: 1000041441,
  creatorUserId: '0000000000',
  reviewStatus: 2,
  useCount: 0,
  isNew: false,
  fetchTime: 0,
});

const BELT_TEMPLATE_ID = 'grid_belt_01';
const FACE_ARROW = Object.freeze({
  UP: '^',
  DOWN: 'v',
  LEFT: '<',
  RIGHT: '>',
});

const BLUEPRINT_IMAGE_ASSET = Object.freeze({
  belt: '/svg/icon_belt_grid.png',
  left_turn_belt: '/svg/icon_belt_corner_1.png',
  right_turn_belt: '/svg/icon_belt_corner_1.png',
  conveyor_bridge: '/svg/bg_logistic_log_connector.png',
  splitter: '/svg/bg_logistic_log_splitter.png',
  converger: '/svg/bg_logistic_log_converger.png',
});

const BRANCH_PNG_STYLE = Object.freeze({
  outerPadding: 12,
  headerHeight: 18,
  headerGap: 6,
  gridPadding: 8,
  cellSize: 40,
  fontFamilyFallback: '"Frex Sans GB VF", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
});

const PRECISE_CHART_STYLE = Object.freeze({
  width: 1600,
  height: 900,
  background: '#0d1218',
  legendColor: '#666666',
  textColor: '#888888',
  powerColor: '#d4ff00',
  targetColor: '#ff6b6b',
  batteryColor: '#4ecdc4',
  minBatteryThresholdColor: '#ffd166',
  burnColor: '#ff9f43',
  gridColor: '#1a1a1a',
});

const COMPLETE_EXPORT_IMAGE_STYLE = Object.freeze({
  width: 1800,
  padding: 32,
  sectionGap: 24,
  cardPadding: 18,
  branchGap: 16,
  background: '#0d1218',
  panelBackground: 'rgba(20, 26, 34, 0.95)',
  panelBorder: 'rgba(141, 149, 162, 0.8)',
  titleColor: '#f2d378',
  subtitleColor: '#98a5b7',
  textColor: '#d7deea',
  dimTextColor: '#9ba9bc',
});

const imageCache = new Map();

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function vec3(x, y, z) {
  return { x, y, z };
}

function cloneBpParam(param = DEFAULT_BLUEPRINT_PARAM) {
  return {
    sourceType: param.sourceType,
    myBpUid: param.myBpUid,
    hasMyBpUid: param.hasMyBpUid,
    sysBpKey: param.sysBpKey,
    hasSysBpKey: param.hasSysBpKey,
    giftBpKey: {
      bpUid: param.giftBpKey?.bpUid ?? DEFAULT_BLUEPRINT_PARAM.giftBpKey.bpUid,
      targetRoleId: param.giftBpKey?.targetRoleId ?? DEFAULT_BLUEPRINT_PARAM.giftBpKey.targetRoleId,
      shareIdx: param.giftBpKey?.shareIdx ?? DEFAULT_BLUEPRINT_PARAM.giftBpKey.shareIdx,
    },
    presetBpKey: param.presetBpKey,
    hasPresetBpKey: param.hasPresetBpKey,
    opPayloadCase: param.opPayloadCase,
  };
}

function createStructureNode(nodeId, templateId, x, z, rotationY) {
  const interactivePosition =
    templateId === 'power_station_1' ? vec3(x, 0, z + 1) : vec3(x + 0.5, 0, z + 0.5);

  return {
    templateId,
    productIcon: '',
    nodeId,
    transform: {
      position: vec3(x, 0, z),
      direction: vec3(0, rotationY, 0),
      interactiveParam: {
        position: interactivePosition,
        rotation: vec3(0, rotationY, 0),
        properties: {},
      },
      directionIn: null,
      directionOut: null,
      points: [],
    },
    coms: [],
  };
}

function createBeltNode(nodeId, directionInY, directionOutY, points) {
  const normalizedPoints = points.length === 1 ? [points[0], points[0]] : points;
  return {
    templateId: BELT_TEMPLATE_ID,
    productIcon: '',
    nodeId,
    transform: {
      position: null,
      direction: null,
      interactiveParam: null,
      directionIn: vec3(0, directionInY, 0),
      directionOut: vec3(0, directionOutY, 0),
      points: normalizedPoints.map(({ x, z }) => vec3(x, 0, z)),
    },
    coms: [],
  };
}

function getBlueprintHeight(blueprint) {
  return Array.isArray(blueprint) ? blueprint.length : 0;
}

function getBlueprintWidth(blueprint) {
  if (!Array.isArray(blueprint) || blueprint.length === 0 || !Array.isArray(blueprint[0])) {
    return 0;
  }
  return blueprint[0].length;
}

function toGameZ(row, height) {
  return height - 1 - row;
}

function assertValidBranchBlueprint(branch) {
  const blueprint = branch?.blueprint;
  if (!Array.isArray(blueprint) || blueprint.length === 0 || !Array.isArray(blueprint[0])) {
    throw new Error('Invalid branch blueprint data.');
  }
}

function collectBlueprintParts(blueprint) {
  const parts = {
    splitters: [],
    topConvergers: [],
    bottomConvergers: [],
    topBelts: [],
    bottomBelts: [],
    thermalCol: null,
    topTurnCol: null,
    bottomTurnCol: null,
    hasInputSource: false,
    hasTopRecycleSource: false,
    hasBottomRecycleSource: false,
  };

  const height = getBlueprintHeight(blueprint);
  const middleRow = Math.floor(height / 2);
  const topBeltRow = middleRow - 1;
  const bottomBeltRow = middleRow + 1;

  for (let row = 0; row < blueprint.length; row += 1) {
    const cells = blueprint[row];
    for (let col = 0; col < cells.length; col += 1) {
      const part = cells[col];
      if (!part?.partId) continue;

      switch (part.partId) {
        case 'splitter':
          if (row === middleRow) parts.splitters.push(col);
          break;
        case 'converger':
          if (row === 0) parts.topConvergers.push(col);
          if (row === height - 1) parts.bottomConvergers.push(col);
          break;
        case 'belt':
          if (row === topBeltRow) parts.topBelts.push(col);
          if (row === bottomBeltRow) parts.bottomBelts.push(col);
          break;
        case 'left_turn_belt':
          if (row === 0) parts.topTurnCol = col;
          break;
        case 'right_turn_belt':
          if (row === height - 1) parts.bottomTurnCol = col;
          break;
        case 'thermal_bank':
          if (row === middleRow) parts.thermalCol = col;
          break;
        case 'input_source':
          if (row === middleRow) parts.hasInputSource = true;
          break;
        case 'recycle_source':
          if (row === 0) parts.hasTopRecycleSource = true;
          if (row === height - 1) parts.hasBottomRecycleSource = true;
          break;
        default:
          break;
      }
    }
  }

  parts.splitters.sort((a, b) => a - b);
  parts.topConvergers.sort((a, b) => a - b);
  parts.bottomConvergers.sort((a, b) => a - b);
  parts.topBelts.sort((a, b) => a - b);
  parts.bottomBelts.sort((a, b) => a - b);

  return parts;
}

function buildNodesFromBranch(branch) {
  assertValidBranchBlueprint(branch);
  const blueprint = branch.blueprint;
  const width = getBlueprintWidth(blueprint);
  const height = getBlueprintHeight(blueprint);
  const middleRow = Math.floor(height / 2);
  const topBeltRow = middleRow - 1;
  const bottomBeltRow = middleRow + 1;
  const parts = collectBlueprintParts(blueprint);

  if (parts.thermalCol == null) {
    throw new Error('Thermal bank is missing in branch blueprint.');
  }

  const nodes = [];
  let nodeId = 1;

  nodes.push(
    createStructureNode(
      nodeId++,
      'power_station_1',
      parts.thermalCol + 1,
      toGameZ(middleRow, height),
      270,
    ),
  );

  for (const col of parts.splitters) {
    nodes.push(
      createStructureNode(nodeId++, 'log_splitter', col, toGameZ(middleRow, height), 270),
    );
  }

  for (const col of parts.topConvergers) {
    nodes.push(createStructureNode(nodeId++, 'log_converger', col, toGameZ(0, height), 90));
  }

  for (const col of parts.bottomConvergers) {
    nodes.push(
      createStructureNode(nodeId++, 'log_converger', col, toGameZ(height - 1, height), 90),
    );
  }

  const mergeBottomSourceIntoTurn =
    parts.hasBottomRecycleSource &&
    parts.bottomTurnCol != null &&
    parts.bottomBelts.length <= 1;

  if (parts.bottomTurnCol != null) {
    const points = [
      { x: parts.bottomTurnCol, z: toGameZ(bottomBeltRow, height) },
      { x: parts.bottomTurnCol, z: toGameZ(height - 1, height) },
    ];
    if (mergeBottomSourceIntoTurn) {
      points.push({ x: 0, z: toGameZ(height - 1, height) });
    }
    nodes.push(createBeltNode(nodeId++, 180, 270, points));
  }

  if (parts.hasTopRecycleSource) {
    nodes.push(createBeltNode(nodeId++, 270, 270, [{ x: 0, z: toGameZ(0, height) }]));
  }

  if (parts.hasInputSource) {
    nodes.push(createBeltNode(nodeId++, 90, 90, [{ x: 0, z: toGameZ(middleRow, height) }]));
  }

  if (parts.hasBottomRecycleSource && !mergeBottomSourceIntoTurn) {
    nodes.push(
      createBeltNode(nodeId++, 270, 270, [{ x: 0, z: toGameZ(height - 1, height) }]),
    );
  }

  if (parts.topTurnCol != null) {
    nodes.push(
      createBeltNode(nodeId++, 0, 270, [
        { x: parts.topTurnCol, z: toGameZ(topBeltRow, height) },
        { x: parts.topTurnCol, z: toGameZ(0, height) },
      ]),
    );
  }

  for (const col of [...parts.topBelts].sort((a, b) => b - a)) {
    if (col === parts.topTurnCol) continue;
    nodes.push(createBeltNode(nodeId++, 0, 0, [{ x: col, z: toGameZ(topBeltRow, height) }]));
  }

  for (const col of [...parts.bottomBelts].sort((a, b) => b - a)) {
    if (col === parts.bottomTurnCol) continue;
    nodes.push(
      createBeltNode(nodeId++, 180, 180, [{ x: col, z: toGameZ(bottomBeltRow, height) }]),
    );
  }

  return { nodes, width, height };
}

function defaultBlueprintName(branch) {
  const denominator = Number(branch?.denominator);
  if (Number.isFinite(denominator) && denominator > 0) {
    return `1/${denominator}`;
  }
  return 'Blueprint';
}

function getBranchDenominatorToken(branch) {
  const denominator = Number(branch?.denominator);
  if (Number.isFinite(denominator) && denominator > 0) {
    return String(denominator);
  }
  return 'unknown';
}

function getBranchPowerToken(branch) {
  const power = Number(branch?.power);
  if (Number.isFinite(power)) {
    return `${Math.round(power)}w`;
  }
  return 'unknownw';
}

function getDefaultBranchStem(branch) {
  return `dige_branch_1_${getBranchDenominatorToken(branch)}_${getBranchPowerToken(branch)}`;
}

function getIndexedBranchStem(branch, index) {
  return `branch_${index + 1}_1_${getBranchDenominatorToken(branch)}_${getBranchPowerToken(branch)}`;
}

function getDefaultFileName(branch) {
  return `${getDefaultBranchStem(branch)}_blueprint.json`;
}

function getDefaultPngFileName(branch) {
  return `${getDefaultBranchStem(branch)}.png`;
}

function getDefaultZipFileName(branches) {
  const count = Array.isArray(branches) ? branches.length : 0;
  const totalPower = Array.isArray(branches)
    ? branches.reduce((sum, branch) => {
      const power = Number(branch?.power);
      return sum + (Number.isFinite(power) ? power : 0);
    }, 0)
    : 0;
  const powerToken = `${Math.round(totalPower)}w`;

  if (count > 0) {
    return `dige_branches_all_${count}_${powerToken}.zip`;
  }
  return 'dige_branches_all.zip';
}

function getDefaultCompleteImageFileName(branches) {
  const count = Array.isArray(branches) ? branches.length : 0;
  const totalPower = Array.isArray(branches)
    ? branches.reduce((sum, branch) => {
      const power = Number(branch?.power);
      return sum + (Number.isFinite(power) ? power : 0);
    }, 0)
    : 0;
  const powerToken = `${Math.round(totalPower)}w`;
  return `dige_export_full_${count}_${powerToken}.png`;
}

function getExportTargetPower(solution, options = {}) {
  const explicitTarget = Number(options.targetPower);
  if (Number.isFinite(explicitTarget)) {
    return explicitTarget;
  }

  const avgPower = Number(solution?.avgPower);
  const waste = Number(solution?.waste);
  if (Number.isFinite(avgPower) && Number.isFinite(waste)) {
    return avgPower - waste;
  }
  return 0;
}

function getPreciseChartLabels(labels = {}) {
  return {
    currentPower: labels.currentPower || 'Current Power',
    targetPowerLine: labels.targetPowerLine || 'Target Power',
    batteryLevel: labels.batteryLevel || 'Battery Level',
    minBatteryPercent: labels.minBatteryPercent || 'Min Battery (%)',
    branch: labels.branch || 'Branch',
    burnStateShort: labels.burnStateShort || 'Burn',
    powerAxis: labels.powerAxis || 'Power',
    batteryAxis: labels.batteryAxis || 'Battery',
    stateOn: labels.stateOn || 'On',
    stateOff: labels.stateOff || 'Off',
  };
}

function roundNumber(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

function toFiniteOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildExportParamsPayload({
  params,
  solution,
  branches,
  includePng,
  includePreciseChart,
  targetPower,
}) {
  const safeParams = params && typeof params === 'object'
    ? {
      targetPower: toFiniteOrNull(params.targetPower),
      minBatteryPercent: toFiniteOrNull(params.minBatteryPercent),
      maxWaste: toFiniteOrNull(params.maxWaste),
      maxBranches: toFiniteOrNull(params.maxBranches),
      exclude_belt:
          typeof params.exclude_belt === 'boolean' ? params.exclude_belt : null,
      primaryFuelId: params.primaryFuelId ?? null,
      secondaryFuelId: params.secondaryFuelId ?? null,
      inputSourceId: params.inputSourceId ?? null,
    }
    : null;

  const branchList = Array.isArray(branches)
    ? branches.map((branch, index) => ({
      index: index + 1,
      denominator: Number(branch?.denominator),
      power: roundNumber(branch?.power, 2),
      fileStem: getIndexedBranchStem(branch, index),
    }))
    : [];

  return {
    exportedAt: new Date().toISOString(),
    files: {
      branchJson: true,
      branchPng: includePng,
      preciseChartPng: includePreciseChart,
    },
    targetPower: roundNumber(targetPower, 2),
    params: safeParams,
    solutionSummary: solution
      ? {
        avgPower: roundNumber(solution.avgPower, 2),
        waste: roundNumber(solution.waste, 2),
        variance: roundNumber(solution.variance, 4),
        period: Number(solution.period ?? 0),
        minBattery: roundNumber(solution.minBattery, 2),
        minBatteryPercent: roundNumber(solution.minBatteryPercent, 4),
        branchCount: Number(solution.branchCount ?? branchList.length),
        totalSplitters: Number(solution.totalSplitters ?? 0),
      }
      : null,
    branches: branchList,
  };
}

function getCompleteExportLabels(labels = {}) {
  return {
    title: labels.title || 'D.I.G.E. Complete Export',
    exportTime: labels.exportTime || 'Export Time',
    parameters: labels.parameters || 'Parameters',
    summary: labels.summary || 'Summary',
    branches: labels.branches || 'Branches',
    chart: labels.chart || 'Precise Chart',
    targetPower: labels.targetPower || 'Target Power',
    minBatteryPercent: labels.minBatteryPercent || 'Min Battery (%)',
    maxWaste: labels.maxWaste || 'Max Waste',
    maxBranches: labels.maxBranches || 'Max Branches',
    excludeBelt: labels.excludeBelt || 'Exclude Belts',
    primaryFuel: labels.primaryFuel || 'Primary Fuel',
    secondaryFuel: labels.secondaryFuel || 'Secondary Fuel',
    inputSource: labels.inputSource || 'Input Source',
    actualPower: labels.actualPower || 'Actual Power',
    cyclePeriod: labels.cyclePeriod || 'Cycle Period',
    variance: labels.variance || 'Variance',
    minBattery: labels.minBattery || 'Min Battery',
    branchCount: labels.branchCount || 'Branches',
    totalSplitters: labels.totalSplitters || 'Total Splitters',
    stateOn: labels.stateOn || 'On',
    stateOff: labels.stateOff || 'Off',
    excludeBeltOn: labels.excludeBeltOn || 'Enabled',
    excludeBeltOff: labels.excludeBeltOff || 'Disabled',
    branch: labels.branch || 'Branch',
    primaryFuelNameMap:
      labels.primaryFuelNameMap && typeof labels.primaryFuelNameMap === 'object'
        ? labels.primaryFuelNameMap
        : null,
    secondaryFuelNameMap:
      labels.secondaryFuelNameMap && typeof labels.secondaryFuelNameMap === 'object'
        ? labels.secondaryFuelNameMap
        : null,
    inputSourceNameMap:
      labels.inputSourceNameMap && typeof labels.inputSourceNameMap === 'object'
        ? labels.inputSourceNameMap
        : null,
  };
}

function formatExportValue(value, fallback = '-') {
  if (value == null) return fallback;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : fallback;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  const text = String(value).trim();
  return text || fallback;
}

function wrapTextLines(context, text, maxWidth) {
  const value = String(text ?? '');
  if (!value) return [''];
  if (context.measureText(value).width <= maxWidth) return [value];

  if (!value.includes(' ')) {
    const lines = [];
    let current = '';
    for (const char of value) {
      const next = current + char;
      if (current && context.measureText(next).width > maxWidth) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  const words = value.split(' ');
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (current && context.measureText(next).width > maxWidth) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });
  if (current) lines.push(current);
  return lines;
}

function buildCompleteInfoSections(payload, labels) {
  const params = payload?.params || {};
  const summary = payload?.solutionSummary || {};
  const resolveMappedValue = (value, nameMap) => {
    if (value == null) return '-';
    const key = String(value);
    const mappedValue =
      nameMap && Object.prototype.hasOwnProperty.call(nameMap, key) ? nameMap[key] : '';
    if (typeof mappedValue === 'string' && mappedValue.trim()) {
      return mappedValue.trim();
    }
    return formatExportValue(value);
  };
  const excludeBeltValue =
    typeof params.exclude_belt === 'boolean'
      ? params.exclude_belt
        ? labels.excludeBeltOn
        : labels.excludeBeltOff
      : formatExportValue(params.exclude_belt);

  return {
    parameters: [
      { label: labels.targetPower, value: `${formatExportValue(payload?.targetPower)}w` },
      { label: labels.minBatteryPercent, value: `${formatExportValue(params.minBatteryPercent)}%` },
      { label: labels.maxWaste, value: formatExportValue(params.maxWaste) },
      { label: labels.maxBranches, value: formatExportValue(params.maxBranches) },
      { label: labels.excludeBelt, value: excludeBeltValue },
      {
        label: labels.primaryFuel,
        value: resolveMappedValue(params.primaryFuelId, labels.primaryFuelNameMap),
      },
      {
        label: labels.secondaryFuel,
        value: resolveMappedValue(params.secondaryFuelId, labels.secondaryFuelNameMap),
      },
      {
        label: labels.inputSource,
        value: resolveMappedValue(params.inputSourceId, labels.inputSourceNameMap),
      },
    ],
    summary: [
      { label: labels.actualPower, value: `${formatExportValue(summary.avgPower)}w` },
      { label: labels.cyclePeriod, value: `${formatExportValue(summary.period)}s` },
      { label: labels.variance, value: formatExportValue(summary.variance) },
      {
        label: labels.minBattery,
        value: `${formatExportValue(summary.minBattery)} (${formatExportValue(summary.minBatteryPercent)}%)`,
      },
      { label: labels.branchCount, value: formatExportValue(summary.branchCount) },
      { label: labels.totalSplitters, value: formatExportValue(summary.totalSplitters) },
    ],
  };
}

function getBlueprintImageRotation(part) {
  if (!part?.partId) return 0;
  const face = part.face || 'RIGHT';

  switch (part.partId) {
    case 'belt':
      switch (face) {
        case 'LEFT':
          return 0;
        case 'RIGHT':
          return 180;
        case 'UP':
          return -90;
        case 'DOWN':
          return 90;
        default:
          return 0;
      }
    case 'left_turn_belt':
      return 180;
    case 'right_turn_belt':
      return 0;
    case 'conveyor_bridge':
      switch (face) {
        case 'DOWN':
          return 0;
        case 'UP':
          return 180;
        case 'LEFT':
          return 90;
        case 'RIGHT':
          return -90;
        default:
          return 0;
      }
    case 'splitter':
      switch (face) {
        case 'RIGHT':
          return -90;
        case 'LEFT':
          return 90;
        case 'UP':
          return 180;
        case 'DOWN':
          return 0;
        default:
          return -90;
      }
    case 'converger':
      switch (face) {
        case 'DOWN':
          return 0;
        case 'UP':
          return 180;
        case 'LEFT':
          return 90;
        case 'RIGHT':
          return -90;
        default:
          return 0;
      }
    default:
      return 0;
  }
}

function getBlueprintImageMirror(part) {
  return part?.partId === 'right_turn_belt';
}

function getCellFallbackToken(part) {
  if (!part?.partId) return '';
  switch (part.partId) {
    case 'input_source':
      return 'I';
    case 'thermal_bank':
      return 'T';
    case 'recycle_source':
      return 'R';
    default:
      return FACE_ARROW[part?.face] || '>';
  }
}

function getCellColors(part) {
  if (!part?.partId) {
    return {
      border: 'rgba(138, 145, 156, 0.2)',
      background: 'rgba(0, 0, 0, 0.12)',
      text: 'rgba(255, 255, 255, 0)',
    };
  }

  switch (part.partId) {
    case 'input_source':
      return {
        border: 'rgba(188, 197, 210, 0.78)',
        background: 'rgba(58, 67, 79, 0.85)',
        text: '#d8dee7',
      };
    case 'thermal_bank':
      return {
        border: 'rgba(229, 196, 100, 0.9)',
        background: 'rgba(197, 160, 70, 0.18)',
        text: '#f1d173',
      };
    case 'recycle_source':
      return {
        border: 'rgba(140, 148, 162, 0.75)',
        background: 'rgba(58, 67, 79, 0.85)',
        text: '#c2cad8',
      };
    default:
      return {
        border: 'rgba(141, 149, 162, 0.95)',
        background: 'rgba(0, 0, 0, 0.7)',
        text: '#d7deea',
      };
  }
}

function resolveAssetUrl(path) {
  if (!path) return path;
  try {
    return new URL(path, window.location.origin).toString();
  } catch (error) {
    return path;
  }
}

function loadImageAsset(path) {
  const key = resolveAssetUrl(path);
  if (imageCache.has(key)) {
    return imageCache.get(key);
  }

  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image asset: ${path}`));
    image.src = key;
  });

  imageCache.set(key, promise);
  return promise;
}

async function preloadBlueprintImages(blueprint) {
  const partIds = new Set();
  blueprint.forEach((row) => {
    row.forEach((part) => {
      if (part?.partId && BLUEPRINT_IMAGE_ASSET[part.partId]) {
        partIds.add(part.partId);
      }
    });
  });

  const images = new Map();
  await Promise.all(
    [...partIds].map(async (partId) => {
      try {
        const image = await loadImageAsset(BLUEPRINT_IMAGE_ASSET[partId]);
        images.set(partId, image);
      } catch (error) {
        // Keep PNG export available even when one asset cannot be loaded.
        console.warn(error);
      }
    }),
  );
  return images;
}

function getCanvasFontFamily(options = {}) {
  if (typeof options.fontFamily === 'string' && options.fontFamily.trim()) {
    return options.fontFamily.trim();
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const body = document.body;
    if (body) {
      const computedFont = window.getComputedStyle(body).fontFamily;
      if (typeof computedFont === 'string' && computedFont.trim()) {
        return computedFont.trim();
      }
    }
  }

  return BRANCH_PNG_STYLE.fontFamilyFallback;
}

async function ensureCanvasFontReady(fontFamily) {
  if (typeof document === 'undefined' || !document.fonts?.ready) return;

  try {
    await document.fonts.ready;
    // Try to ensure the exact face used by canvas is loaded.
    await document.fonts.load(`700 13px ${fontFamily}`);
  } catch (error) {
    // If loading fails, canvas will fallback gracefully.
    console.warn('Canvas font preload failed:', error);
  }
}

async function canvasToBlob(canvas, type = 'image/png') {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
        return;
      }
      reject(new Error(`Failed to generate ${type} data.`));
    }, type);
  });
  return blob;
}

function getPreciseSeries(solution) {
  const batteryLog = Array.isArray(solution?.preciseBatteryLog) && solution.preciseBatteryLog.length > 0
    ? solution.preciseBatteryLog
    : solution?.batteryLog;
  const powerLog = Array.isArray(solution?.precisePowerLog) && solution.precisePowerLog.length > 0
    ? solution.precisePowerLog
    : solution?.powerLog;
  const burnStateLog = Array.isArray(solution?.preciseBurnStateLog) && solution.preciseBurnStateLog.length > 0
    ? solution.preciseBurnStateLog
    : solution?.burnStateLog;

  return {
    batteryLog: Array.isArray(batteryLog) ? batteryLog : [],
    powerLog: Array.isArray(powerLog) ? powerLog : [],
    burnStateLog: Array.isArray(burnStateLog) ? burnStateLog : [],
  };
}

async function buildPreciseChartPngBlob(solution, options = {}) {
  const { batteryLog, powerLog, burnStateLog } = getPreciseSeries(solution);
  if (batteryLog.length === 0 || powerLog.length === 0) {
    throw new Error('No precise chart data available for export.');
  }

  const labels = getPreciseChartLabels(options.chartLabels);
  const fontFamily = getCanvasFontFamily(options);
  await ensureCanvasFontReady(fontFamily);

  const width = Number.isFinite(options.chartWidth)
    ? Math.max(800, Math.round(options.chartWidth))
    : PRECISE_CHART_STYLE.width;
  const height = Number.isFinite(options.chartHeight)
    ? Math.max(450, Math.round(options.chartHeight))
    : PRECISE_CHART_STYLE.height;
  const targetPower = getExportTargetPower(solution, options);
  const batteryCapacity = Number.isFinite(options.batteryCapacity)
    ? options.batteryCapacity
    : CONSTANTS.BATTERY_CAPACITY;
  const minBatteryThreshold = Number.isFinite(options.minBatteryThreshold)
    ? Math.min(100, Math.max(0, Number(options.minBatteryThreshold)))
    : null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }
  ctx.fillStyle = PRECISE_CHART_STYLE.background;
  ctx.fillRect(0, 0, width, height);

  const xValues = batteryLog.map((_, i) => i);
  const batteryPercent = batteryLog.map((value) => {
    const ratio = batteryCapacity > 0 ? (value / batteryCapacity) * 100 : 0;
    return Math.min(100, Math.max(0, ratio));
  });

  const burnStateDatasets = burnStateLog.map((series, index) => ({
    label: `${labels.branch} ${index + 1} ${labels.burnStateShort}`,
    data: xValues.map((x, pointIndex) => ({ x, y: series[pointIndex] > 0 ? index + 1 : null })),
    borderColor: PRECISE_CHART_STYLE.burnColor,
    backgroundColor: 'rgba(255, 159, 67, 0.12)',
    borderWidth: 2,
    pointRadius: 0,
    fill: false,
    stepped: true,
    spanGaps: false,
    yAxisID: 'y2',
  }));

  const chart = new ChartJS(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: labels.currentPower,
          data: xValues.map((x, i) => ({ x, y: powerLog[i] ?? null })),
          borderColor: PRECISE_CHART_STYLE.powerColor,
          backgroundColor: 'rgba(212, 255, 0, 0.05)',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: true,
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: labels.targetPowerLine,
          data: xValues.map((x) => ({ x, y: targetPower })),
          borderColor: PRECISE_CHART_STYLE.targetColor,
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
          yAxisID: 'y',
        },
        {
          label: labels.batteryLevel,
          data: xValues.map((x, i) => ({ x, y: batteryPercent[i] ?? null })),
          borderColor: PRECISE_CHART_STYLE.batteryColor,
          backgroundColor: 'rgba(78, 205, 196, 0.05)',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: true,
          tension: 0.1,
          yAxisID: 'y1',
        },
        ...(minBatteryThreshold === null
          ? []
          : [{
            label: labels.minBatteryPercent,
            data: xValues.map((x) => ({ x, y: minBatteryThreshold })),
            borderColor: PRECISE_CHART_STYLE.minBatteryThresholdColor,
            borderWidth: 1,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
            yAxisID: 'y1',
          }]),
        ...burnStateDatasets,
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      parsing: false,
      normalized: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'start',
          labels: {
            color: PRECISE_CHART_STYLE.legendColor,
            font: { family: fontFamily, size: 16 },
            boxWidth: 16,
            boxHeight: 16,
            padding: 16,
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#1a1a1a',
          titleColor: PRECISE_CHART_STYLE.textColor,
          bodyColor: '#cccccc',
          borderColor: '#333333',
          borderWidth: 1,
          titleFont: { family: fontFamily, size: 14 },
          bodyFont: { family: fontFamily, size: 14 },
          callbacks: {
            title: (items) => {
              if (!items || items.length === 0) return '';
              const x = Number(items[0]?.parsed?.x ?? 0);
              return formatTime(Math.max(0, x));
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed?.y;
              if (context.dataset.yAxisID === 'y1') {
                return `${label}: ${Number(value).toFixed(1)}%`;
              }
              if (context.dataset.yAxisID === 'y2') {
                return value ? `${label}: ${labels.stateOn}` : `${label}: ${labels.stateOff}`;
              }
              return `${label}: ${Math.round(Number(value) || 0)}w`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          display: true,
          min: 0,
          max: Math.max(0, xValues.length - 1),
          grid: { color: PRECISE_CHART_STYLE.gridColor },
          ticks: {
            color: PRECISE_CHART_STYLE.textColor,
            font: { family: fontFamily, size: 14 },
            maxTicksLimit: 8,
            callback: (value) => formatTime(Math.max(0, Number(value))),
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: PRECISE_CHART_STYLE.gridColor },
          ticks: {
            color: PRECISE_CHART_STYLE.powerColor,
            font: { family: fontFamily, size: 14 },
            maxTicksLimit: 7,
          },
          title: {
            display: true,
            text: `${labels.powerAxis} (w)`,
            color: PRECISE_CHART_STYLE.powerColor,
            font: { family: fontFamily, size: 14 },
          },
          min: 0,
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: PRECISE_CHART_STYLE.batteryColor,
            font: { family: fontFamily, size: 14 },
            callback: (value) => `${value}%`,
            maxTicksLimit: 7,
          },
          title: {
            display: true,
            text: `${labels.batteryAxis} (%)`,
            color: PRECISE_CHART_STYLE.batteryColor,
            font: { family: fontFamily, size: 14 },
          },
          min: 0,
          max: 100,
        },
        y2: {
          type: 'linear',
          display: false,
          position: 'right',
          offset: true,
          grid: { drawOnChartArea: false },
          ticks: { display: false },
          title: { display: false },
          min: 0,
          max: Math.max(1, burnStateDatasets.length + 0.5),
        },
      },
    },
  });

  try {
    chart.update('none');
    chart.stop();

    await new Promise((resolve) => {
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => resolve());
        return;
      }
      setTimeout(resolve, 0);
    });

    return canvasToBlob(canvas, 'image/png');
  } finally {
    chart.destroy();
  }
}

async function buildBranchPngBlob(branch, options = {}) {
  assertValidBranchBlueprint(branch);
  const blueprint = branch.blueprint;
  const rows = getBlueprintHeight(blueprint);
  const cols = getBlueprintWidth(blueprint);

  const cellSize =
    Number.isFinite(options.cellSize) && options.cellSize >= 24 && options.cellSize <= 96
      ? Math.round(options.cellSize)
      : BRANCH_PNG_STYLE.cellSize;

  const {
    outerPadding,
    headerHeight,
    headerGap,
    gridPadding,
  } = BRANCH_PNG_STYLE;
  const fontFamily = getCanvasFontFamily(options);
  await ensureCanvasFontReady(fontFamily);

  const gridWidth = cols * cellSize;
  const gridHeight = rows * cellSize;
  const frameX = outerPadding;
  const frameY = outerPadding + headerHeight + headerGap;
  const frameWidth = gridWidth + gridPadding * 2;
  const frameHeight = gridHeight + gridPadding * 2;
  const canvasWidth = frameX * 2 + frameWidth;
  const canvasHeight = outerPadding + headerHeight + headerGap + frameHeight + outerPadding;

  const pixelRatio = Math.max(
    1,
    Number.isFinite(options.pixelRatio)
      ? options.pixelRatio
      : typeof window !== 'undefined'
        ? window.devicePixelRatio || 1
        : 1,
  );

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(canvasWidth * pixelRatio));
  canvas.height = Math.max(1, Math.round(canvasHeight * pixelRatio));

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  context.scale(pixelRatio, pixelRatio);
  context.imageSmoothingEnabled = true;
  context.fillStyle = '#0d1218';
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  const branchLabel =
    typeof options.branchLabel === 'string' && options.branchLabel.trim()
      ? `${options.branchLabel.trim()} `
      : '';
  const headerText = `${branchLabel}1/${getBranchDenominatorToken(branch)} | ${getBranchPowerToken(branch)}`;
  context.fillStyle = '#f2d378';
  context.font = `700 13px ${fontFamily}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(headerText, canvasWidth / 2, outerPadding + headerHeight / 2);

  context.fillStyle = 'rgba(20, 26, 34, 0.95)';
  context.fillRect(frameX, frameY, frameWidth, frameHeight);
  context.strokeStyle = 'rgba(141, 149, 162, 0.8)';
  context.lineWidth = 1;
  context.strokeRect(frameX + 0.5, frameY + 0.5, frameWidth - 1, frameHeight - 1);

  const images = await preloadBlueprintImages(blueprint);
  const cellOriginX = frameX + gridPadding;
  const cellOriginY = frameY + gridPadding;

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    const row = blueprint[rowIndex];
    for (let colIndex = 0; colIndex < cols; colIndex += 1) {
      const part = row[colIndex];
      const x = cellOriginX + colIndex * cellSize;
      const y = cellOriginY + rowIndex * cellSize;
      const colors = getCellColors(part);

      context.fillStyle = colors.background;
      context.fillRect(x, y, cellSize, cellSize);
      context.strokeStyle = colors.border;
      context.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);

      const image = images.get(part?.partId);
      if (image) {
        const rotation = (getBlueprintImageRotation(part) * Math.PI) / 180;
        const mirror = getBlueprintImageMirror(part);
        const size = cellSize * 0.9;
        context.save();
        context.translate(x + cellSize / 2, y + cellSize / 2);
        context.rotate(rotation);
        context.scale(mirror ? -1 : 1, 1);
        context.drawImage(image, -size / 2, -size / 2, size, size);
        context.restore();
        continue;
      }

      const token = getCellFallbackToken(part);
      if (!token) continue;
      context.fillStyle = colors.text;
      context.font = `700 ${Math.max(11, Math.round(cellSize * 0.35))}px ${fontFamily}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(token, x + cellSize / 2, y + cellSize / 2);
    }
  }

  return canvasToBlob(canvas, 'image/png');
}

async function blobToImage(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise((resolve, reject) => {
      const node = new Image();
      node.onload = () => resolve(node);
      node.onerror = () => reject(new Error('Failed to decode image blob.'));
      node.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawPanel(context, x, y, width, height) {
  context.fillStyle = COMPLETE_EXPORT_IMAGE_STYLE.panelBackground;
  context.fillRect(x, y, width, height);
  context.strokeStyle = COMPLETE_EXPORT_IMAGE_STYLE.panelBorder;
  context.lineWidth = 1;
  context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
}

async function buildShareQrCodeImage(shareUrl, options = {}) {
  const value = typeof shareUrl === 'string' ? shareUrl.trim() : '';
  if (!value) return null;
  if (typeof document === 'undefined') return null;

  const mountNode = document.createElement('div');
  const size = Number.isFinite(options.size) ? Math.max(96, Math.round(options.size)) : 240;
  mountNode.style.position = 'fixed';
  mountNode.style.left = '-10000px';
  mountNode.style.top = '-10000px';
  mountNode.style.width = `${size}px`;
  mountNode.style.height = `${size}px`;
  mountNode.style.opacity = '0';
  mountNode.style.pointerEvents = 'none';

  const host = document.body || document.documentElement;
  if (!host) return null;
  host.appendChild(mountNode);

  const root = createRoot(mountNode);
  const waitForPaint = () =>
    new Promise((resolve) => {
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => resolve());
        return;
      }
      setTimeout(resolve, 0);
    });

  try {
    root.render(
      createElement(QRCodeCanvas, {
        value,
        size,
        level: 'L',
        bgColor: '#f2d378',
        fgColor: '#0d1218',
        marginSize: 1,
      }),
    );
    await waitForPaint();
    await waitForPaint();

    const qrCanvas = mountNode.querySelector('canvas');
    if (!qrCanvas || qrCanvas.tagName !== 'CANVAS') {
      return null;
    }

    const blob = await canvasToBlob(qrCanvas, 'image/png');
    return blobToImage(blob);
  } catch (error) {
    console.warn('Share QR render failed:', error);
    return null;
  } finally {
    root.unmount();
    mountNode.remove();
  }
}

async function buildCompleteExportImageBlob(branches, options = {}) {
  const items = Array.isArray(branches) ? branches.filter(Boolean) : [];
  if (items.length === 0) {
    throw new Error('No branch blueprint data provided.');
  }

  const labels = getCompleteExportLabels(options.completeLabels);
  const targetPower = getExportTargetPower(options.solution, options);
  const includePreciseChart = Boolean(options.solution);
  const payload = buildExportParamsPayload({
    params: options.params,
    solution: options.solution,
    branches: items,
    includePng: true,
    includePreciseChart,
    targetPower,
  });
  const infoSections = buildCompleteInfoSections(payload, labels);

  const fontFamily = getCanvasFontFamily(options);
  await ensureCanvasFontReady(fontFamily);

  const canvasWidth = Number.isFinite(options.canvasWidth)
    ? Math.max(1200, Math.round(options.canvasWidth))
    : COMPLETE_EXPORT_IMAGE_STYLE.width;
  const {
    padding,
    sectionGap,
    cardPadding,
    branchGap,
  } = COMPLETE_EXPORT_IMAGE_STYLE;
  const contentWidth = canvasWidth - padding * 2;
  const panelTitleHeight = 30;
  const chartTargetWidth = Number.isFinite(options.chartWidth)
    ? Math.max(800, Math.round(options.chartWidth))
    : Math.max(800, Math.round(contentWidth - cardPadding * 2));
  const chartTargetHeight = Number.isFinite(options.chartHeight)
    ? Math.max(450, Math.round(options.chartHeight))
    : Math.max(450, Math.round(chartTargetWidth * 0.38));

  const chartBlob = includePreciseChart
    ? await buildPreciseChartPngBlob(options.solution, {
      targetPower,
      batteryCapacity: options.batteryCapacity,
      minBatteryThreshold: options?.params?.minBatteryPercent,
      chartLabels: options.chartLabels,
      fontFamily,
      chartWidth: chartTargetWidth,
      chartHeight: chartTargetHeight,
    })
    : null;
  const chartImage = chartBlob ? await blobToImage(chartBlob) : null;
  const shareQrImage = await buildShareQrCodeImage(options.shareUrl);
  const titleBlockHeight = shareQrImage ? 132 : 98;

  const branchImages = [];
  for (let index = 0; index < items.length; index += 1) {
    const branch = items[index];
    const branchBlob = await buildBranchPngBlob(branch, {
      ...options,
      fontFamily,
      branchLabel: `${labels.branch} ${index + 1}`,
    });
    const branchImage = await blobToImage(branchBlob);
    branchImages.push({ image: branchImage, branch, index });
  }

  const measureCanvas = document.createElement('canvas');
  const measureContext = measureCanvas.getContext('2d');
  if (!measureContext) {
    throw new Error('Canvas 2D context is unavailable.');
  }
  measureContext.font = `500 18px ${fontFamily}`;
  const infoColumns = 2;
  const infoColumnGap = 16;
  const infoTextMaxWidth = (contentWidth - cardPadding * 2 - infoColumnGap) / infoColumns;
  const infoLineHeight = 24;
  const parameterLines = infoSections.parameters.flatMap((entry) =>
    wrapTextLines(measureContext, `${entry.label}: ${entry.value}`, infoTextMaxWidth - 8),
  );
  const summaryLines = infoSections.summary.flatMap((entry) =>
    wrapTextLines(measureContext, `${entry.label}: ${entry.value}`, infoTextMaxWidth - 8),
  );
  const infoBodyLines = Math.max(parameterLines.length, summaryLines.length);
  const infoPanelHeight =
    cardPadding * 2 + panelTitleHeight + infoBodyLines * infoLineHeight + 10;

  let chartDrawWidth = 0;
  let chartDrawHeight = 0;
  let chartPanelHeight = 0;
  if (chartImage) {
    const chartScale = Math.min(1, (contentWidth - cardPadding * 2) / chartImage.width);
    chartDrawWidth = chartImage.width * chartScale;
    chartDrawHeight = chartImage.height * chartScale;
    chartPanelHeight = cardPadding * 2 + panelTitleHeight + chartDrawHeight;
  }

  const branchColumns = Math.max(1, Math.min(3, branchImages.length));
  const innerWidth = contentWidth - cardPadding * 2;
  const totalBranchGap = Math.max(0, branchColumns - 1) * branchGap;
  const branchCellWidth = (innerWidth - totalBranchGap) / branchColumns;
  const branchCardGapY = 16;
  const branchRows = [];
  let row = [];
  for (const branchItem of branchImages) {
    row.push(branchItem);
    if (row.length === branchColumns) {
      branchRows.push(row);
      row = [];
    }
  }
  if (row.length > 0) {
    branchRows.push(row);
  }

  const branchRowHeights = branchRows.map((currentRow) => {
    let maxHeight = 0;
    currentRow.forEach(({ image }) => {
      const scale = Math.min(1, branchCellWidth / image.width);
      const drawHeight = image.height * scale;
      const cardHeight = 30 + 12 + drawHeight + 12;
      maxHeight = Math.max(maxHeight, cardHeight);
    });
    return maxHeight;
  });

  const branchesPanelHeight =
    cardPadding * 2 +
    panelTitleHeight +
    branchRowHeights.reduce((sum, h) => sum + h, 0) +
    Math.max(0, branchRowHeights.length - 1) * branchCardGapY;

  let canvasHeight = padding + titleBlockHeight + sectionGap + infoPanelHeight;
  if (chartPanelHeight > 0) {
    canvasHeight += sectionGap + chartPanelHeight;
  }
  canvasHeight += sectionGap + branchesPanelHeight + padding;
  canvasHeight = Math.ceil(canvasHeight);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  context.fillStyle = COMPLETE_EXPORT_IMAGE_STYLE.background;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  let cursorY = padding;
  const qrSize = shareQrImage ? Math.min(148, Math.max(120, titleBlockHeight - 8)) : 0;
  const titleTextMaxWidth = shareQrImage
    ? Math.max(280, contentWidth - qrSize - 16)
    : contentWidth;
  const titleY = shareQrImage ? cursorY + 8 : cursorY;
  const summaryY = shareQrImage ? cursorY + 62 : cursorY + 46;
  const exportTimeY = shareQrImage ? cursorY + 90 : cursorY + 70;

  context.fillStyle = COMPLETE_EXPORT_IMAGE_STYLE.titleColor;
  context.font = `700 36px ${fontFamily}`;
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillText(labels.title, padding, titleY, titleTextMaxWidth);

  context.fillStyle = COMPLETE_EXPORT_IMAGE_STYLE.subtitleColor;
  context.font = `500 18px ${fontFamily}`;
  const exportTime = `${labels.exportTime}: ${payload.exportedAt}`;
  const summaryText = `${labels.branchCount}: ${formatExportValue(payload?.solutionSummary?.branchCount, String(items.length))} | ${labels.actualPower}: ${formatExportValue(payload?.solutionSummary?.avgPower)}w`;
  const summaryLine = wrapTextLines(context, summaryText, titleTextMaxWidth)[0] || summaryText;
  const exportTimeLine = wrapTextLines(context, exportTime, titleTextMaxWidth)[0] || exportTime;
  context.fillText(summaryLine, padding, summaryY, titleTextMaxWidth);
  context.fillText(exportTimeLine, padding, exportTimeY, titleTextMaxWidth);

  if (shareQrImage && qrSize > 0) {
    const qrX = padding + contentWidth - qrSize;
    const qrY = cursorY + (titleBlockHeight - qrSize) / 2;
    context.drawImage(shareQrImage, qrX, qrY, qrSize, qrSize);
  }
  cursorY += titleBlockHeight + sectionGap;

  drawPanel(context, padding, cursorY, contentWidth, infoPanelHeight);
  context.fillStyle = COMPLETE_EXPORT_IMAGE_STYLE.titleColor;
  context.font = `700 22px ${fontFamily}`;
  const leftX = padding + cardPadding;
  const rightX = leftX + infoTextMaxWidth + infoColumnGap;
  context.fillText(labels.parameters, leftX, cursorY + cardPadding);
  context.fillText(labels.summary, rightX, cursorY + cardPadding);

  context.fillStyle = COMPLETE_EXPORT_IMAGE_STYLE.textColor;
  context.font = `500 18px ${fontFamily}`;
  let leftY = cursorY + cardPadding + panelTitleHeight;
  parameterLines.forEach((line) => {
    context.fillText(line, leftX, leftY);
    leftY += infoLineHeight;
  });
  let rightY = cursorY + cardPadding + panelTitleHeight;
  summaryLines.forEach((line) => {
    context.fillText(line, rightX, rightY);
    rightY += infoLineHeight;
  });
  cursorY += infoPanelHeight;

  if (chartImage && chartPanelHeight > 0) {
    cursorY += sectionGap;
    drawPanel(context, padding, cursorY, contentWidth, chartPanelHeight);
    context.fillStyle = COMPLETE_EXPORT_IMAGE_STYLE.titleColor;
    context.font = `700 22px ${fontFamily}`;
    context.fillText(labels.chart, padding + cardPadding, cursorY + cardPadding);
    const imageX = padding + (contentWidth - chartDrawWidth) / 2;
    const imageY = cursorY + cardPadding + panelTitleHeight;
    context.drawImage(chartImage, imageX, imageY, chartDrawWidth, chartDrawHeight);
    cursorY += chartPanelHeight;
  }

  cursorY += sectionGap;
  drawPanel(context, padding, cursorY, contentWidth, branchesPanelHeight);
  context.fillStyle = COMPLETE_EXPORT_IMAGE_STYLE.titleColor;
  context.font = `700 22px ${fontFamily}`;
  context.fillText(labels.branches, padding + cardPadding, cursorY + cardPadding);

  let rowY = cursorY + cardPadding + panelTitleHeight;
  branchRows.forEach((currentRow, rowIndex) => {
    const rowHeight = branchRowHeights[rowIndex];
    currentRow.forEach((item, colIndex) => {
      const cardX = padding + cardPadding + colIndex * (branchCellWidth + branchGap);
      const cardY = rowY;
      const { image, branch, index } = item;
      const scale = Math.min(1, branchCellWidth / image.width);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;

      context.fillStyle = 'rgba(12, 18, 26, 0.95)';
      context.fillRect(cardX, cardY, branchCellWidth, rowHeight);
      context.strokeStyle = 'rgba(141, 149, 162, 0.55)';
      context.lineWidth = 1;
      context.strokeRect(cardX + 0.5, cardY + 0.5, branchCellWidth - 1, rowHeight - 1);

      context.fillStyle = COMPLETE_EXPORT_IMAGE_STYLE.dimTextColor;
      context.font = `600 15px ${fontFamily}`;
      const labelText = `${labels.branch} ${index + 1} | 1/${getBranchDenominatorToken(branch)} | ${getBranchPowerToken(branch)}`;
      const labelLines = wrapTextLines(context, labelText, branchCellWidth - 16);
      const firstLine = labelLines[0] || labelText;
      context.fillText(firstLine, cardX + 8, cardY + 6);

      context.drawImage(
        image,
        cardX + (branchCellWidth - drawWidth) / 2,
        cardY + 34,
        drawWidth,
        drawHeight,
      );
    });
    rowY += rowHeight + branchCardGapY;
  });

  return canvasToBlob(canvas, 'image/png');
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function blobToU8(blob) {
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export function buildEndfieldBlueprint(branch, options = {}) {
  const { nodes, width, height } = buildNodesFromBranch(branch);
  const name = typeof options.name === 'string' && options.name.trim()
    ? options.name.trim()
    : defaultBlueprintName(branch);
  const desc = typeof options.desc === 'string' ? options.desc : '';

  const bpIcon = {
    ...DEFAULT_BLUEPRINT_ICON,
    ...(options.bpIcon || {}),
  };

  const meta = {
    ...DEFAULT_META,
    ...(options.meta || {}),
  };

  const bpParam = cloneBpParam(options.bpParam || DEFAULT_BLUEPRINT_PARAM);

  return {
    index: '',
    bluePrintData: {
      name,
      desc,
      bpSize: {
        xLen: width + 1,
        zLen: height,
      },
      bpIcon,
      bpTags: Array.isArray(options.bpTags) ? options.bpTags : [],
      reviewStatus: meta.reviewStatus,
      bpParam,
      useCount: meta.useCount,
      creatorRoleId: meta.creatorRoleId,
      creatorUserId: meta.creatorUserId,
      nodes,
      isNew: meta.isNew,
      fetchTime: meta.fetchTime,
    },
  };
}

export function downloadEndfieldBlueprint(branch, options = {}) {
  const output = buildEndfieldBlueprint(branch, options);
  const fileName =
    typeof options.filename === 'string' && options.filename.trim()
      ? options.filename.trim()
      : getDefaultFileName(branch);

  const json = JSON.stringify(output, null, 4);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, fileName);
  return output;
}

export async function downloadEndfieldBlueprintZip(branches, options = {}) {
  const items = Array.isArray(branches) ? branches.filter(Boolean) : [];
  if (items.length === 0) {
    throw new Error('No branch blueprint data provided.');
  }

  const includePng = options.includePng !== false;
  const includeParams = options.includeParams !== false;
  const includePreciseChart = options.includePreciseChart !== false && Boolean(options.solution);
  const targetPower = getExportTargetPower(options.solution, options);
  const files = {};
  const outputs = [];

  for (let index = 0; index < items.length; index += 1) {
    const branch = items[index];
    const output = buildEndfieldBlueprint(branch, options);
    outputs.push(output);
    const stem = getIndexedBranchStem(branch, index);
    files[`${stem}_blueprint.json`] = strToU8(JSON.stringify(output, null, 4));

    if (includePng) {
      const pngBlob = await buildBranchPngBlob(branch, {
        ...options,
        branchLabel: `Branch ${index + 1}`,
      });
      files[`${stem}.png`] = await blobToU8(pngBlob);
    }
  }

  if (includeParams) {
    const paramsPayload = buildExportParamsPayload({
      params: options.params,
      solution: options.solution,
      branches: items,
      includePng,
      includePreciseChart,
      targetPower,
    });
    files['export_params.json'] = strToU8(JSON.stringify(paramsPayload, null, 2));
  }

  if (includePreciseChart) {
    const preciseChartBlob = await buildPreciseChartPngBlob(options.solution, {
      targetPower,
      batteryCapacity: options.batteryCapacity,
      minBatteryThreshold: options?.params?.minBatteryPercent,
      chartLabels: options.chartLabels,
      fontFamily: options.fontFamily,
      chartWidth: options.chartWidth,
      chartHeight: options.chartHeight,
    });
    files['chart_precise.png'] = await blobToU8(preciseChartBlob);
  }

  const zipBytes = zipSync(files, { level: 6 });
  const fileName =
    typeof options.filename === 'string' && options.filename.trim()
      ? options.filename.trim()
      : getDefaultZipFileName(items);

  const blob = new Blob([zipBytes], { type: 'application/zip' });
  downloadBlob(blob, fileName);
  return outputs;
}

export async function buildEndfieldBlueprintPng(branch, options = {}) {
  const fileName =
    typeof options.filename === 'string' && options.filename.trim()
      ? options.filename.trim()
      : getDefaultPngFileName(branch);
  const blob = await buildBranchPngBlob(branch, options);
  return { fileName, blob };
}

export async function downloadEndfieldBlueprintPng(branch, options = {}) {
  const { fileName, blob } = await buildEndfieldBlueprintPng(branch, options);
  downloadBlob(blob, fileName);
  return blob;
}

export async function buildEndfieldCompleteImage(branches, options = {}) {
  const items = Array.isArray(branches) ? branches.filter(Boolean) : [];
  if (items.length === 0) {
    throw new Error('No branch blueprint data provided.');
  }

  const fileName =
    typeof options.filename === 'string' && options.filename.trim()
      ? options.filename.trim()
      : getDefaultCompleteImageFileName(items);
  const blob = await buildCompleteExportImageBlob(items, options);
  return { fileName, blob };
}
