import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  BookOpen 
} from 'lucide-react';

export const HypothesisDecision = ({ result }) => {
  if (!result) return null;

  const {
    null_hypothesis,
    alt_hypothesis,
    decision,
    is_significant,
    alpha,
    interpretation,
    warnings
  } = result;

  return (
    <div className="bg-white border border-[#DDE2E8] rounded-lg p-5 shadow-sm space-y-5">
      {/* Decision Banner */}
      <div className={`p-3.5 rounded-md border flex items-center justify-between ${
        is_significant
          ? 'bg-[#F4F9F6] border-[#287A57]/30 text-[#287A57]'
          : 'bg-[#FAFAFC] border-[#DDE2E8] text-[#253449]'
      }`}>
        <div className="flex items-center space-x-2.5">
          {is_significant ? (
            <CheckCircle className="w-5 h-5 text-[#287A57] shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-[#687586] shrink-0" />
          )}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80">Statistical Decision</div>
            <div className="text-base font-bold font-mono mt-0.5">{decision}</div>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-[#687586] block text-[10px]">Significance Level</span>
          <div className="font-semibold font-mono text-xs">α = {alpha}</div>
        </div>
      </div>

      {/* Hypotheses Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#FAFAFC] border border-[#E2E8F0] p-3 rounded-md">
          <span className="text-[11px] font-semibold text-[#687586] uppercase tracking-wider block mb-1">
            Null Hypothesis (H₀)
          </span>
          <div className="font-mono text-xs font-medium text-[#253449] bg-white p-2 rounded border border-[#DDE2E8]">
            {null_hypothesis}
          </div>
        </div>

        <div className="bg-[#FAFAFC] border border-[#E2E8F0] p-3 rounded-md">
          <span className="text-[11px] font-semibold text-[#687586] uppercase tracking-wider block mb-1">
            Alternative Hypothesis (H₁)
          </span>
          <div className="font-mono text-xs font-medium text-[#426B8A] bg-white p-2 rounded border border-[#DDE2E8]">
            {alt_hypothesis}
          </div>
        </div>
      </div>

      {/* Warnings & Diagnostics */}
      {warnings && warnings.length > 0 && (
        <div className="bg-[#FFFBEB] border border-[#FCD34D]/60 p-3 rounded-md text-xs space-y-1.5">
          <div className="font-semibold text-[#92400E] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Diagnostic Warnings</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[#B45309] leading-relaxed">
            {warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Interpretation Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[#426B8A]" />
          <h4 className="text-xs font-semibold text-[#253449] uppercase tracking-wider">Statistical Interpretation</h4>
        </div>

        <div className="space-y-2.5 text-xs text-[#253449] leading-relaxed">
          <div className="bg-[#FAFAFC] border border-[#E2E8F0] p-3.5 rounded-md space-y-1">
            <span className="font-semibold text-[#253449] block text-xs">Plain Language Explanation</span>
            <p className="text-[#687586]">{interpretation.plain_english}</p>
          </div>

          <div className="bg-[#FAFAFC] border border-[#E2E8F0] p-3.5 rounded-md space-y-1">
            <span className="font-semibold text-[#253449] block text-xs">Practical vs. Statistical Significance</span>
            <p className="text-[#687586]">{interpretation.practical_vs_statistical}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
            <div className="bg-[#FAFAFC] border border-[#E2E8F0] p-3 rounded-md space-y-1">
              <span className="font-semibold text-[#426B8A] flex items-center gap-1 text-xs">
                <ShieldAlert className="w-3.5 h-3.5" />
                Causation Caution
              </span>
              <p className="text-[11px] text-[#687586] leading-normal">
                {interpretation.causation_warning}
              </p>
            </div>

            <div className="bg-[#FAFAFC] border border-[#E2E8F0] p-3 rounded-md space-y-1">
              <span className="font-semibold text-[#426B8A] flex items-center gap-1 text-xs">
                <Info className="w-3.5 h-3.5" />
                H₀ Proof Caution
              </span>
              <p className="text-[11px] text-[#687586] leading-normal">
                {interpretation.h0_truth_warning}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
