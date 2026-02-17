const FACE_ARROW = {
  UP: '^',
  DOWN: 'v',
  LEFT: '<',
  RIGHT: '>',
};

const BLUEPRINT_IMG = {
  belt: '/svg/icon_belt_grid.png',
  left_turn_belt: '/svg/icon_belt_corner_1.png',
  right_turn_belt: '/svg/icon_belt_corner_1.png',
  conveyor_bridge: '/svg/bg_logistic_log_connector.png',
  splitter: '/svg/bg_logistic_log_splitter.png',
  converger: '/svg/bg_logistic_log_converger.png',
};

function getImgRotation(part) {
  if (!part?.partId) return 0;
  const face = part.face || 'RIGHT';

  switch (part.partId) {
    case 'belt':
      switch (face) {
        case 'LEFT': return 0;
        case 'RIGHT': return 180;
        case 'UP': return -90;
        case 'DOWN': return 90;
        default: return 0;
      }
    case 'left_turn_belt':
      return 180;
    case 'right_turn_belt':
      return 0;
    case 'conveyor_bridge':
      switch (face) {
        case 'DOWN': return 0;
        case 'UP': return 180;
        case 'LEFT': return 90;
        case 'RIGHT': return -90;
        default: return 0;
      }
    case 'splitter':
      switch (face) {
        case 'RIGHT': return -90;
        case 'LEFT': return 90;
        case 'UP': return 180;
        case 'DOWN': return 0;
        default: return -90;
      }
    case 'converger':
      switch (face) {
        case 'DOWN': return 0;
        case 'UP': return 180;
        case 'LEFT': return 90;
        case 'RIGHT': return -90;
        default: return 0;
      }
    default:
      return 0;
  }
}

function getImgMirror(part) {
  return part?.partId === 'right_turn_belt';
}

function getPartClasses(p) {
  if (!p || !p.partId) return 'border-endfield-gray-light/20 text-transparent bg-endfield-black/10';
  switch (p.partId) {
    case 'input_source':
      return 'border-endfield-text-light/70 text-endfield-text-light bg-endfield-gray/80';
    case 'thermal_bank':
      return 'border-endfield-yellow/60 text-endfield-yellow bg-endfield-yellow/10';
    case 'recycle_source':
      return 'border-endfield-text/60 text-endfield-text bg-endfield-gray/80';
    default:
      return 'border-endfield-gray-light text-endfield-text bg-endfield-black/70';
  }
}

export default function BlueprintCell({ part, rowIndex, colIndex }) {
  const imgSrc = part?.partId ? BLUEPRINT_IMG[part.partId] : null;
  const rotation = getImgRotation(part);
  const mirror = getImgMirror(part);

  if (imgSrc) {
    return (
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 border border-endfield-gray-light flex items-center justify-center overflow-hidden bg-endfield-black/30"
      >
        <img
          src={imgSrc}
          alt=""
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="w-full h-full object-contain pointer-events-none"
          style={{ transform: `rotate(${rotation}deg)${mirror ? ' scaleX(-1)' : ''}` }}
        />
      </div>
    );
  }

  const arrow = FACE_ARROW[part?.face] || '>';
  let token = '?';
  if (part?.partId) {
    switch (part.partId) {
      case 'input_source':
        token = 'I';
        break;
      case 'thermal_bank':
        token = 'T';
        break;
      case 'recycle_source':
        token = 'R';
        break;
      default:
        token = arrow;
    }
  }

  return (
    <div
      className={`w-9 h-9 sm:w-10 sm:h-10 border flex items-center justify-center text-[10px] sm:text-xs font-semibold ${getPartClasses(part)}`}
    >
      {token}
    </div>
  );
}
