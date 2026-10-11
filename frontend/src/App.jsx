import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ExperimentForm } from './components/ExperimentForm';
import { DataPreview } from './components/DataPreview';
import { ResultsCards } from './components/ResultsCards';
import { DistributionChart } from './components/DistributionChart';
import { BoxPlot } from './components/BoxPlot';
import { MeanComparisonChart } from './components/MeanComparisonChart';
import { HypothesisDecision } from './components/HypothesisDecision';
import { AssumptionBadges } from './components/AssumptionBadges';
import { ExperimentHistory } from './components/ExperimentHistory';
import { ExportButton } from './components/ExportButton';
import { HelpModal } from './components/HelpModal';
import { api } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [selectedTest, setSelectedTest] = useState('one_sample');
  const [result, setResult] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Default initial run on mount
  useEffect(() => {
    handleRunInitial();
  }, []);

  const handleRunInitial = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const genRes = await api.generateData({
        test_type: 'one_sample',
        n_a: 30,
        mean_a: 78.5,
        std_a: 6.2,
        seed: 42
      });
      setRawData(genRes);

      const tRes = await api.runTTest({
        test_type: 'one_sample',
        alternative: 'two-sided',
        alpha: 0.05,
        mu_0: 75.0,
        sample_a: genRes.sample_a,
        label_a: 'Exam Scores'
      });
      setResult(tRes);
      addToHistory(tRes, genRes, { test_type: 'one_sample', seed: 42 });
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.detail || err.message || 'Failed to execute initial t-test.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTest = (testId) => {
    setSelectedTest(testId);
    setErrorMessage(null);
  };

  const handleGenerateData = async (params) => {
    try {
      const res = await api.generateData(params);
      setRawData(res);
      return res;
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to generate random data.');
      throw err;
    }
  };

  const handleUploadCSV = async (file) => {
    try {
      const res = await api.uploadCSV(file);
      return res;
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to parse CSV file.');
      throw err;
    }
  };

  const handleRunTest = async (payload, seed) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.runTTest(payload);
      setResult(res);
      addToHistory(res, { sample_a: payload.sample_a, sample_b: payload.sample_b }, { ...payload, seed });
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.detail || err.message || 'Error executing t-test analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = (res, data, config) => {
    setHistory((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        result: res,
        rawData: data,
        config
      },
      ...prev.slice(0, 9)
    ]);
  };

  const handleLoadPreset = async (type) => {
    setSelectedTest(type);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (type === 'one_sample') {
        const genRes = await api.generateData({
          test_type: 'one_sample',
          n_a: 25,
          mean_a: 81.2,
          std_a: 5.4,
          seed: 101
        });
        setRawData(genRes);
        const tRes = await api.runTTest({
          test_type: 'one_sample',
          alternative: 'greater',
          alpha: 0.05,
          mu_0: 75.0,
          sample_a: genRes.sample_a,
          label_a: 'Exam Scores'
        });
        setResult(tRes);
        addToHistory(tRes, genRes, { test_type: 'one_sample', seed: 101 });
      } else if (type === 'independent') {
        const genRes = await api.generateData({
          test_type: 'independent',
          n_a: 35,
          mean_a: 122.5,
          std_a: 8.2,
          n_b: 35,
          mean_b: 112.0,
          std_b: 7.5,
          seed: 202
        });
        setRawData(genRes);
        const tRes = await api.runTTest({
          test_type: 'independent',
          alternative: 'two-sided',
          alpha: 0.05,
          mu_0: 0,
          equal_var: false,
          sample_a: genRes.sample_a,
          sample_b: genRes.sample_b,
          label_a: 'Placebo Group',
          label_b: 'Treatment Group'
        });
        setResult(tRes);
        addToHistory(tRes, genRes, { test_type: 'independent', seed: 202 });
      } else if (type === 'paired') {
        const genRes = await api.generateData({
          test_type: 'paired',
          n_a: 20,
          mean_a: 88.5,
          std_a: 6.0,
          n_b: 20,
          mean_b: 84.1,
          std_b: 5.8,
          correlation: 0.85,
          seed: 303
        });
        setRawData(genRes);
        const tRes = await api.runTTest({
          test_type: 'paired',
          alternative: 'two-sided',
          alpha: 0.05,
          mu_0: 0,
          sample_a: genRes.sample_a,
          sample_b: genRes.sample_b,
          label_a: 'Before Diet',
          label_b: 'After Diet'
        });
        setResult(tRes);
        addToHistory(tRes, genRes, { test_type: 'paired', seed: 303 });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to load preset dataset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerunHistory = (item) => {
    setSelectedTest(item.result.test_type);
    setResult(item.result);
    setRawData(item.rawData);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F7F8FA] text-[#253449]">
      {/* Sidebar */}
      <Sidebar
        selectedTest={selectedTest}
        onSelectTest={handleSelectTest}
        onLoadPreset={handleLoadPreset}
        onOpenHelpModal={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 p-4 lg:p-6 space-y-5 overflow-x-hidden max-w-7xl mx-auto w-full">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-[#DDE2E8] shadow-xs">
          <div>
            <h2 className="text-base font-bold text-[#253449] tracking-tight">
              {result ? result.test_name : 'Statistical T-Test Analysis'}
            </h2>
            <p className="text-xs text-[#687586] mt-0.5">
              Scientific Hypothesis Testing & Reproducible Analysis Engine
            </p>
          </div>

          <ExportButton result={result} rawData={rawData} />
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-[#FDF2F2] border border-[#F87171]/50 p-3.5 rounded-lg text-xs text-[#B54747] flex items-start space-x-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-[#B54747] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Computation Error</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 1. Experiment Setup Form */}
        <ExperimentForm
          testType={selectedTest}
          onRunTest={handleRunTest}
          onGenerateData={handleGenerateData}
          onUploadCSV={handleUploadCSV}
          isLoading={isLoading}
        />

        {/* 2. Results Key Metrics Grid */}
        {result && <ResultsCards result={result} />}

        {/* 3. Statistical Conclusion & Interpretation */}
        {result && <HypothesisDecision result={result} />}

        {/* 4. Visualizations */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DistributionChart result={result} />
            <BoxPlot result={result} />
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              <MeanComparisonChart result={result} />
            </div>
            <div className="lg:col-span-2">
              <DataPreview result={result} />
            </div>
          </div>
        )}

        {/* 5. Assumption Diagnostics (Compact secondary section below results) */}
        {result && <AssumptionBadges result={result} />}

        {/* 6. Session Log */}
        <ExperimentHistory
          history={history}
          onRerun={handleRerunHistory}
          onClear={() => setHistory([])}
        />
      </main>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
