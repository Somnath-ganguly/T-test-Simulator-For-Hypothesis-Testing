import React, { useState } from 'react';
import { 
  Dices, 
  Upload, 
  FileText, 
  Play, 
  RefreshCw, 
  CheckCircle2,
  Sliders
} from 'lucide-react';

export const ExperimentForm = ({
  testType,
  onRunTest,
  onGenerateData,
  onUploadCSV,
  isLoading
}) => {
  const [sourceMode, setSourceMode] = useState('generated'); // 'generated', 'upload', 'manual'
  
  // Generation Params
  const [genParams, setGenParams] = useState({
    nA: 30,
    meanA: 100,
    stdA: 15,
    nB: 30,
    meanB: 105,
    stdB: 15,
    distribution: 'normal',
    correlation: 0.5,
    seed: 42
  });

  // Test Params
  const [testConfig, setTestConfig] = useState({
    alternative: 'two-sided',
    alpha: 0.05,
    mu0: 0,
    equalVar: false, // Default Welch test
    labelA: 'Sample A',
    labelB: 'Sample B'
  });

  // Manual Input State
  const [manualTextA, setManualTextA] = useState('10.2, 11.5, 9.8, 10.5, 11.0, 10.8, 12.0, 9.5, 10.1, 10.6');
  const [manualTextB, setManualTextB] = useState('8.5, 9.2, 8.8, 9.5, 10.0, 9.1, 10.5, 8.2, 9.0, 9.4');

  // CSV Upload State
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [selectedColA, setSelectedColA] = useState('');
  const [selectedColB, setSelectedColB] = useState('');
  const [csvFileName, setCsvFileName] = useState('');

  const parseManualInput = (text) => {
    if (!text) return [];
    return text
      .split(/[\s,;\n]+/)
      .map((val) => parseFloat(val))
      .filter((val) => !isNaN(val));
  };

  const handleCsvFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setCsvFileName(file.name);
      const res = await onUploadCSV(file);
      setCsvColumns(res.columns);
      setCsvData(res.data);
      if (res.columns.length > 0) setSelectedColA(res.columns[0]);
      if (res.columns.length > 1) setSelectedColB(res.columns[1]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let sampleA = [];
    let sampleB = null;

    if (sourceMode === 'generated') {
      const genRes = await onGenerateData({
        test_type: testType,
        n_a: parseInt(genParams.nA, 10),
        mean_a: parseFloat(genParams.meanA),
        std_a: parseFloat(genParams.stdA),
        n_b: testType !== 'one_sample' ? parseInt(genParams.nB, 10) : undefined,
        mean_b: testType !== 'one_sample' ? parseFloat(genParams.meanB) : undefined,
        std_b: testType !== 'one_sample' ? parseFloat(genParams.stdB) : undefined,
        distribution: genParams.distribution,
        correlation: parseFloat(genParams.correlation),
        seed: genParams.seed ? parseInt(genParams.seed, 10) : undefined
      });
      sampleA = genRes.sample_a;
      sampleB = genRes.sample_b;
    } else if (sourceMode === 'manual') {
      sampleA = parseManualInput(manualTextA);
      if (testType !== 'one_sample') {
        sampleB = parseManualInput(manualTextB);
      }
    } else if (sourceMode === 'upload') {
      if (csvData && selectedColA) {
        sampleA = csvData[selectedColA] || [];
      }
      if (testType !== 'one_sample' && csvData && selectedColB) {
        sampleB = csvData[selectedColB] || [];
      }
    }

    onRunTest({
      test_type: testType,
      alternative: testConfig.alternative,
      alpha: parseFloat(testConfig.alpha),
      mu_0: parseFloat(testConfig.mu0),
      equal_var: testConfig.equalVar,
      sample_a: sampleA,
      sample_b: sampleB,
      label_a: testConfig.labelA || 'Sample A',
      label_b: testConfig.labelB || 'Sample B'
    }, sourceMode === 'generated' ? genParams.seed : null);
  };

  return (
    <div className="bg-white border border-[#DDE2E8] rounded-lg p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE2E8]">
        <div>
          <h2 className="text-sm font-semibold text-[#253449] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#426B8A]" />
            <span>Experiment Configuration & Data Input</span>
          </h2>
          <p className="text-xs text-[#687586] mt-0.5">
            Configure data generation parameters, upload CSV dataset, or enter observations
          </p>
        </div>

        {/* Source Mode Switcher */}
        <div className="flex bg-[#F7F8FA] p-1 rounded-md border border-[#DDE2E8] text-xs font-medium self-start">
          <button
            type="button"
            onClick={() => setSourceMode('generated')}
            className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              sourceMode === 'generated'
                ? 'bg-white text-[#426B8A] shadow-xs border border-[#DDE2E8] font-semibold'
                : 'text-[#687586] hover:text-[#253449]'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Generate</span>
          </button>
          <button
            type="button"
            onClick={() => setSourceMode('upload')}
            className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              sourceMode === 'upload'
                ? 'bg-white text-[#426B8A] shadow-xs border border-[#DDE2E8] font-semibold'
                : 'text-[#687586] hover:text-[#253449]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setSourceMode('manual')}
            className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              sourceMode === 'manual'
                ? 'bg-white text-[#426B8A] shadow-xs border border-[#DDE2E8] font-semibold'
                : 'text-[#687586] hover:text-[#253449]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* DATA INPUT PANEL */}
        {sourceMode === 'generated' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#FAFAFC] p-3.5 rounded-md border border-[#E2E8F0]">
              <div>
                <label className="block text-xs font-medium text-[#253449] mb-1">
                  Distribution Shape
                </label>
                <select
                  value={genParams.distribution}
                  onChange={(e) => setGenParams({ ...genParams, distribution: e.target.value })}
                  className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                >
                  <option value="normal">Normal (Gaussian)</option>
                  <option value="skewed">Right Skewed (Exponential)</option>
                  <option value="t_dist">Heavy-tailed (Student t df=4)</option>
                  <option value="uniform">Uniform</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#253449] mb-1">
                  Random Seed
                </label>
                <input
                  type="number"
                  value={genParams.seed || ''}
                  onChange={(e) => setGenParams({ ...genParams, seed: e.target.value })}
                  placeholder="e.g. 42"
                  className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                />
              </div>

              {testType === 'paired' && (
                <div>
                  <label className="block text-xs font-medium text-[#253449] mb-1">
                    Pair Correlation (r)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="-0.95"
                    max="0.95"
                    value={genParams.correlation}
                    onChange={(e) => setGenParams({ ...genParams, correlation: e.target.value })}
                    className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                  />
                </div>
              )}
            </div>

            {/* Sample A Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#FAFAFC] p-3.5 rounded-md border border-[#E2E8F0]">
              <div className="col-span-full font-semibold text-xs text-[#426B8A] uppercase tracking-wider">
                Sample A Parameters
              </div>
              <div>
                <label className="block text-xs text-[#687586] mb-1">Sample Size (n_A)</label>
                <input
                  type="number"
                  min="3"
                  max="1000"
                  value={genParams.nA}
                  onChange={(e) => setGenParams({ ...genParams, nA: e.target.value })}
                  className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#687586] mb-1">Target Mean (μ_A)</label>
                <input
                  type="number"
                  step="any"
                  value={genParams.meanA}
                  onChange={(e) => setGenParams({ ...genParams, meanA: e.target.value })}
                  className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#687586] mb-1">Std Deviation (σ_A)</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={genParams.stdA}
                  onChange={(e) => setGenParams({ ...genParams, stdA: e.target.value })}
                  className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                />
              </div>
            </div>

            {/* Sample B Controls if 2-sample or paired */}
            {testType !== 'one_sample' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#FAFAFC] p-3.5 rounded-md border border-[#E2E8F0]">
                <div className="col-span-full font-semibold text-xs text-[#426B8A] uppercase tracking-wider">
                  Sample B Parameters
                </div>
                {testType === 'independent' && (
                  <div>
                    <label className="block text-xs text-[#687586] mb-1">Sample Size (n_B)</label>
                    <input
                      type="number"
                      min="3"
                      max="1000"
                      value={genParams.nB}
                      onChange={(e) => setGenParams({ ...genParams, nB: e.target.value })}
                      className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs text-[#687586] mb-1">Target Mean (μ_B)</label>
                  <input
                    type="number"
                    step="any"
                    value={genParams.meanB}
                    onChange={(e) => setGenParams({ ...genParams, meanB: e.target.value })}
                    className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#687586] mb-1">Std Deviation (σ_B)</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={genParams.stdB}
                    onChange={(e) => setGenParams({ ...genParams, stdB: e.target.value })}
                    className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {sourceMode === 'upload' && (
          <div className="space-y-3 bg-[#FAFAFC] p-3.5 rounded-md border border-[#E2E8F0]">
            <div>
              <label className="block text-xs font-medium text-[#253449] mb-1.5">
                Upload CSV Dataset File
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleCsvFileChange}
                className="block w-full text-xs text-[#687586] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-[#DDE2E8] file:text-xs file:font-medium file:bg-white file:text-[#253449] hover:file:bg-[#F0F4F8] cursor-pointer"
              />
              {csvFileName && (
                <div className="text-xs text-[#287A57] mt-1.5 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Loaded {csvFileName} ({csvColumns.length} numeric columns)
                </div>
              )}
            </div>

            {csvColumns.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs text-[#687586] mb-1">Column for Sample A</label>
                  <select
                    value={selectedColA}
                    onChange={(e) => setSelectedColA(e.target.value)}
                    className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                  >
                    {csvColumns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {testType !== 'one_sample' && (
                  <div>
                    <label className="block text-xs text-[#687586] mb-1">Column for Sample B</label>
                    <select
                      value={selectedColB}
                      onChange={(e) => setSelectedColB(e.target.value)}
                      className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
                    >
                      {csvColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {sourceMode === 'manual' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#253449] mb-1">
                Sample A Observations (comma or space separated)
              </label>
              <textarea
                rows={3}
                value={manualTextA}
                onChange={(e) => setManualTextA(e.target.value)}
                placeholder="e.g. 10.2, 11.5, 9.8, 10.5, 11.0"
                className="w-full bg-white border border-[#DDE2E8] rounded-md p-2.5 text-xs text-[#253449] font-mono focus:outline-none focus:border-[#426B8A]"
              />
            </div>

            {testType !== 'one_sample' && (
              <div>
                <label className="block text-xs font-medium text-[#253449] mb-1">
                  Sample B Observations
                </label>
                <textarea
                  rows={3}
                  value={manualTextB}
                  onChange={(e) => setManualTextB(e.target.value)}
                  placeholder="e.g. 8.5, 9.2, 8.8, 9.5, 10.0"
                  className="w-full bg-white border border-[#DDE2E8] rounded-md p-2.5 text-xs text-[#253449] font-mono focus:outline-none focus:border-[#426B8A]"
                />
              </div>
            )}
          </div>
        )}

        {/* HYPOTHESIS CONFIGURATION */}
        <div className="pt-3 border-t border-[#DDE2E8] space-y-3">
          <div className="font-semibold text-xs text-[#687586] uppercase tracking-wider">
            Hypothesis & Significance Parameters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#687586] mb-1">Alternative Hypothesis (H₁)</label>
              <select
                value={testConfig.alternative}
                onChange={(e) => setTestConfig({ ...testConfig, alternative: e.target.value })}
                className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
              >
                <option value="two-sided">Two-Sided (H₁: μ₁ ≠ μ₂)</option>
                <option value="less">Left-Tailed (H₁: μ₁ &lt; μ₂)</option>
                <option value="greater">Right-Tailed (H₁: μ₁ &gt; μ₂)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#687586] mb-1">Significance Level (α)</label>
              <select
                value={testConfig.alpha}
                onChange={(e) => setTestConfig({ ...testConfig, alpha: e.target.value })}
                className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
              >
                <option value={0.01}>α = 0.01 (99% CI)</option>
                <option value={0.05}>α = 0.05 (95% CI)</option>
                <option value={0.10}>α = 0.10 (90% CI)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#687586] mb-1">
                {testType === 'one_sample' ? 'Hypothesized Mean (μ₀)' : 'Hypothesized Difference (Δ₀)'}
              </label>
              <input
                type="number"
                step="any"
                value={testConfig.mu0}
                onChange={(e) => setTestConfig({ ...testConfig, mu0: e.target.value })}
                className="w-full bg-white border border-[#DDE2E8] rounded-md px-2.5 py-1.5 text-xs text-[#253449] focus:outline-none focus:border-[#426B8A]"
              />
            </div>
          </div>

          {/* Variance Option for Independent Test */}
          {testType === 'independent' && (
            <div className="flex items-start space-x-2.5 bg-[#FAFAFC] p-2.5 rounded-md border border-[#E2E8F0]">
              <input
                type="checkbox"
                id="equalVarCheck"
                checked={testConfig.equalVar}
                onChange={(e) => setTestConfig({ ...testConfig, equalVar: e.target.checked })}
                className="w-4 h-4 rounded text-[#426B8A] focus:ring-[#426B8A] border-[#DDE2E8] mt-0.5 cursor-pointer"
              />
              <label htmlFor="equalVarCheck" className="text-xs text-[#253449] cursor-pointer select-none">
                <span className="font-medium">Assume Equal Variances (Student's Pooled Variance T-Test)</span>
                <span className="text-[#687586] block text-[11px] mt-0.5">
                  Default (unchecked) uses Welch's t-test, which relaxes the equal variance assumption.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2 rounded-md bg-[#426B8A] hover:bg-[#34556F] text-white font-medium text-xs shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Computing Statistics...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run T-Test Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
