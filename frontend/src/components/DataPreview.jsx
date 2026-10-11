import React from 'react';
import { Table } from 'lucide-react';

export const DataPreview = ({ result }) => {
  if (!result) return null;

  const {
    label_a,
    label_b,
    n_a,
    mean_a,
    std_a,
    n_b,
    mean_b,
    std_b,
    sem_a,
    sem_b
  } = result;

  return (
    <div className="bg-white border border-[#DDE2E8] rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex items-center space-x-2">
        <Table className="w-4 h-4 text-[#426B8A]" />
        <h3 className="text-sm font-semibold text-[#253449]">Descriptive Sample Statistics</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#FAFAFC] border border-[#E2E8F0] p-3 rounded-md">
          <div className="text-xs font-semibold text-[#426B8A] uppercase tracking-wider mb-2">
            {label_a || 'Sample A'}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded border border-[#DDE2E8]">
              <span className="text-[#687586] block text-[10px]">Size (n)</span>
              <span className="font-semibold text-[#253449]">{n_a}</span>
            </div>
            <div className="bg-white p-2 rounded border border-[#DDE2E8]">
              <span className="text-[#687586] block text-[10px]">Mean (x̄)</span>
              <span className="font-semibold text-[#253449]">{mean_a.toFixed(2)}</span>
            </div>
            <div className="bg-white p-2 rounded border border-[#DDE2E8]">
              <span className="text-[#687586] block text-[10px]">Std Dev (s)</span>
              <span className="font-semibold text-[#253449]">{std_a.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {n_b && (
          <div className="bg-[#FAFAFC] border border-[#E2E8F0] p-3 rounded-md">
            <div className="text-xs font-semibold text-[#426B8A] uppercase tracking-wider mb-2">
              {label_b || 'Sample B'}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded border border-[#DDE2E8]">
                <span className="text-[#687586] block text-[10px]">Size (n)</span>
                <span className="font-semibold text-[#253449]">{n_b}</span>
              </div>
              <div className="bg-white p-2 rounded border border-[#DDE2E8]">
                <span className="text-[#687586] block text-[10px]">Mean (x̄)</span>
                <span className="font-semibold text-[#253449]">{mean_b.toFixed(2)}</span>
              </div>
              <div className="bg-white p-2 rounded border border-[#DDE2E8]">
                <span className="text-[#687586] block text-[10px]">Std Dev (s)</span>
                <span className="font-semibold text-[#253449]">{std_b.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
