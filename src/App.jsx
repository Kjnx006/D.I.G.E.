import { useState, useEffect, useCallback, useRef } from 'react';
import { I18nProvider, useI18n } from './i18n';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import SolutionList from './components/solution/SolutionList';
import LoadingOverlay from './components/overlays/LoadingOverlay';
import ErrorState from './components/modals/ErrorState';
import Announcement, { shouldShowAnnouncement } from './components/modals/Announcement';
import PrivacyPolicyModal from './components/modals/PrivacyPolicyModal';
import QAModal from './components/modals/QAModal';
import ShareModal from './components/modals/ShareModal';
import ShareStatusToast from './components/overlays/ShareStatusToast';
import DirtyOverlay from './components/overlays/DirtyOverlay';
import Footer from './components/Footer';
import { FactoryDesigner } from './utils/FactoryDesigner';
import { buildShareUrl, getShareParamsFromUrl } from './utils/shareParams';

// 生成随机目标发电量 (500 - 5000)
const getRandomTargetPower = () => Math.floor(Math.random() * 4500) + 500;
const PRIVACY_FOOTER_DISMISSED_KEY = 'dige-privacy-footer-dismissed';
const SHARE_STATUS_VISIBLE_MS = 1800;
const SHARE_STATUS_FADE_MS = 220;
const DEFAULT_PARAMS = {
  targetPower: 2656,
  minBatteryPercent: 5,
  maxWaste: 30,
  maxBranches: 3,
  phaseOffsetBranch1: 0,
  phaseOffsetBranch2: 0,
  phaseOffsetBranch3: 0,
  exclude_belt: true,
  primaryFuelId: 'wulingLow',
  secondaryFuelId: 'none',
  inputSourceId: 'warehouse',
};

const getInitialParams = () => {
  if (typeof window === 'undefined') return DEFAULT_PARAMS;
  const sharedParams = getShareParamsFromUrl();
  return sharedParams ? { ...DEFAULT_PARAMS, ...sharedParams } : DEFAULT_PARAMS;
};

function AppContent({ onOpenAnnouncement, onOpenPrivacyPolicy, onOpenQA }) {
  const { t } = useI18n();
  const [params, setParams] = useState(getInitialParams);
  const [shareStatusMessage, setShareStatusMessage] = useState('');
  const [shareStatusVisible, setShareStatusVisible] = useState(false);
  const shareStatusTimer = useRef({ hide: null, clear: null, frame: null });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const [solutions, setSolutions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showPrivacyFooter, setShowPrivacyFooter] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(PRIVACY_FOOTER_DISMISSED_KEY) !== '1';
  });
  // 默认展开侧边栏
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // 追踪参数是否修改但未计算
  const [paramsDirty, setParamsDirty] = useState(false);
  const [showDirtyOverlay, setShowDirtyOverlay] = useState(false);
  const [dirtyDismissed, setDirtyDismissed] = useState(false);
  const lastCalcParamsRef = useRef(null);

  // 包装 setParams，自动标记脏状态
  const setParamsWithDirty = useCallback((updater) => {
    setParams(updater);
    setParamsDirty(true);
    setDirtyDismissed(false);
  }, []);

  const runCalculation = useCallback(async (overrideParams = null) => {
    setIsLoading(true);
    setShowError(false);

    // Allow UI to update
    await new Promise(r => setTimeout(r, 50));

    try {
      const calcParams = overrideParams || params;
      const designer = new FactoryDesigner(calcParams);
      const results = designer.solve();

      setIsLoading(false);

      if (!results || results.length === 0) {
        setShowError(true);
        setSolutions([]);
        return;
      }

      setSolutions(results);
      setSelectedIndex(0);
      setParamsDirty(false);
      setShowDirtyOverlay(false);
      setDirtyDismissed(false);
      lastCalcParamsRef.current = { ...calcParams };
    } catch (error) {
      console.error('Calculation error:', error);
      setIsLoading(false);
      setShowError(true);
      setSolutions([]);
      setParamsDirty(false);
      setShowDirtyOverlay(false);
      setDirtyDismissed(false);
    }
  }, [params]);

  useEffect(() => {
    return () => {
      if (shareStatusTimer.current.hide) clearTimeout(shareStatusTimer.current.hide);
      if (shareStatusTimer.current.clear) clearTimeout(shareStatusTimer.current.clear);
      if (shareStatusTimer.current.frame && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(shareStatusTimer.current.frame);
      }
    };
  }, []);

  const showShareStatus = useCallback((message) => {
    if (!message) return;
    if (shareStatusTimer.current.hide) clearTimeout(shareStatusTimer.current.hide);
    if (shareStatusTimer.current.clear) clearTimeout(shareStatusTimer.current.clear);
    if (shareStatusTimer.current.frame && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(shareStatusTimer.current.frame);
    }

    setShareStatusMessage(message);
    setShareStatusVisible(false);
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      shareStatusTimer.current.frame = window.requestAnimationFrame(() => setShareStatusVisible(true));
    } else {
      setShareStatusVisible(true);
    }

    shareStatusTimer.current.hide = setTimeout(() => setShareStatusVisible(false), SHARE_STATUS_VISIBLE_MS);
    shareStatusTimer.current.clear = setTimeout(
      () => setShareStatusMessage(''),
      SHARE_STATUS_VISIBLE_MS + SHARE_STATUS_FADE_MS
    );
  }, []);

  const getCopyErrorReason = useCallback((error) => {
    const name = error?.name || '';
    if (name === 'NotAllowedError') return t('copyFailedReasonPermission');
    if (name === 'SecurityError') return t('copyFailedReasonInsecure');
    if (name === 'NotFoundError') return t('copyFailedReasonUnavailable');
    return t('copyFailedReasonUnknown');
  }, [t]);

  const handleOpenShareModal = useCallback(() => {
    const nextUrl = buildShareUrl(params);
    if (!nextUrl) {
      showShareStatus(t('shareFailed'));
      return;
    }

    window.history.replaceState({}, '', nextUrl);
    setShareUrl(nextUrl);
    setShareModalOpen(true);
  }, [params, showShareStatus, t]);

  const handleCloseShareModal = useCallback(() => {
    setShareModalOpen(false);
  }, []);

  const handleCopyShareUrl = useCallback(async () => {
    if (!shareUrl) {
      showShareStatus(t('shareFailed'));
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showShareStatus(t('shareCopied'));
      } else {
        window.prompt(t('shareCopyPrompt'), shareUrl);
        showShareStatus(t('shareCopied'));
      }
    } catch (error) {
      console.error('Share error:', error);
      const reason = getCopyErrorReason(error);
      showShareStatus(`${t('copyFailed')}: ${reason}`);
    }
  }, [shareUrl, showShareStatus, t, getCopyErrorReason]);

  const handleNativeShare = useCallback(async () => {
    if (!shareUrl || !navigator.share) return;
    try {
      await navigator.share({ title: document.title, url: shareUrl });
    } catch (error) {
      if (error?.name === 'AbortError') return;
      console.error('Share error:', error);
      showShareStatus(t('shareFailed'));
    }
  }, [shareUrl, showShareStatus, t]);

  // 随机生成目标功率并立即计算
  const handleRandomCalculate = useCallback(() => {
    const newPower = getRandomTargetPower();
    const newParams = { ...params, targetPower: newPower };
    setParams(newParams);
    runCalculation(newParams);
  }, [params, runCalculation]);

  // Run calculation on initial load
  useEffect(() => {
    const timer = setTimeout(runCalculation, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissPrivacyFooter = () => {
    setShowPrivacyFooter(false);
    localStorage.setItem(PRIVACY_FOOTER_DISMISSED_KEY, '1');
  };

  return (
    <div className="bg-endfield-black text-endfield-text-light font-sans h-screen flex flex-col overflow-hidden">
        <Header
          onCalculate={runCalculation}
          onShare={handleOpenShareModal}
          onShowStatus={showShareStatus}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenAnnouncement={onOpenAnnouncement}
          onOpenPrivacyPolicy={onOpenPrivacyPolicy}
          onOpenQA={onOpenQA}
        />

        <ShareStatusToast message={shareStatusMessage} visible={shareStatusVisible} />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            params={params}
            setParams={setParamsWithDirty}
            collapsed={sidebarCollapsed}
            onClose={() => setSidebarCollapsed(true)}
            onCalculate={runCalculation}
            onRandomCalculate={handleRandomCalculate}
            onOpenAnnouncement={onOpenAnnouncement}
            onOpenPrivacyPolicy={onOpenPrivacyPolicy}
            onOpenQA={onOpenQA}
          />

          <div
            className="flex-1 overflow-hidden bg-[radial-gradient(circle_at_85%_20%,rgba(255,250,0,0.08),transparent_40%),repeating-linear-gradient(135deg,rgba(255,250,0,0.04)_0_1px,transparent_1px_14px),linear-gradient(180deg,rgba(255,250,0,0.02),transparent_35%,rgba(255,250,0,0.015))] relative"
            onMouseEnter={() => paramsDirty && !dirtyDismissed && setShowDirtyOverlay(true)}
            onMouseLeave={() => setShowDirtyOverlay(false)}
          >
            <main className="mx-auto w-full max-w-[1800px] h-full flex flex-col min-w-0 bg-endfield-black/92 backdrop-blur-[1px] relative overflow-hidden">
              <SolutionList
                solutions={solutions}
                selectedIndex={selectedIndex}
                onSelectSolution={setSelectedIndex}
                params={params}
              />

              <LoadingOverlay isLoading={isLoading} />
            </main>

            <DirtyOverlay
              show={showDirtyOverlay && paramsDirty}
              canRestore={!!lastCalcParamsRef.current}
              onCalculate={() => { runCalculation(); setShowDirtyOverlay(false); }}
              onRestore={() => {
                setParams({ ...lastCalcParamsRef.current });
                setParamsDirty(false);
                setShowDirtyOverlay(false);
              }}
              onDismiss={() => {
                setShowDirtyOverlay(false);
                setDirtyDismissed(true);
              }}
            />
          </div>
        </div>

        <Footer
          show={showPrivacyFooter}
          onDismiss={handleDismissPrivacyFooter}
          onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        />

        <ShareModal
          show={shareModalOpen}
          shareUrl={shareUrl}
          onClose={handleCloseShareModal}
          onCopy={handleCopyShareUrl}
          onShare={handleNativeShare}
          closeOnBackdrop={true}
        />
        <ErrorState show={showError} onDismiss={() => setShowError(false)} closeOnBackdrop={false} />
    </div>
  );
}

function App() {
  const [showAnnouncement, setShowAnnouncement] = useState(() => shouldShowAnnouncement());
  const [announcementInitialTab, setAnnouncementInitialTab] = useState('announcement');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showQA, setShowQA] = useState(false);

  const openAnnouncement = (initialTab = 'announcement') => {
    setAnnouncementInitialTab(initialTab);
    setShowAnnouncement(true);
  };

  return (
    <I18nProvider>
      <AppContent
        onOpenAnnouncement={openAnnouncement}
        onOpenPrivacyPolicy={() => setShowPrivacyPolicy(true)}
        onOpenQA={() => setShowQA(true)}
      />
      <Announcement
        show={showAnnouncement}
        initialTab={announcementInitialTab}
        onClose={() => setShowAnnouncement(false)}
        closeOnBackdrop={false}
      />
      <PrivacyPolicyModal
        show={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        closeOnBackdrop={true}
      />
      <QAModal show={showQA} onClose={() => setShowQA(false)} closeOnBackdrop={true} />
    </I18nProvider>
  );
}

export default App;
