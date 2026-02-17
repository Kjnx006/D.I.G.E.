import { strToU8, zipSync } from 'fflate';

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

const imageCache = new Map();

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

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
        return;
      }
      reject(new Error('Failed to generate PNG data.'));
    }, 'image/png');
  });

  return blob;
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

  const zipBytes = zipSync(files, { level: 6 });
  const fileName =
    typeof options.filename === 'string' && options.filename.trim()
      ? options.filename.trim()
      : getDefaultZipFileName(items);

  const blob = new Blob([zipBytes], { type: 'application/zip' });
  downloadBlob(blob, fileName);
  return outputs;
}

export async function downloadEndfieldBlueprintPng(branch, options = {}) {
  const fileName =
    typeof options.filename === 'string' && options.filename.trim()
      ? options.filename.trim()
      : getDefaultPngFileName(branch);
  const blob = await buildBranchPngBlob(branch, options);
  downloadBlob(blob, fileName);
  return blob;
}
