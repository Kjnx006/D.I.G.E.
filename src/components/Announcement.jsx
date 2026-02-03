import { useState, useEffect } from 'react';
import { useI18n } from '../i18n';

// 公告配置 - 修改这里来更新公告
const ANNOUNCEMENT_ID = '2026-02-03-v2'; // 更新公告时修改此 ID

const GITHUB_URL = 'https://github.com/djkcyl/D.I.G.E.';
const ISSUES_URL = 'https://github.com/djkcyl/D.I.G.E./issues';

const LinkStyle = 'text-endfield-yellow hover:text-endfield-yellow-glow underline underline-offset-2 transition-colors';
const HeadingStyle = 'text-endfield-yellow font-bold mt-4 mb-2';
const ListStyle = 'list-disc list-inside space-y-1 text-endfield-text';

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
        <li>Click "CALCULATE" to get optimal solutions</li>
        <li>View solution details and diagrams on the right</li>
      </ul>
      
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
        질문이나 제안이 있으시면{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>GitHub</a>
        에서{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={LinkStyle}>Issue</a>
        를 제출해 주세요.
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

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_ID);
    }
    setDontShowAgain(false);
    onClose();
  };

  if (!show) return null;

  const ContentComponent = AnnouncementContent[locale] || AnnouncementContent.en;

  return (
    <div className="fixed inset-0 bg-endfield-black/95 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="bg-endfield-gray border border-endfield-yellow/30 p-6 max-w-xl w-full relative max-h-[90vh] flex flex-col">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-endfield-gray-light">
          <span className="material-symbols-outlined text-endfield-yellow">campaign</span>
          <h2 className="text-base font-bold text-endfield-text-light uppercase tracking-wider">
            {t('announcement')}
          </h2>
        </div>

        {/* 内容 */}
        <div className="text-sm text-endfield-text-light leading-relaxed mb-6 overflow-y-auto flex-1 pr-2">
          <ContentComponent />
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
          className="w-full h-10 bg-endfield-yellow hover:bg-endfield-yellow-glow text-endfield-black font-bold tracking-wider transition-all flex items-center justify-center gap-2 text-sm"
        >
          {t('understood')}
        </button>
      </div>
    </div>
  );
}
