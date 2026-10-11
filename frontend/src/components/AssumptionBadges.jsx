import React from 'react';
import { ShieldCheck, ShieldAlert, Check, AlertCircle } from 'lucide-react';

export const AssumptionBadges = ({ result }) => {
  if (!result) return null;

  const { normality_p_a, normality_p_b, levene_p, label_a, label_b, test_type } = result;

  const renderBadge = (title, pVal, desc) => {
    if (pVal === null || pVal === undefined) return null;
    const isNormal = pVal >= 0.05;
    return (
      <div className={`px-3 py-2 rounded-md border flex items-center justify-between text-xs ${
        isNormal 
          ? 'bg-[#FAFAFC] border-[#E2E8F0] text-[#253449]' 
          : 'bg-[#FFFBEB] border-[#FCD34D]/60 text-[#92400E]'
      }`}>
        <div className="flex items-center space-x-2">
          {isNormal ? (
            <Check className="w-3.5 h-3.5 text-[#287A57] shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
          )}
          <div>
            <span className="font-medium text-[11px] text-[#253449]">{title}</span>
            <span className="text-[10px] text-[#687586] block">{desc}</span>
          </div>
        </div>
        <div className="font-mono text-right shrink-0 ml-2 text-[11px]">
          <span className="font-semibold text-[#253449]">p = {pVal.toFixed(4)}</span>
          <span className="text-[10px] text-[#687586] block">{isNormal ? 'Passed (p ≥ 0.05)' : 'Flagged (p < 0.05)'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#DDE2E8] rounded-lg p-3 shadow-sm space-y-2">
      <div className="text-[11px] font-semibold text-[#687586] uppercase tracking-wider">
        Statistical Assumption Diagnostics
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {renderBadge(
          `${label_a || 'Sample A'} Normality`,
          normality_p_a,
          'Shapiro-Wilk test'
        )}

        {renderBadge(
          `${label_b || 'Sample B'} Normality`,
          normality_p_b,
          'Shapiro-Wilk test'
        )}

        {test_type === 'independent' && renderBadge(
          'Homogeneity of Variance',
          levene_p,
          "Levene's test"
        )}
      </div>
    </div>
  );
};
