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

function getDefaultFileName(branch) {
  const denominator = Number(branch?.denominator);
  if (Number.isFinite(denominator) && denominator > 0) {
    return `dige_branch_1_${denominator}.json`;
  }
  return 'dige_branch.json';
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
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return output;
}

export function downloadEndfieldBlueprintZip(branches, options = {}) {
  const items = Array.isArray(branches) ? branches.filter(Boolean) : [];
  if (items.length === 0) {
    throw new Error('No branch blueprint data provided.');
  }

  const files = {};
  const outputs = [];

  items.forEach((branch, index) => {
    const output = buildEndfieldBlueprint(branch, options);
    outputs.push(output);
    const denominator = Number(branch?.denominator);
    const fileName = Number.isFinite(denominator) && denominator > 0
      ? `branch_${index + 1}_1_${denominator}.json`
      : `branch_${index + 1}.json`;
    files[fileName] = strToU8(JSON.stringify(output, null, 4));
  });

  const zipBytes = zipSync(files, { level: 6 });
  const fileName =
    typeof options.filename === 'string' && options.filename.trim()
      ? options.filename.trim()
      : getDefaultZipFileName(items);

  const blob = new Blob([zipBytes], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return outputs;
}
