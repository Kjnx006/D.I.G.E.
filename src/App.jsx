import { useState, useEffect, useCallback } from 'react';
import { I18nProvider } from './i18n';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SolutionList from './components/SolutionList';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorState from './components/ErrorState';
import { FactoryDesigner } from './utils/FactoryDesigner';

function AppContent() {
  const [params, setParams] = useState({
    targetPower: 2321,
    minBatteryPercent: 5,
    maxWaste: 30,
    primaryFuelId: 'wulingLow',
    secondaryFuelId: 'none',
  });

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
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          params={params} 
          setParams={setParams} 
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarCollapsed(true)}
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
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
