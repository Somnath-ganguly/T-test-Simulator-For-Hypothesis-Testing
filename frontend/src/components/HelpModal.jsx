import React from 'react';
import { X, BookOpen } from 'lucide-react';

export const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#DDE2E8] rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-lg p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-[#DDE2E8] pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#426B8A]" />
            <h2 className="text-base font-bold text-[#253449]">Statistical T-Test Reference Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#687586] hover:text-[#253449] hover:bg-[#F0F4F8] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 text-xs text-[#253449] leading-relaxed">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-xs text-[#426B8A] uppercase tracking-wider">1. What is a T-Test?</h3>
            <p className="text-[#687586]">
              A t-test is an inferential statistical test used to determine if there is a significant difference 
              between the means of one or two groups. It evaluates observed sample mean differences against expected variation under the null hypothesis (H₀).
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-xs text-[#426B8A] uppercase tracking-wider">2. Mathematical Formulas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#FAFAFC] p-3 rounded-md border border-[#E2E8F0] space-y-1">
                <span className="font-medium text-[#253449] block text-xs">One-Sample T-Test</span>
                <div className="font-mono text-[11px] text-[#253449] bg-white p-1.5 rounded border border-[#DDE2E8]">
                  t = (x̄ - μ₀) / (s / √n)
                </div>
                <p className="text-[10px] text-[#687586]">df = n - 1</p>
              </div>

              <div className="bg-[#FAFAFC] p-3 rounded-md border border-[#E2E8F0] space-y-1">
                <span className="font-medium text-[#253449] block text-xs">Welch's Independent T-Test</span>
                <div className="font-mono text-[11px] text-[#253449] bg-white p-1.5 rounded border border-[#DDE2E8]">
                  t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)
                </div>
                <p className="text-[10px] text-[#687586]">Satterthwaite df</p>
              </div>

              <div className="bg-[#FAFAFC] p-3 rounded-md border border-[#E2E8F0] space-y-1">
                <span className="font-medium text-[#253449] block text-xs">Paired Samples T-Test</span>
                <div className="font-mono text-[11px] text-[#253449] bg-white p-1.5 rounded border border-[#DDE2E8]">
                  t = d̄ / (s_d / √n)
                </div>
                <p className="text-[10px] text-[#687586]">df = n - 1</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 bg-[#FAFAFC] p-3 rounded-md border border-[#E2E8F0]">
            <h3 className="font-semibold text-xs text-[#426B8A]">3. Welch's t-Test vs. Student's Pooled T-Test</h3>
            <p className="text-[#687586]">
              <strong>Welch's t-test</strong> (the default in this simulator and modern software like R and SciPy) 
              relaxes the equal variance assumption (σ₁² = σ₂²). It uses Satterthwaite degrees of freedom and protects against Type I errors when sample sizes or variances differ.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-semibold text-xs text-[#426B8A] uppercase tracking-wider">4. Effect Size (Cohen's d)</h3>
            <ul className="list-disc list-inside space-y-1 text-[#687586]">
              <li><strong>|d| &lt; 0.2:</strong> Negligible effect size</li>
              <li><strong>0.2 ≤ |d| &lt; 0.5:</strong> Small effect size</li>
              <li><strong>0.5 ≤ |d| &lt; 0.8:</strong> Medium effect size</li>
              <li><strong>|d| ≥ 0.8:</strong> Large effect size</li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-[#DDE2E8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-[#426B8A] hover:bg-[#34556F] text-white font-medium text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
