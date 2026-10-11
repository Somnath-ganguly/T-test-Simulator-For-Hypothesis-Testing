import React from 'react';
import { History, RotateCcw, Trash2 } from 'lucide-react';

export const ExperimentHistory = ({ history, onRerun, onClear }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-white border border-[#DDE2E8] rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-[#426B8A]" />
          <h3 className="text-sm font-semibold text-[#253449]">Session Experiment Log</h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-[#687586] hover:text-[#B54747] transition flex items-center space-x-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {history.map((item, index) => (
          <div
            key={index}
            className="p-2.5 rounded-md bg-[#FAFAFC] border border-[#E2E8F0] hover:border-[#426B8A]/40 transition flex items-center justify-between text-xs"
          >
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[#253449]">{item.result.test_name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  item.result.is_significant
                    ? 'bg-[#287A57]/10 text-[#287A57] border border-[#287A57]/20'
                    : 'bg-[#F1F3F5] text-[#687586] border border-[#DDE2E8]'
                }`}>
                  {item.result.decision}
                </span>
              </div>
              <div className="text-[11px] text-[#687586] font-mono">
                t = {item.result.t_statistic.toFixed(2)}, p = {item.result.p_value.toFixed(4)}, α = {item.result.alpha}
              </div>
            </div>

            <button
              onClick={() => onRerun(item)}
              className="px-2.5 py-1 rounded bg-white hover:bg-[#F0F4F8] text-[#426B8A] border border-[#DDE2E8] transition flex items-center space-x-1 text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Load</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
