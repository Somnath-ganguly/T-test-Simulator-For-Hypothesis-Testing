import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ErrorBar, 
  Cell,
  CartesianGrid
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export const MeanComparisonChart = ({ result }) => {
  if (!result) return null;

  const {
    label_a,
    label_b,
    mean_a,
    mean_b,
    sem_a,
    sem_b,
    n_b
  } = result;

  const data = [
    {
      group: label_a || 'Sample A',
      mean: mean_a,
      error: [mean_a - sem_a, mean_a + sem_a],
      sem: sem_a,
      color: '#426B8A'
    }
  ];

  if (n_b && mean_b !== null) {
    data.push({
      group: label_b || 'Sample B',
      mean: mean_b,
      error: [mean_b - sem_b, mean_b + sem_b],
      sem: sem_b,
      color: '#829AB1'
    });
  }

  return (
    <div className="bg-white border border-[#DDE2E8] rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-[#426B8A]" />
          <h3 className="text-sm font-semibold text-[#253449]">Group Means & SEM Error Bars</h3>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="group" tickLine={false} stroke="#94A3B8" fontSize={11} />
            <YAxis tickLine={false} stroke="#94A3B8" fontSize={11} domain={['auto', 'auto']} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-[#DDE2E8] p-2 rounded shadow-sm text-xs font-mono">
                      <div className="text-[#253449] font-bold">{item.group}</div>
                      <div className="text-[#426B8A]">Mean: {item.mean.toFixed(2)}</div>
                      <div className="text-[#687586]">SEM: ±{item.sem.toFixed(3)}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="mean" radius={[4, 4, 0, 0]} barSize={44}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.9} />
              ))}
              <ErrorBar dataKey="error" width={6} strokeWidth={1.5} stroke="#253449" />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
