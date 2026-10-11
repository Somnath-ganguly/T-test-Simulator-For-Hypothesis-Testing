import React from 'react';
import { Target, Activity, Compass, Gauge } from 'lucide-react';

export const ResultsCards = ({ result }) => {
  if (!result) return null;

  const {
    t_statistic,
    p_value,
    df,
    std_err,
    diff_mean,
    conf_level,
    ci_lower,
    ci_upper,
    cohens_d,
    effect_size_label,
    is_significant,
    alpha
  } = result;

  const ciText = ci_lower <= -999900 
    ? `(-∞, ${ci_upper.toFixed(2)})` 
    : ci_upper >= 999900 
    ? `(${ci_lower.toFixed(2)}, +∞)` 
    : `[${ci_lower.toFixed(2)}, ${ci_upper.toFixed(2)}]`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* T-Statistic Card */}
      <div className="bg-white border border-[#DDE2E8] p-4 rounded-md shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#687586] uppercase tracking-wider">t-Statistic</span>
          <Target className="w-4 h-4 text-[#426B8A]" />
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold text-[#253449] font-mono">{t_statistic.toFixed(4)}</div>
          <div className="text-xs text-[#687586] mt-0.5">df = {df.toFixed(2)}</div>
        </div>
      </div>

      {/* P-Value Card */}
      <div className={`bg-white border p-4 rounded-md shadow-xs ${
        is_significant ? 'border-[#287A57]/40 bg-[#F4F9F6]' : 'border-[#DDE2E8]'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#687586] uppercase tracking-wider">p-Value</span>
          <Activity className={`w-4 h-4 ${is_significant ? 'text-[#287A57]' : 'text-[#687586]'}`} />
        </div>
        <div className="mt-2.5">
          <div className={`text-xl font-bold font-mono ${
            is_significant ? 'text-[#287A57]' : 'text-[#253449]'
          }`}>
            {p_value < 0.0001 ? '< 0.0001' : p_value.toFixed(4)}
          </div>
          <div className="text-xs text-[#687586] mt-0.5 flex items-center gap-1.5">
            <span>α = {alpha}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              is_significant ? 'bg-[#287A57]/10 text-[#287A57]' : 'bg-[#F1F3F5] text-[#687586]'
            }`}>
              {is_significant ? 'p < α (Significant)' : 'p ≥ α (Not Significant)'}
            </span>
          </div>
        </div>
      </div>

      {/* Mean Difference & CI */}
      <div className="bg-white border border-[#DDE2E8] p-4 rounded-md shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#687586] uppercase tracking-wider">Mean Diff & {conf_level*100}% CI</span>
          <Compass className="w-4 h-4 text-[#426B8A]" />
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold text-[#253449] font-mono">{diff_mean.toFixed(2)}</div>
          <div className="text-xs text-[#687586] mt-0.5 font-mono">{ciText}</div>
        </div>
      </div>

      {/* Effect Size (Cohen's d) */}
      <div className="bg-white border border-[#DDE2E8] p-4 rounded-md shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#687586] uppercase tracking-wider">Effect Size (Cohen's d)</span>
          <Gauge className="w-4 h-4 text-[#426B8A]" />
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#253449] font-mono">{cohens_d.toFixed(2)}</span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#F0F4F8] text-[#426B8A] border border-[#DDE2E8]">
              {effect_size_label}
            </span>
          </div>
          <div className="text-xs text-[#687586] mt-0.5">SE = {std_err.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
};
