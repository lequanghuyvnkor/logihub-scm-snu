"use client";

import { CheckCircle, AlertTriangle, Eye } from "lucide-react";

interface ScenariosViewProps {
  baseline: any;
  scenarios: any[];
  onLoadScenario: (scenario: any) => void;
}

export default function ScenariosView({ baseline, scenarios, onLoadScenario }: ScenariosViewProps) {
  if (scenarios.length === 0) return null;

  const fmtCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const fmtNum = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

  // Find best scenarios
  let bestCostIdx = -1;
  let minCost = Infinity;
  let bestLeadTimeIdx = -1;
  let minLeadTime = Infinity;

  scenarios.forEach((s, idx) => {
    if (s.metrics.total_cost_usd < minCost) {
      minCost = s.metrics.total_cost_usd;
      bestCostIdx = idx;
    }
    if (s.metrics.avg_lead_time_hrs < minLeadTime) {
      minLeadTime = s.metrics.avg_lead_time_hrs;
      bestLeadTimeIdx = idx;
    }
  });

  return (
    <div className="flex-1 bg-logihub-panel border border-logihub-border shadow-sm flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-logihub-border bg-[#0a0a0a]">
        <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 bg-logihub-violet"></div>
          Scenario Comparison Matrix
        </h2>
        <p className="text-xs text-gray-400 font-medium mt-1">Compare KPIs across different simulated networks to find the optimal strategy.</p>
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-b-2 border-logihub-border font-bold text-gray-400 uppercase tracking-widest text-[10px]">KPI Metric</th>
              <th className="p-4 border-b-2 border-logihub-border border-r border-logihub-border bg-[#0a0a0a]">
                <div className="font-bold text-white uppercase tracking-wider text-sm">Baseline</div>
                <div className="text-[10px] text-gray-400 uppercase">Current Network</div>
              </th>
              {scenarios.map((s, i) => (
                <th key={i} className={`p-4 border-b-2 ${i === bestCostIdx ? 'border-maersk-blue bg-maersk-light/20' : 'border-logihub-border'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white uppercase tracking-wider text-sm">{s.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase">{s.opened_hubs.length} Hubs</div>
                    </div>
                    {i === bestCostIdx && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Recommended
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-logihub-border/50 hover:bg-[#0a0a0a]">
              <td className="p-4 font-bold text-gray-300 text-xs uppercase tracking-wider">Total Transport Cost</td>
              <td className="p-4 border-r border-logihub-border font-medium">{fmtCurrency(baseline.metrics.total_cost_usd)}</td>
              {scenarios.map((s, i) => (
                <td key={i} className={`p-4 font-bold ${i === bestCostIdx ? 'text-emerald-600 bg-maersk-light/10' : 'text-gray-100'}`}>
                  {fmtCurrency(s.metrics.total_cost_usd)}
                  <span className="block text-[10px] text-gray-400 font-medium mt-0.5">
                    {(((s.metrics.total_cost_usd - baseline.metrics.total_cost_usd) / baseline.metrics.total_cost_usd) * 100).toFixed(1)}% vs base
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-b border-logihub-border/50 hover:bg-[#0a0a0a]">
              <td className="p-4 font-bold text-gray-300 text-xs uppercase tracking-wider">Avg Lead Time</td>
              <td className="p-4 border-r border-logihub-border font-medium">{fmtNum(baseline.metrics.avg_lead_time_hrs)} hrs</td>
              {scenarios.map((s, i) => (
                <td key={i} className={`p-4 font-bold ${i === bestLeadTimeIdx ? 'text-logihub-neon' : 'text-gray-100'}`}>
                  {fmtNum(s.metrics.avg_lead_time_hrs)} hrs
                </td>
              ))}
            </tr>
            <tr className="border-b border-logihub-border/50 hover:bg-[#0a0a0a]">
              <td className="p-4 font-bold text-gray-300 text-xs uppercase tracking-wider">Service Coverage (150km)</td>
              <td className="p-4 border-r border-logihub-border font-medium">{fmtNum(baseline.metrics.coverage_within_150km_pct)}%</td>
              {scenarios.map((s, i) => (
                <td key={i} className="p-4 font-bold text-gray-100">
                  {fmtNum(s.metrics.coverage_within_150km_pct)}%
                </td>
              ))}
            </tr>
            <tr className="border-b border-logihub-border/50 hover:bg-[#0a0a0a]">
              <td className="p-4 font-bold text-gray-300 text-xs uppercase tracking-wider">Estimated CO₂</td>
              <td className="p-4 border-r border-logihub-border font-medium">{fmtNum(baseline.metrics.co2_emissions_kg)} kg</td>
              {scenarios.map((s, i) => (
                <td key={i} className="p-4 font-bold text-gray-100">
                  {fmtNum(s.metrics.co2_emissions_kg)} kg
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4"></td>
              <td className="p-4 border-r border-logihub-border"></td>
              {scenarios.map((s, i) => (
                <td key={i} className="p-4">
                  <button 
                    onClick={() => onLoadScenario(s)}
                    className="w-full py-2 bg-logihub-panel border border-maersk-blue text-white font-bold uppercase text-[10px] tracking-wider hover:bg-logihub-violet hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3 h-3" /> View on Map
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
