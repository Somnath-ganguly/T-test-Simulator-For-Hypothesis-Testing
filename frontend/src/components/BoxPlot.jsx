import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid 
} from 'recharts';
import { BarChart2 } from 'lucide-react';

export const BoxPlot = ({ result }) => {
  if (!result || !result.histograms) return null;

  const { histograms, label_a, label_b, n_b } = result;

  return (
    <div className="bg-white border border-[#DDE2E8] rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-[#426B8A]" />
          <h3 className="text-sm font-semibold text-[#253449]">Sample Frequencies & Histogram Overlay</h3>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histograms} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="bin_center" tickLine={false} stroke="#94A3B8" fontSize={11} />
            <YAxis tickLine={false} stroke="#94A3B8" fontSize={11} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-[#DDE2E8] p-2 rounded shadow-sm text-xs">
                      <div className="text-[#687586] font-medium mb-1">
                        Bin Range: [{data.bin_start}, {data.bin_end}]
                      </div>
                      <div className="text-[#426B8A] font-semibold">
                        {label_a || 'Sample A'}: {data.count_a} observations
                      </div>
                      {n_b && (
                        <div className="text-[#687586] font-semibold mt-0.5">
                          {label_b || 'Sample B'}: {data.count_b} observations
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
            <Bar 
              dataKey="count_a" 
              name={label_a || 'Sample A'} 
              fill="#426B8A" 
              radius={[3, 3, 0, 0]} 
              opacity={0.85}
            />
            {n_b && (
              <Bar 
                dataKey="count_b" 
                name={label_b || 'Sample B'} 
                fill="#829AB1" 
                radius={[3, 3, 0, 0]} 
                opacity={0.85}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
