import { useState, useEffect } from 'react';
import { useI18n } from '../i18n';

// 公告配置 - 修改这里来更新公告
const ANNOUNCEMENT_ID = '2026-02-09-v1.6.0'; // 更新公告时修改此 ID

const GITHUB_URL = 'https://github.com/djkcyl/D.I.G.E.';
const ISSUES_URL = 'https://github.com/djkcyl/D.I.G.E./issues';
const VIDEO_TUTORIAL_URL = 'https://www.bilibili.com/video/BV1VrfSByEBo';

const LinkStyle = 'text-endfield-yellow hover:text-endfield-yellow-glow underline underline-offset-2 transition-colors';
const HeadingStyle = 'text-endfield-yellow font-bold mt-4 mb-2';
const ListStyle = 'list-disc list-inside space-y-1 text-endfield-text';

function ChangelogSection({ version, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const { t } = useI18n();
  return (
    <div
      className={`border transition-colors ${
        open
          ? 'border-endfield-yellow/40 bg-endfield-gray/60'
          : 'border-endfield-gray-light/60 bg-endfield-dark/30 hover:border-endfield-text/60'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 flex items-center gap-2 text-left"
        aria-expanded={open}
        aria-label={`${open ? t('collapseSection') : t('expandSection')}: ${title || version}`}
      >
        <span
          className={`material-symbols-outlined text-sm leading-none transition-transform ${
            open ? 'rotate-90 text-endfield-yellow' : 'text-endfield-text/50'
          }`}
        >
          chevron_right
        </span>
        <span className={`text-sm font-semibold leading-none py-0 ${open ? 'text-endfield-text-light' : 'text-endfield-text/80'}`}>
          {title || version}
        </span>
      </button>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-250 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div
          className={`min-h-0 px-3 transition-opacity duration-150 ease-out ${
            open ? 'pt-1 pb-3 opacity-100' : 'pt-0 pb-0 opacity-0'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const ChangelogContent = {
  zh: () => (
    <>
      <div className="space-y-2">
        <ChangelogSection version="v1.6.0" title="v1.6.0 更新内容" defaultOpen>
          <ul className={ListStyle}>
            <li>新增俄语、法语和德语支持</li>
            <li>语言选择器显示本地语言名称和当前语言翻译</li>
            <li>修正燃料/电池/设施名称为游戏内官方术语</li>
            <li>新增 i18n 翻译管理命令行工具</li>
            <li>修复切换方案时的 DOM 渲染异常</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.5.0" title="v1.5.0 更新内容">
          <ul className={ListStyle}>
            <li>新增“输入来源”选项：仓库 / 封装机（10秒/个）</li>
            <li>封装机模式新增输入告警提示</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.4.0" title="v1.4.0 更新内容">
          <ul className={ListStyle}>
            <li>周期图表按 4 秒粒度采样，对齐 8 秒/40 秒燃烧周期</li>
            <li>超过 1000 点自动压缩，并提供“精确数值”查看完整点位</li>
            <li>悬浮信息改为显示时间</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.3.0" title="v1.3.0 更新内容">
          <ul className={ListStyle}>
            <li>图表新增时间轴</li>
            <li>图表支持滚轮缩放、拖拽、移动端双指缩放与单指平移</li>
            <li>新增各震荡分支的燃烧状态曲线</li>
            <li>周期图表、燃料消耗、流程图支持折叠/展开</li>
          </ul>
        </ChangelogSection>
      </div>
    </>
  ),
  en: () => (
    <>
      <div className="space-y-2">
        <ChangelogSection version="v1.6.0" title="v1.6.0 Updates" defaultOpen>
          <ul className={ListStyle}>
            <li>Added Russian, French and German language support</li>
            <li>Language selector now shows native name with translated name</li>
            <li>Fixed fuel/battery/facility names to match official in-game terminology</li>
            <li>Added i18n translation management CLI tool</li>
            <li>Fixed DOM rendering error when switching solutions</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.5.0" title="v1.5.0 Updates">
          <ul className={ListStyle}>
            <li>Added input source selection: Warehouse / Packaging Machine (10s/item)</li>
            <li>Packer mode now shows an input warning</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.4.0" title="v1.4.0 Updates">
          <ul className={ListStyle}>
            <li>Cycle chart samples at 4-second intervals to align with 8s/40s burn durations</li>
            <li>Auto-compresses above 1000 points and adds a "Precise Values" toggle for full points</li>
            <li>Hover panel now shows time instead of point index</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.3.0" title="v1.3.0 Updates">
          <ul className={ListStyle}>
            <li>Added a time axis to the chart</li>
            <li>Chart supports wheel zoom, drag, pinch zoom, and mobile pan</li>
            <li>Added per-branch battery burn-state lines</li>
            <li>Cycle chart, fuel consumption, and diagram sections are collapsible</li>
          </ul>
        </ChangelogSection>
      </div>
    </>
  ),
  ja: () => (
    <>
      <div className="space-y-2">
        <ChangelogSection version="v1.6.0" title="v1.6.0 更新内容" defaultOpen>
          <ul className={ListStyle}>
            <li>ロシア語・フランス語・ドイツ語のサポートを追加</li>
            <li>言語セレクターにネイティブ名と翻訳名を表示</li>
            <li>燃料・バッテリー・施設名をゲーム内公式名称に修正</li>
            <li>i18n 翻訳管理 CLI ツールを追加</li>
            <li>ソリューション切替時の DOM レンダリングエラーを修正</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.5.0" title="v1.5.0 更新">
          <ul className={ListStyle}>
            <li>入力元の選択を追加：倉庫 / 包装機（10秒/個）</li>
            <li>包装機モードの入力警告を追加</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.4.0" title="v1.4.0 更新内容">
          <ul className={ListStyle}>
            <li>周期チャートを 4 秒刻みに統一し、8 秒/40 秒燃焼周期に整合</li>
            <li>1000 点超過時は自動圧縮し、「精密値」トグルで全点表示</li>
            <li>ホバー情報を時間表示に変更</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.3.0" title="v1.3.0 更新内容">
          <ul className={ListStyle}>
            <li>チャートに時間軸を追加</li>
            <li>ホイール拡大縮小・ドラッグ移動・ピンチ/パンに対応</li>
            <li>各分岐バッテリーの燃焼状態ラインを追加</li>
            <li>周期チャート・燃料消費・構成図を折りたたみ可能</li>
          </ul>
        </ChangelogSection>
      </div>
    </>
  ),
  ko: () => (
    <>
      <div className="space-y-2">
        <ChangelogSection version="v1.6.0" title="v1.6.0 업데이트" defaultOpen>
          <ul className={ListStyle}>
            <li>러시아어, 프랑스어 및 독일어 지원 추가</li>
            <li>언어 선택기에 원어 이름과 번역된 이름 표시</li>
            <li>연료/배터리/시설 명칭을 게임 내 공식 용어로 수정</li>
            <li>i18n 번역 관리 CLI 도구 추가</li>
            <li>솔루션 전환 시 DOM 렌더링 오류 수정</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.5.0" title="v1.5.0 업데이트">
          <ul className={ListStyle}>
            <li>입력 소스 선택 추가: 창고 / 포장기(10초/개)</li>
            <li>포장기 모드 입력 경고 추가</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.4.0" title="v1.4.0 업데이트">
          <ul className={ListStyle}>
            <li>주기 차트를 4초 간격으로 고정해 8초/40초 연소 주기와 정렬</li>
            <li>1000점 초과 시 자동 압축되고, "정밀 값" 토글로 전체 점 표시</li>
            <li>호버 패널을 시간 표시로 변경</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.3.0" title="v1.3.0 업데이트">
          <ul className={ListStyle}>
            <li>차트에 시간 축 추가</li>
            <li>차트에서 휠 줌, 드래그, 핀치 줌, 모바일 팬 지원</li>
            <li>각 분기 배터리 연소 상태 라인 추가</li>
            <li>주기 차트/연료 소모/다이어그램 섹션 접기/펼치기 지원</li>
          </ul>
        </ChangelogSection>
      </div>
    </>
  ),
  ru: () => (
    <>
      <div className="space-y-2">
        <ChangelogSection version="v1.6.0" title="v1.6.0 Обновления" defaultOpen>
          <ul className={ListStyle}>
            <li>Добавлена поддержка русского, французского и немецкого языков</li>
            <li>Селектор языка отображает название на родном языке и перевод</li>
            <li>Исправлены названия топлива/батарей/объектов на официальные игровые термины</li>
            <li>Добавлен CLI-инструмент управления переводами i18n</li>
            <li>Исправлена ошибка рендеринга DOM при переключении решений</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.5.0" title="v1.5.0 Обновления">
          <ul className={ListStyle}>
            <li>Добавлен выбор источника ввода: Склад / Упаковщик (10с/шт)</li>
            <li>Режим упаковщика теперь показывает предупреждение</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.4.0" title="v1.4.0 Обновления">
          <ul className={ListStyle}>
            <li>График цикла с шагом 4 секунды для согласования с периодами горения 8с/40с</li>
            <li>Автосжатие свыше 1000 точек и переключатель «Точные значения»</li>
            <li>Панель при наведении теперь показывает время</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.3.0" title="v1.3.0 Обновления">
          <ul className={ListStyle}>
            <li>Добавлена ось времени на график</li>
            <li>Поддержка масштабирования колесом, перетаскивания, пинча и панорамирования</li>
            <li>Добавлены линии состояния горения для каждой ветки</li>
            <li>Секции графика, расхода топлива и схемы сворачиваются/разворачиваются</li>
          </ul>
        </ChangelogSection>
      </div>
    </>
  ),
  fr: () => (
    <>
      <div className="space-y-2">
        <ChangelogSection version="v1.6.0" title="v1.6.0 Mises à jour" defaultOpen>
          <ul className={ListStyle}>
            <li>Ajout du support russe, français et allemand</li>
            <li>Le sélecteur de langue affiche le nom natif et la traduction</li>
            <li>Correction des noms de carburants/batteries/installations selon la terminologie officielle</li>
            <li>Ajout d'un outil CLI de gestion des traductions i18n</li>
            <li>Correction de l'erreur de rendu DOM lors du changement de solution</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.5.0" title="v1.5.0 Mises à jour">
          <ul className={ListStyle}>
            <li>Ajout du choix de source d'entrée : Entrepôt / Emballeuse (10s/unité)</li>
            <li>Le mode emballeuse affiche désormais un avertissement</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.4.0" title="v1.4.0 Mises à jour">
          <ul className={ListStyle}>
            <li>Graphique cyclique échantillonné à 4 secondes pour s'aligner sur les périodes de 8s/40s</li>
            <li>Compression automatique au-delà de 1000 points et bascule « Valeurs précises »</li>
            <li>Le panneau au survol affiche maintenant le temps</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.3.0" title="v1.3.0 Mises à jour">
          <ul className={ListStyle}>
            <li>Ajout d'un axe temporel au graphique</li>
            <li>Zoom molette, glisser, pincer et panoramique sur mobile</li>
            <li>Lignes d'état de combustion par branche ajoutées</li>
            <li>Sections graphique, consommation et schéma repliables</li>
          </ul>
        </ChangelogSection>
      </div>
    </>
  ),
  de: () => (
    <>
      <div className="space-y-2">
        <ChangelogSection version="v1.6.0" title="v1.6.0 Updates" defaultOpen>
          <ul className={ListStyle}>
            <li>Russisch, Französisch und Deutsch hinzugefügt</li>
            <li>Sprachauswahl zeigt nativen Namen und Übersetzung</li>
            <li>Brennstoff-/Batterie-/Anlagennamen an offizielle Spielterminologie angepasst</li>
            <li>i18n-Übersetzungsverwaltungs-CLI-Tool hinzugefügt</li>
            <li>DOM-Rendering-Fehler beim Lösungswechsel behoben</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.5.0" title="v1.5.0 Updates">
          <ul className={ListStyle}>
            <li>Eingabequelle hinzugefügt: Lager / Verpackungseinheit (10s/Stück)</li>
            <li>Verpackungsmodus zeigt jetzt eine Eingabewarnung</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.4.0" title="v1.4.0 Updates">
          <ul className={ListStyle}>
            <li>Zyklusdiagramm mit 4-Sekunden-Intervall für 8s/40s Brennzyklen</li>
            <li>Automatische Komprimierung über 1000 Punkte mit „Genaue Werte"-Umschalter</li>
            <li>Hover-Panel zeigt jetzt Zeit an</li>
          </ul>
        </ChangelogSection>
        <ChangelogSection version="v1.3.0" title="v1.3.0 Updates">
          <ul className={ListStyle}>
            <li>Zeitachse zum Diagramm hinzugefügt</li>
            <li>Mausrad-Zoom, Ziehen, Pinch-Zoom und mobiles Schwenken</li>
            <li>Brennzustandslinien pro Zweig hinzugefügt</li>
            <li>Zyklusdiagramm, Brennstoffverbrauch und Diagramm einklappbar</li>
          </ul>
        </ChangelogSection>
      </div>
    </>
  ),
};

// 公告内容组件（支持超链接）
const AnnouncementContent = {
  zh: () => (
    <>
      <p className="mb-3">
        欢迎使用 D.I.G.E.（Dijiang Integrated Generator Efficiency）！这是一个用于计算明日方舟：终末地中热能池最优发电方案的工具。
      </p>
      
      <h3 className={HeadingStyle}>基本功能</h3>
      <ul className={ListStyle}>
        <li>根据目标功率自动计算最优发电配置</li>
        <li>支持主燃料和副燃料组合</li>
        <li>可视化展示功率曲线和电池电量</li>
        <li>显示详细的分流器和储能箱配置</li>
      </ul>
      
      <h3 className={HeadingStyle}>使用方式</h3>
      <ul className={ListStyle}>
        <li>在左侧控制台设置目标发电量</li>
        <li>选择主燃料（必选）和副燃料（可选）</li>
        <li>调整最低电池电量和最大浪费限制</li>
        <li>点击"计算"按钮获取最优方案</li>
        <li>在右侧查看方案详情和配置图</li>
      </ul>
<p className="mt-4">
        视频教程：{' '}
        <a href={VIDEO_TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Bilibili - D.I.G.E. 使用教程</a>
      </p>

      <p className="mt-4">
        如有问题或建议，欢迎在{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>GitHub</a>
        {' '}提交{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Issue</a>。
      </p>
    </>
  ),
  en: () => (
    <>
      <p className="mb-3">
        Welcome to D.I.G.E. (Dijiang Integrated Generator Efficiency)! This is a tool for calculating optimal power generation solutions for the Thermal Pool in Arknights: Endfield.
      </p>
      
      <h3 className={HeadingStyle}>Features</h3>
      <ul className={ListStyle}>
        <li>Automatically calculate optimal generation based on target power</li>
        <li>Support for primary and secondary fuel combinations</li>
        <li>Visualize power curves and battery levels</li>
        <li>Display detailed splitter and storage configurations</li>
      </ul>
      
      <h3 className={HeadingStyle}>How to Use</h3>
      <ul className={ListStyle}>
        <li>Set target power in the left control panel</li>
        <li>Select primary fuel (required) and secondary fuel (optional)</li>
        <li>Adjust minimum battery level and max waste limits</li>
        <li>Click "Calculate" to get optimal solutions</li>
        <li>View solution details and diagrams on the right</li>
      </ul>
<p className="mt-4">
        Video tutorial:{' '}
        <a href={VIDEO_TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Bilibili - D.I.G.E. Tutorial</a>
      </p>

      <p className="mt-4">
        Feel free to submit{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>issues</a>
        {' '}on{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>GitHub</a>
        {' '}if you have any questions or suggestions.
      </p>
    </>
  ),
  ja: () => (
    <>
      <p className="mb-3">
        D.I.G.E.（Dijiang Integrated Generator Efficiency）へようこそ！これはアークナイツ：エンドフィールドの熱エネルギープールの最適発電方案を計算するツールです。
      </p>
      
      <h3 className={HeadingStyle}>基本機能</h3>
      <ul className={ListStyle}>
        <li>目標電力に基づいて最適な発電構成を自動計算</li>
        <li>主燃料と副燃料の組み合わせをサポート</li>
        <li>電力曲線とバッテリー残量を視覚化</li>
        <li>分流器と蓄電箱の詳細構成を表示</li>
      </ul>
      
      <h3 className={HeadingStyle}>使用方法</h3>
      <ul className={ListStyle}>
        <li>左側のコントロールパネルで目標発電量を設定</li>
        <li>主燃料（必須）と副燃料（任意）を選択</li>
        <li>最低バッテリー残量と最大浪費制限を調整</li>
        <li>「計算」ボタンをクリックして最適方案を取得</li>
        <li>右側で方案の詳細と構成図を確認</li>
      </ul>
<p className="mt-4">
        動画チュートリアル：{' '}
        <a href={VIDEO_TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Bilibili - D.I.G.E. 使い方ガイド</a>
      </p>

      <p className="mt-4">
        ご質問やご提案がありましたら、
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>GitHub</a>
        で
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Issue</a>
        を提出してください。
      </p>
    </>
  ),
  ko: () => (
    <>
      <p className="mb-3">
        D.I.G.E.(Dijiang Integrated Generator Efficiency)에 오신 것을 환영합니다! 이것은 명일방주: 종말지의 열에너지 풀 최적 발전 방안을 계산하는 도구입니다.
      </p>
      
      <h3 className={HeadingStyle}>기본 기능</h3>
      <ul className={ListStyle}>
        <li>목표 전력에 따라 최적의 발전 구성을 자동 계산</li>
        <li>주 연료와 부 연료 조합 지원</li>
        <li>전력 곡선과 배터리 잔량 시각화</li>
        <li>분류기 및 저장 상자의 상세 구성 표시</li>
      </ul>
      
      <h3 className={HeadingStyle}>사용 방법</h3>
      <ul className={ListStyle}>
        <li>왼쪽 컨트롤 패널에서 목표 발전량 설정</li>
        <li>주 연료(필수)와 부 연료(선택) 선택</li>
        <li>최소 배터리 잔량과 최대 낭비 제한 조정</li>
        <li>"계산" 버튼을 클릭하여 최적 방안 얻기</li>
        <li>오른쪽에서 방안 세부 정보와 구성도 확인</li>
      </ul>
<p className="mt-4">
        동영상 튜토리얼:{' '}
        <a href={VIDEO_TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Bilibili - D.I.G.E. 사용 가이드</a>
      </p>

      <p className="mt-4">
        질문이나 제안이 있으시면{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>GitHub</a>
        에서{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Issue</a>
        를 제출해 주세요.
      </p>
    </>
  ),
  ru: () => (
    <>
      <p className="mb-3">
        Добро пожаловать в D.I.G.E. (Dijiang Integrated Generator Efficiency)! Это инструмент для расчёта оптимальных решений энергогенерации теплового пула в Arknights: Endfield.
      </p>
      
      <h3 className={HeadingStyle}>Возможности</h3>
      <ul className={ListStyle}>
        <li>Автоматический расчёт оптимальной конфигурации по целевой мощности</li>
        <li>Поддержка комбинаций основного и вторичного топлива</li>
        <li>Визуализация кривых мощности и уровня батареи</li>
        <li>Подробные схемы разделителей и хранилищ</li>
      </ul>
      
      <h3 className={HeadingStyle}>Как использовать</h3>
      <ul className={ListStyle}>
        <li>Задайте целевую мощность в панели слева</li>
        <li>Выберите основное (обязательно) и вторичное (опционально) топливо</li>
        <li>Настройте минимальный заряд батареи и лимит потерь</li>
        <li>Нажмите «Рассчитать» для получения оптимальных решений</li>
        <li>Просматривайте детали и схемы справа</li>
      </ul>
      <p className="mt-4">
        Видеоурок:{' '}
        <a href={VIDEO_TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Bilibili — Руководство D.I.G.E.</a>
      </p>

      <p className="mt-4">
        Если у вас есть вопросы или предложения, создайте{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Issue</a>
        {' '}на{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>GitHub</a>.
      </p>
    </>
  ),
  fr: () => (
    <>
      <p className="mb-3">
        Bienvenue dans D.I.G.E. (Dijiang Integrated Generator Efficiency) ! C'est un outil de calcul des solutions optimales de génération d'énergie pour le pool thermique d'Arknights: Endfield.
      </p>
      
      <h3 className={HeadingStyle}>Fonctionnalités</h3>
      <ul className={ListStyle}>
        <li>Calcul automatique de la configuration optimale selon la puissance cible</li>
        <li>Combinaisons de carburant principal et secondaire</li>
        <li>Visualisation des courbes de puissance et du niveau de batterie</li>
        <li>Schémas détaillés des répartiteurs et stockages</li>
      </ul>
      
      <h3 className={HeadingStyle}>Utilisation</h3>
      <ul className={ListStyle}>
        <li>Définissez la puissance cible dans le panneau de gauche</li>
        <li>Sélectionnez le carburant principal (requis) et secondaire (optionnel)</li>
        <li>Ajustez le niveau minimum de batterie et la limite de gaspillage</li>
        <li>Cliquez sur « Calculer » pour obtenir les solutions optimales</li>
        <li>Consultez les détails et schémas à droite</li>
      </ul>
      <p className="mt-4">
        Tutoriel vidéo :{' '}
        <a href={VIDEO_TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Bilibili — Guide D.I.G.E.</a>
      </p>

      <p className="mt-4">
        N'hésitez pas à soumettre un{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Issue</a>
        {' '}sur{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>GitHub</a>
        {' '}pour toute question ou suggestion.
      </p>
    </>
  ),
  de: () => (
    <>
      <p className="mb-3">
        Willkommen bei D.I.G.E. (Dijiang Integrated Generator Efficiency)! Dies ist ein Werkzeug zur Berechnung optimaler Stromerzeugungslösungen für den Thermischen Pool in Arknights: Endfield.
      </p>
      
      <h3 className={HeadingStyle}>Funktionen</h3>
      <ul className={ListStyle}>
        <li>Automatische Berechnung der optimalen Erzeugung basierend auf der Zielleistung</li>
        <li>Unterstützung für Primär- und Sekundärbrennstoff-Kombinationen</li>
        <li>Visualisierung von Leistungskurven und Batterieständen</li>
        <li>Detaillierte Splitter- und Speicherkonfigurationen</li>
      </ul>
      
      <h3 className={HeadingStyle}>Verwendung</h3>
      <ul className={ListStyle}>
        <li>Zielleistung im linken Bedienfeld einstellen</li>
        <li>Primärbrennstoff (erforderlich) und Sekundärbrennstoff (optional) auswählen</li>
        <li>Mindestbatteriestand und maximale Verschwendung anpassen</li>
        <li>Auf „Berechnen" klicken, um optimale Lösungen zu erhalten</li>
        <li>Lösungsdetails und Diagramme rechts ansehen</li>
      </ul>
      <p className="mt-4">
        Video-Tutorial:{' '}
        <a href={VIDEO_TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Bilibili — D.I.G.E. Anleitung</a>
      </p>

      <p className="mt-4">
        Bei Fragen oder Vorschlägen können Sie gerne ein{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Issue</a>
        {' '}auf{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>GitHub</a>
        {' '}erstellen.
      </p>
    </>
  ),
};

const STORAGE_KEY = 'dige-announcement-dismissed';

// 检查是否需要自动显示公告
export function shouldShowAnnouncement() {
  const dismissedId = localStorage.getItem(STORAGE_KEY);
  return dismissedId !== ANNOUNCEMENT_ID;
}

export default function Announcement({ show, onClose }) {
  const { t, locale } = useI18n();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [activeTab, setActiveTab] = useState('announcement');

  useEffect(() => {
    if (show) {
      setActiveTab('announcement');
    }
  }, [show]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_ID);
    }
    setDontShowAgain(false);
    onClose();
  };

  if (!show) return null;

  const AnnouncementComponent = AnnouncementContent[locale] || AnnouncementContent.en;
  const ChangelogComponent = ChangelogContent[locale] || ChangelogContent.en;
  const isAnnouncement = activeTab === 'announcement';

  return (
    <div className="fixed inset-0 bg-endfield-black/95 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="bg-endfield-gray border border-endfield-yellow/30 p-6 max-w-xl w-full relative h-[90vh] flex flex-col">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-endfield-gray-light">
          <span className="material-symbols-outlined text-endfield-yellow">
            {isAnnouncement ? 'campaign' : 'history'}
          </span>
          <h2 className="text-base font-bold text-endfield-text-light uppercase tracking-wider">
            {isAnnouncement ? t('announcement') : t('changelog')}
          </h2>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('announcement')}
            className={`h-9 border text-sm tracking-wider transition-colors ${
              isAnnouncement
                ? 'text-endfield-yellow border-endfield-yellow bg-endfield-yellow/10'
                : 'text-endfield-text-light border-endfield-gray-light hover:border-endfield-text'
            }`}
          >
            {t('announcement')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('changelog')}
            className={`h-9 border text-sm tracking-wider transition-colors ${
              !isAnnouncement
                ? 'text-endfield-yellow border-endfield-yellow bg-endfield-yellow/10'
                : 'text-endfield-text-light border-endfield-gray-light hover:border-endfield-text'
            }`}
          >
            {t('changelog')}
          </button>
        </div>

        {/* 内容 */}
        <div className="text-sm text-endfield-text-light leading-relaxed mb-6 overflow-y-auto scrollbar-gutter-stable flex-1 pr-2">
          {isAnnouncement ? <AnnouncementComponent /> : <ChangelogComponent />}
        </div>

        {/* 不再显示复选框 */}
        <label className="flex items-center gap-3 mb-4 cursor-pointer select-none group">
          <div className="relative w-4 h-4 border border-endfield-gray-light group-hover:border-endfield-yellow transition-colors flex items-center justify-center">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {dontShowAgain && (
              <span className="material-symbols-outlined text-endfield-yellow text-sm">check</span>
            )}
          </div>
          <span className="text-sm text-endfield-text group-hover:text-endfield-text-light transition-colors">{t('dontShowAgain')}</span>
        </label>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="shrink-0 w-full h-10 min-h-10 bg-endfield-yellow hover:bg-endfield-yellow-glow text-endfield-black font-bold tracking-wider transition-all flex items-center justify-center gap-2 text-sm"
        >
          {t('understood')}
        </button>
      </div>
    </div>
  );
}
