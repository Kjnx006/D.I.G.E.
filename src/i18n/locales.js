export const locales = {
  en: {
    // SEO
    seoTitle: 'D.I.G.E. - Dijiang Integrated Generator Efficiency',
    seoDescription: 'D.I.G.E. is a thermal pool optimization calculator designed for Arknights: Endfield. Automatically calculate optimal power generation solutions with multiple fuel configurations and oscillating strategies.',
    
    // Header
    appTitle: 'D.I.G.E.',
    appSubtitle: 'Dijiang Integrated Generator Efficiency',
    calculate: 'CALCULATE',
    
    // Sidebar - Target
    targetPower: 'TARGET POWER',
    power: 'Power',
    random: 'Random',
    
    // Sidebar - Constraints
    constraints: 'CONSTRAINTS',
    minBatteryPercent: 'Min Battery (%)',
    maxWaste: 'Max Waste / Redundancy',
    
    // Sidebar - Fuel Config
    fuelConfig: 'FUEL CONFIG',
    primaryFuel: 'Primary Fuel',
    secondaryFuel: 'Secondary Fuel (Oscillating)',
    secondaryFuelHint: 'Optional fuel for oscillating generation',
    
    // Sidebar - System Info
    basePower: 'Base Power',
    beltSpeed: 'Belt Speed',
    itemPerSec: 'items/s',
    batteryCapacity: 'Battery Capacity',
    
    // Solution List
    solution: 'Solution',
    selectSolution: 'Select Solution',
    branches: ' Branches',
    branchesShort: 'Branches',
    primaryOnly: 'Primary only',
    useSecondary: 'Using secondary',
    clickCalculate: 'Click CALCULATE to find optimal solutions',
    adjustParamsHint: 'If no solution is found, try adjusting target power, constraints or fuel options',
    
    // Data Cards (compact)
    actualPower: 'Power',
    overflow: 'Overflow',
    cyclePeriod: 'Period',
    noCycle: 'No cycle',
    minBatteryLevel: 'Min Battery',
    minBatteryShort: 'Min Batt',
    variance: 'Variance',
    lowerIsBetter: 'Lower is better',
    
    // Chart
    cycleChart: 'CYCLE CHART',
    chartDataDesc: 'Data: power / target line / battery',
    hideHoverDetails: 'Hide hover details',
    expandSection: 'Expand',
    collapseSection: 'Collapse',
    noChartData: 'No chart data available',
    currentPower: 'Current Power',
    targetPowerLine: 'Target Power',
    batteryLevel: 'Battery Level',
    powerAxis: 'Power',
    batteryAxis: 'Battery',
    burnStateShort: 'Burn',
    stateOn: 'ON',
    stateOff: 'OFF',
    displayRange: 'Display Range',
    leftAxis: 'Left axis',
    rightAxis: 'Right axis',
    
    // Diagram
    solutionDiagram: 'SOLUTION DIAGRAM',
    noSolutionData: 'No solution data',
    branch: 'Branch',
    basePowerSection: 'Base Power Generation',
    basePowerShort: 'Base',
    oscillatingSection: 'Oscillating Generation',
    oscillatingShort: 'Oscillating',
    generators: 'Generators',
    gen: 'GEN',
    fullBelt: 'Full Belt',
    basePlus: 'base +',
    waySplit: '-way',
    twoWaySplitter: '2-WAY',
    threeWaySplitter: '3-WAY',
    storageBox: 'Storage Box',
    storageShort: 'Storage',
    importantNote: 'Important',
    storageBoxWarning: 'All return lines must connect to Protocol Storage Boxes (Storage Mode) as buffers. Do NOT connect directly to belts to prevent overflow!',
    storageBoxWarningShort: 'Return lines must use Storage Boxes (set to Storage Mode or unpowered) as buffers!',
    baseOnlyHint: 'Base power only, no fuel needed',
    
    // Controls
    fit: 'FIT',
    reset: 'RESET',
    dragToPan: 'Drag to pan · Scroll to zoom',
    dragHint: '← Drag to scroll →',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    
    // Fuel Consumption
    fuelConsumption: 'FUEL CONSUMPTION',
    perMinute: 'Per Minute',
    perHour: 'Per Hour',
    perDay: 'Per Day',
    fuelType: 'Fuel Type',
    fullBelt: 'Full Belt',
    saved: 'Saved',
    savedPerDay: 'Saved/Day',
    
    // Error State
    noSolutionFound: 'NO SOLUTION FOUND',
    errorSuggestion: 'Try increasing the waste limit, lowering the minimum battery level, or switching to a different secondary fuel.',
    dismiss: 'DISMISS',
    
    // Loading
    calculating: 'CALCULATING...',
    
    // Announcement
    announcement: 'ANNOUNCEMENT',
    dontShowAgain: "Don't show this announcement again",
    understood: 'GOT IT',
    
    // Language names
    langEn: 'English',
    langZh: '中文',
    langJa: '日本語',
    langKo: '한국어',
  },
  
  zh: {
    // SEO
    seoTitle: 'D.I.G.E. - 帝江号严选精细化集成工业系统能源生产及存储管理系统设计器',
    seoDescription: 'D.I.G.E. 是一款专为明日方舟：终末地设计的热能池优化计算器。自动计算最优发电方案，支持多种燃料配置、震荡发电策略，帮助您高效管理能源生产与存储。',
    
    // Header
    appTitle: 'D.I.G.E.',
    appSubtitle: '帝江号严选精细化集成工业系统能源生产及存储管理系统设计器',
    calculate: '计算',
    
    // Sidebar - Target
    targetPower: '目标发电量',
    power: '功率',
    random: '随机',
    
    // Sidebar - Constraints
    constraints: '约束条件',
    minBatteryPercent: '最小蓄电量 (%)',
    maxWaste: '功率浪费上限 / 冗余上限',
    
    // Sidebar - Fuel Config
    fuelConfig: '燃料配置',
    primaryFuel: '主燃料',
    secondaryFuel: '震荡发电副燃料',
    secondaryFuelHint: '可选，用于震荡发电的副燃料',
    
    // Sidebar - System Info
    basePower: '基础发电',
    beltSpeed: '传送带速度',
    itemPerSec: '个/秒',
    batteryCapacity: '蓄电池容量',
    
    // Solution List
    solution: '方案',
    selectSolution: '选择方案',
    branches: '路',
    branchesShort: '路',
    primaryOnly: '仅主燃料',
    useSecondary: '使用副燃料',
    clickCalculate: '点击"计算"按钮查找最优方案',
    adjustParamsHint: '如未找到方案，可尝试调整目标发电量、约束条件或燃料选项',
    
    // Data Cards (compact)
    actualPower: '发电量',
    overflow: '溢出',
    cyclePeriod: '周期',
    noCycle: '无周期',
    minBatteryLevel: '最低电量',
    minBatteryShort: '最低电量',
    variance: '方差',
    lowerIsBetter: '越低越稳定',
    
    // Chart
    cycleChart: '周期图表',
    chartDataDesc: '数据：功率 / 目标线 / 电量',
    hideHoverDetails: '关闭悬浮完整数据',
    expandSection: '展开',
    collapseSection: '折叠',
    noChartData: '暂无图表数据',
    currentPower: '当前发电量',
    targetPowerLine: '目标发电量',
    batteryLevel: '蓄电池电量',
    powerAxis: '功率',
    batteryAxis: '电量',
    burnStateShort: '燃烧',
    stateOn: '燃烧中',
    stateOff: '未燃烧',
    displayRange: '显示范围',
    leftAxis: '左轴',
    rightAxis: '右轴',
    
    // Diagram
    solutionDiagram: '方案流程图',
    noSolutionData: '暂无方案数据',
    branch: '分支',
    basePowerSection: '基础发电',
    basePowerShort: '基础',
    oscillatingSection: '震荡发电',
    oscillatingShort: '震荡',
    generators: '发电机',
    gen: '发电',
    fullBelt: '满带',
    basePlus: '基础 +',
    waySplit: '分',
    twoWaySplitter: '二分器',
    threeWaySplitter: '三分器',
    storageBox: '协议存储箱',
    storageShort: '存储箱',
    importantNote: '重要提示',
    storageBoxWarning: '所有分流回收线路必须接入"协议存储箱（存储模式）"作为缓存。切勿直接接入传送带，否则会导致传送带溢出！',
    storageBoxWarningShort: '分流回收必须使用存储箱缓存！存储箱需设为存储模式或不通电。',
    baseOnlyHint: '仅基地发电，无需燃料',
    
    // Controls
    fit: '适应',
    reset: '重置',
    dragToPan: '拖拽平移 · 滚轮缩放',
    dragHint: '← 拖拽滚动 →',
    expandSidebar: '展开侧边栏',
    collapseSidebar: '收起侧边栏',
    
    // Fuel Consumption
    fuelConsumption: '燃料消耗',
    perMinute: '每分钟',
    perHour: '每小时',
    perDay: '每天',
    fuelType: '燃料类型',
    fullBelt: '满带',
    saved: '节省',
    savedPerDay: '每天节省',
    
    // Error State
    noSolutionFound: '未找到解决方案',
    errorSuggestion: '建议提高冗余上限、降低最小蓄电量要求，或尝试更换副燃料。',
    dismiss: '关闭',
    
    // Loading
    calculating: '计算中...',
    
    // Announcement
    announcement: '公告',
    dontShowAgain: '不再显示该公告',
    understood: '知道了',
    
    // Language names
    langEn: 'English',
    langZh: '中文',
    langJa: '日本語',
    langKo: '한국어',
  },
  
  ja: {
    // SEO
    seoTitle: 'D.I.G.E. - 帝江号厳選精密統合工業システムエネルギー生産貯蔵管理システム設計器',
    seoDescription: 'D.I.G.E.はアークナイツ：エンドフィールド向けの熱エネルギープール最適化計算機です。最適な発電方案を自動計算し、複数の燃料設定と振動発電戦略をサポートします。',
    
    // Header
    appTitle: 'D.I.G.E.',
    appSubtitle: '帝江号厳選精密統合工業システムエネルギー生産貯蔵管理システム設計器',
    calculate: '計算',
    
    // Sidebar - Target
    targetPower: '目標発電量',
    power: '電力',
    random: 'ランダム',
    
    // Sidebar - Constraints
    constraints: '制約条件',
    minBatteryPercent: '最小バッテリー (%)',
    maxWaste: '最大ロス / 冗長上限',
    
    // Sidebar - Fuel Config
    fuelConfig: '燃料設定',
    primaryFuel: 'メイン燃料',
    secondaryFuel: '振動発電用サブ燃料',
    secondaryFuelHint: '振動発電用のオプション燃料',
    
    // Sidebar - System Info
    basePower: '基本発電',
    beltSpeed: 'ベルト速度',
    itemPerSec: '個/秒',
    batteryCapacity: 'バッテリー容量',
    
    // Solution List
    solution: 'プラン',
    selectSolution: 'プラン選択',
    branches: '路',
    branchesShort: '路',
    primaryOnly: 'メインのみ',
    useSecondary: 'サブ使用',
    clickCalculate: '「計算」をクリックして最適解を検索',
    adjustParamsHint: '解決策が見つからない場合は、目標発電量、制約条件、燃料オプションを調整してください',
    
    // Data Cards (compact)
    actualPower: '発電量',
    overflow: 'オーバー',
    cyclePeriod: '周期',
    noCycle: 'サイクルなし',
    minBatteryLevel: '最低バッテリー',
    minBatteryShort: '最低',
    variance: '分散',
    lowerIsBetter: '低いほど安定',
    
    // Chart
    cycleChart: 'サイクルチャート',
    chartDataDesc: 'データ: 電力 / 目標線 / バッテリー',
    hideHoverDetails: 'ホバー詳細を隠す',
    expandSection: '展開',
    collapseSection: '折りたたむ',
    noChartData: 'チャートデータがありません',
    currentPower: '現在の発電量',
    targetPowerLine: '目標発電量',
    batteryLevel: 'バッテリーレベル',
    powerAxis: '電力',
    batteryAxis: 'バッテリー',
    burnStateShort: '燃焼',
    stateOn: '燃焼中',
    stateOff: '停止',
    displayRange: '表示範囲',
    leftAxis: '左軸',
    rightAxis: '右軸',
    
    // Diagram
    solutionDiagram: 'ソリューション図',
    noSolutionData: 'ソリューションデータなし',
    branch: 'ブランチ',
    basePowerSection: '基本発電',
    basePowerShort: '基本',
    oscillatingSection: '振動発電',
    oscillatingShort: '振動',
    generators: '発電機',
    gen: '発電',
    fullBelt: 'フルベルト',
    basePlus: '基本 +',
    waySplit: '分岐',
    twoWaySplitter: '2分岐',
    threeWaySplitter: '3分岐',
    storageBox: 'ストレージボックス',
    storageShort: 'ストレージ',
    importantNote: '重要',
    storageBoxWarning: 'すべての回収ラインは「プロトコルストレージボックス（ストレージモード）」をバッファとして接続する必要があります。ベルトに直接接続しないでください！',
    storageBoxWarningShort: '回収ラインはストレージボックス（ストレージモードまたは無電力）を使用！',
    baseOnlyHint: '基地発電のみ、燃料不要',
    
    // Controls
    fit: 'フィット',
    reset: 'リセット',
    dragToPan: 'ドラッグで移動 · スクロールでズーム',
    dragHint: '← ドラッグでスクロール →',
    expandSidebar: 'サイドバーを展開',
    collapseSidebar: 'サイドバーを折りたたむ',
    
    // Fuel Consumption
    fuelConsumption: '燃料消費',
    perMinute: '毎分',
    perHour: '毎時',
    perDay: '毎日',
    fuelType: '燃料タイプ',
    fullBelt: 'フルベルト',
    saved: '節約',
    savedPerDay: '毎日節約',
    
    // Error State
    noSolutionFound: '解決策が見つかりません',
    errorSuggestion: '余剰上限を増やすか、最小バッテリー残量を下げるか、副燃料を変更してみてください。',
    dismiss: '閉じる',
    
    // Loading
    calculating: '計算中...',
    
    // Announcement
    announcement: 'お知らせ',
    dontShowAgain: 'このお知らせを今後表示しない',
    understood: '了解',
    
    // Language names
    langEn: 'English',
    langZh: '中文',
    langJa: '日本語',
    langKo: '한국어',
  },
  
  ko: {
    // SEO
    seoTitle: 'D.I.G.E. - 제강호엄선정밀통합산업시스템에너지생산저장관리시스템설계기',
    seoDescription: 'D.I.G.E.는 명일방주: 엔드필드를 위한 열에너지 풀 최적화 계산기입니다. 다양한 연료 구성과 진동 발전 전략으로 최적의 발전 방안을 자동으로 계산합니다.',
    
    // Header
    appTitle: 'D.I.G.E.',
    appSubtitle: '제강호엄선정밀통합산업시스템에너지생산저장관리시스템설계기',
    calculate: '계산',
    
    // Sidebar - Target
    targetPower: '목표 발전량',
    power: '전력',
    random: '무작위',
    
    // Sidebar - Constraints
    constraints: '제약 조건',
    minBatteryPercent: '최소 배터리 (%)',
    maxWaste: '최대 낭비 / 여유 상한',
    
    // Sidebar - Fuel Config
    fuelConfig: '연료 설정',
    primaryFuel: '주 연료',
    secondaryFuel: '진동 발전 보조 연료',
    secondaryFuelHint: '진동 발전용 선택적 연료',
    
    // Sidebar - System Info
    basePower: '기본 발전',
    beltSpeed: '벨트 속도',
    itemPerSec: '개/초',
    batteryCapacity: '배터리 용량',
    
    // Solution List
    solution: '방안',
    selectSolution: '방안 선택',
    branches: '경로',
    branchesShort: '경로',
    primaryOnly: '주 연료만',
    useSecondary: '보조 사용',
    clickCalculate: '"계산" 버튼을 클릭하여 최적 방안 찾기',
    adjustParamsHint: '방안을 찾을 수 없는 경우 목표 발전량, 제약 조건 또는 연료 옵션을 조정해 보세요',
    
    // Data Cards (compact)
    actualPower: '발전량',
    overflow: '오버플로',
    cyclePeriod: '주기',
    noCycle: '주기 없음',
    minBatteryLevel: '최소 배터리',
    minBatteryShort: '최소',
    variance: '분산',
    lowerIsBetter: '낮을수록 안정적',
    
    // Chart
    cycleChart: '주기 차트',
    chartDataDesc: '데이터: 전력 / 목표선 / 배터리',
    hideHoverDetails: '호버 상세 숨기기',
    expandSection: '펼치기',
    collapseSection: '접기',
    noChartData: '차트 데이터 없음',
    currentPower: '현재 발전량',
    targetPowerLine: '목표 발전량',
    batteryLevel: '배터리 레벨',
    powerAxis: '전력',
    batteryAxis: '배터리',
    burnStateShort: '연소',
    stateOn: '연소 중',
    stateOff: '정지',
    displayRange: '표시 범위',
    leftAxis: '왼쪽 축',
    rightAxis: '오른쪽 축',
    
    // Diagram
    solutionDiagram: '솔루션 다이어그램',
    noSolutionData: '솔루션 데이터 없음',
    branch: '브랜치',
    basePowerSection: '기본 발전',
    basePowerShort: '기본',
    oscillatingSection: '진동 발전',
    oscillatingShort: '진동',
    generators: '발전기',
    gen: '발전',
    fullBelt: '풀 벨트',
    basePlus: '기본 +',
    waySplit: '분기',
    twoWaySplitter: '2분기',
    threeWaySplitter: '3분기',
    storageBox: '저장 박스',
    storageShort: '저장',
    importantNote: '중요',
    storageBoxWarning: '모든 회수 라인은 "프로토콜 저장 박스(저장 모드)"를 버퍼로 연결해야 합니다. 벨트에 직접 연결하지 마세요!',
    storageBoxWarningShort: '회수 라인은 저장 박스(저장 모드 또는 무전원) 사용 필수!',
    baseOnlyHint: '기지 발전만, 연료 불필요',
    
    // Controls
    fit: '맞춤',
    reset: '리셋',
    dragToPan: '드래그로 이동 · 스크롤로 확대',
    dragHint: '← 드래그로 스크롤 →',
    expandSidebar: '사이드바 펼치기',
    collapseSidebar: '사이드바 접기',
    
    // Fuel Consumption
    fuelConsumption: '연료 소비',
    perMinute: '분당',
    perHour: '시간당',
    perDay: '일당',
    fuelType: '연료 유형',
    fullBelt: '풀 벨트',
    saved: '절약',
    savedPerDay: '일당 절약',
    
    // Error State
    noSolutionFound: '해결책을 찾을 수 없습니다',
    errorSuggestion: '잉여 한도를 높이거나, 최소 배터리 잔량을 낮추거나, 보조 연료를 변경해 보세요.',
    dismiss: '닫기',
    
    // Loading
    calculating: '계산 중...',
    
    // Announcement
    announcement: '공지',
    dontShowAgain: '이 공지를 다시 표시하지 않음',
    understood: '확인',
    
    // Language names
    langEn: 'English',
    langZh: '中文',
    langJa: '日本語',
    langKo: '한국어',
  },
};

export const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];
