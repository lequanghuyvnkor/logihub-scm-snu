"use client";

import { FileText, Download, CheckCircle, Clock, Building, ArrowRight } from "lucide-react";

interface BusinessCaseViewProps {
  baseline: any;
  recommendedScenario: any;
}

export default function BusinessCaseView({ baseline, recommendedScenario }: BusinessCaseViewProps) {
  if (!recommendedScenario) return null;

  const fmtCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const fmtNum = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

  const costSavings = baseline.metrics.total_cost_usd - recommendedScenario.metrics.total_cost_usd;
  const costSavingsPct = (costSavings / baseline.metrics.total_cost_usd) * 100;
  
  const leadTimeImp = baseline.metrics.avg_lead_time_hrs - recommendedScenario.metrics.avg_lead_time_hrs;
  const co2Imp = baseline.metrics.co2_emissions_kg - recommendedScenario.metrics.co2_emissions_kg;

  return (
    <div className="flex-1 bg-logihub-panel border border-logihub-border shadow-sm flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
      <div className="px-8 py-6 border-b border-logihub-border bg-logihub-900 flex justify-between items-center text-white">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center gap-3">
            <FileText className="w-6 h-6 text-logihub-neon" />
            Executive Business Case
          </h2>
          <p className="text-sm text-gray-300 font-medium mt-1">Network Redesign Proposal: {recommendedScenario.name}</p>
        </div>
        <button className="flex items-center gap-2 bg-logihub-violet text-white px-4 py-2 font-bold uppercase tracking-wider text-xs hover:bg-[#3298BA] transition-colors">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      <div className="p-8 overflow-y-auto space-y-8 text-gray-300">
        {/* 1. Executive Summary */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-logihub-neon mb-4 border-b border-logihub-border/50 pb-2">1. Executive Summary</h3>
          <p className="text-sm leading-relaxed text-gray-300">
            This proposal outlines the strategic redesign of our national logistics network. By transitioning from the current baseline network to the proposed <strong>{recommendedScenario.name}</strong> configuration, the company expects to achieve a <strong className="text-emerald-600">{costSavingsPct.toFixed(1)}% reduction</strong> in total annual transport costs, equating to projected savings of <strong>{fmtCurrency(costSavings)}</strong>.
          </p>
          <p className="text-sm leading-relaxed text-gray-300 mt-2">
            Beyond cost savings, this scenario improves average delivery lead times by <strong>{fmtNum(leadTimeImp)} hours</strong> and aligns with our corporate sustainability goals by reducing carbon emissions by <strong>{fmtNum(co2Imp)} kg</strong>.
          </p>
        </section>

        {/* 2. Key Impacts */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-logihub-neon mb-4 border-b border-logihub-border/50 pb-2">2. Projected Impact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] p-4 border border-logihub-border/50">
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Financial Impact</div>
              <div className="text-xl font-bold text-emerald-600">-{costSavingsPct.toFixed(1)}% Cost</div>
              <div className="text-xs text-gray-400 mt-1">Save {fmtCurrency(costSavings)}</div>
            </div>
            <div className="bg-[#0a0a0a] p-4 border border-logihub-border/50">
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Service Impact</div>
              <div className="text-xl font-bold text-logihub-neon">-{fmtNum(leadTimeImp)} Hrs</div>
              <div className="text-xs text-gray-400 mt-1">Faster average delivery</div>
            </div>
            <div className="bg-[#0a0a0a] p-4 border border-logihub-border/50">
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Sustainability</div>
              <div className="text-xl font-bold text-white">-{fmtNum(co2Imp)} kg</div>
              <div className="text-xs text-gray-400 mt-1">Carbon emission reduction</div>
            </div>
          </div>
        </section>

        {/* 3. Proposed Hubs */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-logihub-neon mb-4 border-b border-logihub-border/50 pb-2">3. Recommended Hub Locations</h3>
          <div className="grid grid-cols-2 gap-3">
            {recommendedScenario.opened_hubs.map((hub: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-logihub-border">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-bold text-sm text-white">{hub.id}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Lat: {hub.lat.toFixed(2)}, Lon: {hub.lon.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Approval Workflow */}
        <section className="pt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-logihub-neon mb-4 border-b border-logihub-border/50 pb-2">4. Approval Workflow</h3>
          <div className="flex items-center gap-4 bg-maersk-light/30 p-5 border border-maersk-light">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Drafted</span>
            </div>
            <div className="flex-1 h-0.5 bg-emerald-500"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mb-2 animate-pulse">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase text-logihub-warning">Pending Finance</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300"></div>
            <div className="flex flex-col items-center opacity-50">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center mb-2">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Exec Approval</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
