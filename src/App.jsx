import { useState, useEffect, useCallback } from 'react';
import { I18nProvider } from './i18n';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SolutionList from './components/SolutionList';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorState from './components/ErrorState';
import Announcement, { shouldShowAnnouncement } from './components/Announcement';
import { FactoryDesigner } from './utils/FactoryDesigner';

// 生成随机目标发电量 (500 - 5000)
const getRandomTargetPower = () => Math.floor(Math.random() * 4500) + 500;

function AppContent({ onOpenAnnouncement }) {
  const [params, setParams] = useState(() => ({
    targetPower: getRandomTargetPower(),
    minBatteryPercent: 5,
    maxWaste: 30,
    primaryFuelId: 'wulingLow',
    secondaryFuelId: 'none',
  }));

  const [solutions, setSolutions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  // 默认展开侧边栏
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const runCalculation = useCallback(async () => {
    setIsLoading(true);
    setShowError(false);

    // Allow UI to update
    await new Promise(r => setTimeout(r, 50));

    try {
      const designer = new FactoryDesigner(params);
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

  // Run calculation on initial load
  useEffect(() => {
    const timer = setTimeout(runCalculation, 300);
    return () => clearTimeout(timer);
  }, []);

  const selectedSolution = solutions[selectedIndex] || null;

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
    </div>
  );
}

function App() {
  const [showAnnouncement, setShowAnnouncement] = useState(() => shouldShowAnnouncement());

  return (
    <I18nProvider>
      <AppContent onOpenAnnouncement={() => setShowAnnouncement(true)} />
      <Announcement show={showAnnouncement} onClose={() => setShowAnnouncement(false)} />
    </I18nProvider>
  );
}

export default App;
