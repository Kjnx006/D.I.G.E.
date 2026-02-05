import { useState, useEffect, useCallback } from 'react';
import { I18nProvider, useI18n } from './i18n';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SolutionList from './components/SolutionList';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorState from './components/ErrorState';
import Announcement, { shouldShowAnnouncement } from './components/Announcement';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import CloseButton from './components/CloseButton';
import { FactoryDesigner } from './utils/FactoryDesigner';

// 生成随机目标发电量 (500 - 5000)
const getRandomTargetPower = () => Math.floor(Math.random() * 4500) + 500;
const PRIVACY_FOOTER_DISMISSED_KEY = 'dige-privacy-footer-dismissed';

function AppContent({ onOpenAnnouncement, onOpenPrivacyPolicy }) {
  const { t } = useI18n();
  const [params, setParams] = useState(() => ({
    targetPower: 2656,
    minBatteryPercent: 5,
    maxWaste: 30,
    primaryFuelId: 'wulingLow',
    secondaryFuelId: 'none',
  }));

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
    } catch (error) {
      console.error('Calculation error:', error);
      setIsLoading(false);
      setShowError(true);
      setSolutions([]);
    }
  }, [params]);

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
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenAnnouncement={onOpenAnnouncement}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          params={params}
          setParams={setParams}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarCollapsed(true)}
          onCalculate={runCalculation}
          onRandomCalculate={handleRandomCalculate}
          onOpenAnnouncement={onOpenAnnouncement}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-endfield-black relative overflow-hidden">
          <SolutionList
            solutions={solutions}
            selectedIndex={selectedIndex}
            onSelectSolution={setSelectedIndex}
            params={params}
          />

          <LoadingOverlay isLoading={isLoading} />
          <ErrorState show={showError} onDismiss={() => setShowError(false)} />
        </main>
      </div>

      {showPrivacyFooter && (
        <footer className="shrink-0 relative border-t border-endfield-gray-light bg-endfield-dark px-3 py-2 text-[11px] sm:text-xs text-endfield-text leading-relaxed">
          <div className="pr-8 text-center">
            {t('claritySiteDisclosure')}
            {' '}
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="cursor-pointer text-endfield-yellow hover:text-endfield-yellow-glow underline underline-offset-2"
            >
              {t('privacyPolicyDetails')}
            </button>
            {' '}|{' '}
            <a
              href="https://privacy.microsoft.com/privacystatement"
              target="_blank"
              rel="noopener noreferrer"
              className="text-endfield-yellow hover:text-endfield-yellow-glow underline underline-offset-2"
            >
              {t('microsoftPrivacyStatement')}
            </a>
          </div>

          <CloseButton
            onClick={handleDismissPrivacyFooter}
            label={t('close')}
            sizeClass="w-5 h-5"
            iconClass="text-xs"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        </footer>
      )}
    </div>
  );
}

function App() {
  const [showAnnouncement, setShowAnnouncement] = useState(() => shouldShowAnnouncement());
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  return (
    <I18nProvider>
      <AppContent
        onOpenAnnouncement={() => setShowAnnouncement(true)}
        onOpenPrivacyPolicy={() => setShowPrivacyPolicy(true)}
      />
      <Announcement show={showAnnouncement} onClose={() => setShowAnnouncement(false)} />
      <PrivacyPolicyModal show={showPrivacyPolicy} onClose={() => setShowPrivacyPolicy(false)} />
    </I18nProvider>
  );
}

export default App;
