"use client";

import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Package, Truck, CloudRain, Clock, Ship } from "lucide-react";

interface DashboardViewProps {
  baseline: any;
  optimized: any;
}

export default function DashboardView({ baseline, optimized }: DashboardViewProps) {
  if (!baseline) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-logihub-panel border border-logihub-border">
        <div className="w-16 h-16 bg-[#111111] flex items-center justify-center mb-4">
          <Ship className="w-8 h-8 text-logihub-neon" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">Waiting for Data</h2>
        <p className="text-gray-400 mt-2 max-w-md text-center text-sm">
          Upload your logistics data to generate the current network baseline and start simulating scenarios.
        </p>
      </div>
    );
  }

  // Helper to format currency
  const fmtCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const fmtNum = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

  // Compare helper
  const getChange = (base: number, opt: number, isLowerBetter: boolean = true) => {
    if (!opt || base === 0) return null;
    const pct = ((opt - base) / base) * 100;
    const isGood = isLowerBetter ? pct < 0 : pct > 0;
    return {
      value: Math.abs(pct),
      isGood,
      raw: pct
    };
  };

  const renderKPICard = (title: string, icon: any, baseValue: number, optValue: number | undefined, formatFn: (v: number) => string, isLowerBetter: boolean = true) => {
    const change = optValue !== undefined ? getChange(baseValue, optValue, isLowerBetter) : null;
    
    return (
      <div className="bg-logihub-panel p-5 border border-logihub-border shadow-sm flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-logihub-violet transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</span>
          <div className="text-logihub-neon">
            {icon}
          </div>
        </div>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{formatFn(optValue ?? baseValue)}</span>
          </div>
          
          {change ? (
            <div className={`flex items-center gap-1 mt-2 text-[11px] font-bold uppercase tracking-wider ${change.isGood ? 'text-emerald-600' : 'text-logihub-danger'}`}>
              {change.raw > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change.value.toFixed(1)}% vs baseline
            </div>
          ) : (
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-2">Baseline metric</div>
          )}
        </div>
      </div>
    );
  };

  const bMetrics = baseline.metrics;
  const oMetrics = optimized?.metrics;

  // Find top expensive lanes from baseline
  const topLanes = [...baseline.assignments]
    .sort((a, b) => b.distance_km - a.distance_km)
    .slice(0, 4);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
      {/* 1. Executive KPI Summary */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 bg-logihub-violet"></div>
          Executive Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {renderKPICard("Total Cost", <Truck className="w-5 h-5"/>, bMetrics.total_cost_usd, oMetrics?.total_cost_usd, fmtCurrency)}
          {renderKPICard("Lead Time", <Clock className="w-5 h-5"/>, bMetrics.avg_lead_time_hrs, oMetrics?.avg_lead_time_hrs, (v) => `${fmtNum(v)} hrs`)}
          {renderKPICard("Service (150km)", <CheckCircle className="w-5 h-5"/>, bMetrics.coverage_within_150km_pct, oMetrics?.coverage_within_150km_pct, (v) => `${fmtNum(v)}%`, false)}
          {renderKPICard("CO₂ Emissions", <CloudRain className="w-5 h-5"/>, bMetrics.co2_emissions_kg, oMetrics?.co2_emissions_kg, (v) => `${fmtNum(v)} kg`)}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 2. Current vs Optimized Comparison Table */}
        <div className="xl:col-span-2 bg-logihub-panel border border-logihub-border shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-logihub-border bg-[#0a0a0a] flex justify-between items-center">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-logihub-violet"></div>
              Current vs Optimized Network
            </h2>
            {optimized && (
              <span className="px-2 py-0.5 bg-logihub-violet text-white text-[10px] font-bold uppercase tracking-wider">
                Active Scenario: {optimized.name}
              </span>
            )}
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-logihub-panel text-gray-400 uppercase text-[10px] tracking-widest border-b border-logihub-border">
                <tr>
                  <th className="px-5 py-3 font-bold">Metric</th>
                  <th className="px-5 py-3 font-bold text-right">Baseline</th>
                  <th className="px-5 py-3 font-bold text-right text-white bg-maersk-light/30">Optimized</th>
                  <th className="px-5 py-3 font-bold text-right">Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-logihub-border/50">
                  <td className="px-5 py-3 font-medium text-gray-300">Active Hubs</td>
                  <td className="px-5 py-3 text-right">{baseline.opened_hubs?.length || "-"}</td>
                  <td className="px-5 py-3 text-right font-bold text-logihub-neon bg-maersk-light/30">{optimized?.opened_hubs ? optimized.opened_hubs.length : (optimized?.error ? "Error" : "-")}</td>
                  <td className="px-5 py-3 text-right font-medium">-</td>
                </tr>
                <tr className="border-b border-logihub-border/50">
                  <td className="px-5 py-3 font-medium text-gray-300">Total Distance Cost</td>
                  <td className="px-5 py-3 text-right">{baseline.total_cost ? fmtNum(baseline.total_cost) : "-"} km-t</td>
                  <td className="px-5 py-3 text-right font-bold text-logihub-neon bg-maersk-light/30">{optimized?.total_cost ? fmtNum(optimized.total_cost) + " km-t" : "-"}</td>
                  <td className="px-5 py-3 text-right">
                    {optimized?.total_cost ? (
                      <span className="text-emerald-600 font-bold text-xs uppercase">
                        {getChange(baseline.total_cost, optimized.total_cost)?.value.toFixed(1)}% save
                      </span>
                    ) : "-"}
                  </td>
                </tr>
                <tr className="border-b border-logihub-border/50">
                  <td className="px-5 py-3 font-medium text-gray-300">Average Distance</td>
                  <td className="px-5 py-3 text-right">{bMetrics ? fmtNum(bMetrics.avg_distance_km) : "-"} km</td>
                  <td className="px-5 py-3 text-right font-bold text-logihub-neon bg-maersk-light/30">{oMetrics ? fmtNum(oMetrics.avg_distance_km) + " km" : "-"}</td>
                  <td className="px-5 py-3 text-right">
                    {(bMetrics && oMetrics) ? (
                      <span className="text-emerald-600 font-bold text-xs uppercase">
                        -{fmtNum(bMetrics.avg_distance_km - oMetrics.avg_distance_km)} km
                      </span>
                    ) : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {(optimized && !optimized.error && bMetrics && oMetrics) && (
            <div className="p-4 bg-logihub-900 text-white text-sm">
              <span className="font-bold uppercase tracking-wider text-logihub-neon block mb-1 text-[10px]">Decision Support</span>
              By redesigning the network to the <span className="font-bold">{optimized.name}</span> scenario, total transport costs are reduced by <span className="font-bold text-logihub-neon">{getChange(bMetrics.total_cost_usd, oMetrics.total_cost_usd)?.value.toFixed(1)}%</span>.
            </div>
          )}
          {optimized?.error && (
            <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 text-sm">
              <span className="font-bold uppercase tracking-wider block mb-1 text-[10px]">Optimization Failed</span>
              The algorithm could not find a feasible solution. Error: {optimized.error}. Tip: Try increasing the number of Hubs (P) or expanding the capacity constraints.
            </div>
          )}
        </div>

        {/* 3. Top Network Alerts */}
        <div className="bg-logihub-panel border border-logihub-border shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-logihub-border bg-[#0a0a0a] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500"></div>
              Current Bottlenecks
            </h2>
          </div>
          <div className="p-5 flex-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Top Expensive Lanes (Baseline)</h3>
            <div className="space-y-4">
              {topLanes.map((lane: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center border-b border-logihub-border/50 pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-bold text-sm text-white">{lane.hub_id} <span className="text-logihub-neon mx-1">→</span> {lane.region_id}</div>
                    <div className="text-[10px] text-logihub-warning mt-0.5 font-bold uppercase">High transport distance</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-gray-100">{fmtNum(lane.distance_km)} km</div>
                    <div className="text-[10px] text-gray-400 font-medium">{fmtNum(lane.demand_tons)} tons</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

