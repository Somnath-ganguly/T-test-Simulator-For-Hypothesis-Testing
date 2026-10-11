import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { Activity } from 'lucide-react';

export const DistributionChart = ({ result }) => {
  if (!result || !result.distribution_curve) return null;

  const {
    distribution_curve,
    t_statistic,
    df,
    critical_value_low,
    critical_value_high
  } = result;

  const chartData = distribution_curve.map((pt) => ({
    x: pt.x,
    density: pt.density,
    criticalDensity: pt.is_critical ? pt.density : 0,
    normalDensity: !pt.is_critical ? pt.density : 0
  }));

  return (
    <div className="bg-white border border-[#DDE2E8] rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#426B8A]" />
          <h3 className="text-sm font-semibold text-[#253449]">Theoretical T-Distribution & Rejection Regions</h3>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B54747]/80 inline-block"></span>
            <span className="text-[#687586]">Rejection Region (α)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-[#253449] inline-block"></span>
            <span className="text-[#687586]">Observed t ({t_statistic.toFixed(2)})</span>
          </div>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis 
              dataKey="x" 
              tickLine={false} 
              stroke="#94A3B8" 
              fontSize={11} 
              tickFormatter={(v) => v.toFixed(1)}
            />
            <YAxis tickLine={false} stroke="#94A3B8" fontSize={11} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-[#DDE2E8] p-2 rounded shadow-sm text-xs font-mono">
                      <div className="text-[#253449] font-bold">t = {data.x}</div>
                      <div className="text-[#687586]">Density = {data.density}</div>
                      {data.criticalDensity > 0 && (
                        <div className="text-[#B54747] text-[11px] font-sans font-medium mt-0.5">
                          In Rejection Region
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Main curve area */}
            <Area
              type="monotone"
              dataKey="density"
              stroke="#426B8A"
              strokeWidth={1.5}
              fill="#EBF2F7"
            />

            {/* Critical region shade overlay */}
            <Area
              type="monotone"
              dataKey="criticalDensity"
              stroke="#B54747"
              strokeWidth={1.5}
              fill="#FBEAEA"
            />

            {/* Vertical Reference Line for Observed T Statistic */}
            <ReferenceLine
              x={t_statistic}
              stroke="#253449"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `t = ${t_statistic.toFixed(2)}`,
                fill: '#253449',
                fontSize: 11,
                fontWeight: 'bold',
                position: 'top'
              }}
            />

            {critical_value_low !== null && (
              <ReferenceLine
                x={critical_value_low}
                stroke="#B54747"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}
            {critical_value_high !== null && (
              <ReferenceLine
                x={critical_value_high}
                stroke="#B54747"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-[#687586] bg-[#FAFAFC] p-2.5 rounded border border-[#E2E8F0]">
        Distribution curve for Student's t with <strong>df = {df.toFixed(2)}</strong>. 
        Statistical significance is achieved if the observed t-statistic falls inside the rejection region.
      </p>
    </div>
  );
};
