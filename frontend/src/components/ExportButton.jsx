import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

export const ExportButton = ({ result, rawData }) => {
  if (!result) return null;

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportResultsCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Test Name', result.test_name],
      ['Alternative Hypothesis', result.alternative],
      ['Alpha', result.alpha],
      ['Null Hypothesis', result.null_hypothesis],
      ['Alt Hypothesis', result.alt_hypothesis],
      ['t-Statistic', result.t_statistic],
      ['p-Value', result.p_value],
      ['Degrees of Freedom (df)', result.df],
      ['Sample A Label', result.label_a],
      ['Sample A Size (n_a)', result.n_a],
      ['Sample A Mean', result.mean_a],
      ['Sample A Std Dev', result.std_a],
      ['Sample B Label', result.label_b || 'N/A'],
      ['Sample B Size (n_b)', result.n_b || 'N/A'],
      ['Sample B Mean', result.mean_b !== null ? result.mean_b : 'N/A'],
      ['Sample B Std Dev', result.std_b !== null ? result.std_b : 'N/A'],
      ['Mean Difference', result.diff_mean],
      ['Standard Error', result.std_err],
      ['Confidence Interval Level', `${result.conf_level * 100}%`],
      ['CI Lower Bound', result.ci_lower],
      ['CI Upper Bound', result.ci_upper],
      ["Cohen's d Effect Size", result.cohens_d],
      ['Effect Size Label', result.effect_size_label],
      ['Statistical Decision', result.decision],
      ['Is Significant', result.is_significant]
    ];

    const csvContent = rows.map(e => e.map(x => `"${x}"`).join(',')).join('\n');
    downloadCSV(csvContent, `ttest_results_${Date.now()}.csv`);
  };

  const handleExportSampleDataCSV = () => {
    if (!rawData || !rawData.sample_a) return;
    const lenA = rawData.sample_a.length;
    const lenB = rawData.sample_b ? rawData.sample_b.length : 0;
    const maxLen = Math.max(lenA, lenB);

    const rows = [['sample_a', 'sample_b']];
    for (let i = 0; i < maxLen; i++) {
      const valA = i < lenA ? rawData.sample_a[i] : '';
      const valB = i < lenB ? rawData.sample_b[i] : '';
      rows.push([valA, valB]);
    }

    const csvContent = rows.map(e => e.join(',')).join('\n');
    downloadCSV(csvContent, `sample_data_${Date.now()}.csv`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleExportResultsCSV}
        className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F0F4F8] text-[#253449] border border-[#DDE2E8] transition text-xs font-medium flex items-center space-x-1.5 cursor-pointer shadow-xs"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-[#287A57]" />
        <span>Export Results (CSV)</span>
      </button>

      {rawData && rawData.sample_a && (
        <button
          onClick={handleExportSampleDataCSV}
          className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F0F4F8] text-[#253449] border border-[#DDE2E8] transition text-xs font-medium flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#426B8A]" />
          <span>Export Data (CSV)</span>
        </button>
      )}
    </div>
  );
};
