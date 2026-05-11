"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Map as MapIcon, GitCompare, BarChart3, Presentation, AlertTriangle, Save, FolderOpen, Zap, Cpu } from "lucide-react";
import DataUpload from "@/components/DataUpload";
import MapViewer from "@/components/MapViewer";
import OptimizerWizard from "@/components/OptimizerWizard";
import DashboardView from "@/components/DashboardView";
import ScenariosView from "@/components/ScenariosView";
import BusinessCaseView from "@/components/BusinessCaseView";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [baselineData, setBaselineData] = useState<any>(null);
  const [allHubsData, setAllHubsData] = useState<any[]>([]);
  
  // Scenarios state
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);

  const fetchBaseline = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/network/baseline`);
      if (response.ok) {
        const data = await response.json();
        setBaselineData(data.data);
      }
      const hubsRes = await fetch(`${API_URL}/api/network/hubs`);
      if (hubsRes.ok) {
        const hubsData = await hubsRes.json();
        setAllHubsData(hubsData.data.hubs);
      }
    } catch (e) {
      console.error("Failed to fetch baseline", e);
    }
  };

  const handleUploadSuccess = () => {
    setIsDataLoaded(true);
    fetchBaseline();
  };

  const handleOptimizationComplete = (data: any, scenarioName: string) => {
    const newScenario = { ...data, name: scenarioName, timestamp: new Date().toISOString() };
    setCurrentScenario(newScenario);
    
    setSavedScenarios(prev => {
      const exists = prev.findIndex(s => s.name === scenarioName);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = newScenario;
        return updated;
      }
      return [...prev, newScenario];
    });
    
    setActiveTab("dashboard");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans text-foreground">
      {/* Dynamic Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-logihub-violet/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-logihub-neon/10 blur-[100px] pointer-events-none" />
      
      {/* Header Navigation - V2 Premium */}
      <header className="glass-panel border-b border-logihub-border px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-5 py-5">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-logihub-neon/30 blur-md rounded-full" />
            <div className="w-12 h-12 bg-gradient-to-br from-logihub-neon to-logihub-violet rounded-xl flex items-center justify-center text-logihub-900 font-extrabold text-2xl relative z-10 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              <Zap className="w-6 h-6 text-logihub-900 fill-current" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">LOGIHUB<span className="text-logihub-neon font-light ml-1">V2</span></h1>
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-logihub-neon/70 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> Enterprise Engine
            </span>
          </div>
        </div>
        
        <nav className="flex h-full gap-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "map", label: "Network Map", icon: MapIcon },
            { id: "scenarios", label: "Scenarios", icon: GitCompare, count: savedScenarios.length },
            { id: "business_case", label: "Business Case", icon: Presentation }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                if (tab.id !== "dashboard" && tab.id !== "map" && !isDataLoaded) return;
                if (tab.id === "business_case" && savedScenarios.length === 0) return;
                setActiveTab(tab.id);
              }}
              className={`relative flex items-center gap-2 px-6 py-5 text-sm font-semibold transition-all duration-300
                ${activeTab === tab.id 
                  ? "text-logihub-neon bg-white/[0.03]" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                }
                ${(!isDataLoaded && tab.id !== "dashboard" && tab.id !== "map") || (tab.id === "business_case" && savedScenarios.length === 0) 
                  ? "opacity-30 cursor-not-allowed" : ""
                }
              `}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-logihub-neon" : ""}`} /> 
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-[10px] bg-logihub-violet/20 text-logihub-violet border border-logihub-violet/30 rounded-full font-bold">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-logihub-neon shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 flex flex-col lg:flex-row gap-8 max-w-[1920px] mx-auto w-full relative z-10">
        
        {/* Left Sidebar - The Cockpit Controls */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6 shrink-0">
          
          {/* 1. Data Status */}
          <div className="glass-panel rounded-2xl overflow-hidden group hover:border-logihub-neon/30 transition-colors duration-500">
            <div className="px-6 py-4 border-b border-logihub-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-gray-300">
                <FolderOpen className="w-4 h-4 text-logihub-violet" /> Connection
              </div>
              {isDataLoaded && <div className="w-2 h-2 rounded-full bg-logihub-success shadow-[0_0_8px_rgba(0,230,118,0.8)]" />}
            </div>
            <div className="p-6 bg-black/20">
              <DataUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
          
          {/* 2. Network Health Summary */}
          <div className={`glass-panel rounded-2xl overflow-hidden transition-all duration-500 ${!isDataLoaded ? "opacity-40 grayscale pointer-events-none" : "hover:border-logihub-neon/30"}`}>
            <div className="px-6 py-4 border-b border-logihub-border flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-gray-300">
                <AlertTriangle className="w-4 h-4 text-logihub-neon" /> Pulse
              </div>
              {baselineData && <span className="px-2 py-1 bg-logihub-neon/10 text-logihub-neon text-[10px] font-bold rounded uppercase tracking-wider border border-logihub-neon/20">Active</span>}
            </div>
            <div className="p-6 bg-black/20">
              {baselineData ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-logihub-border/50">
                    <span className="text-gray-400 text-sm">Active Hubs</span>
                    <span className="font-mono text-xl font-bold text-white">{baselineData.opened_hubs.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-logihub-border/50">
                    <span className="text-gray-400 text-sm">Coverage (150km)</span>
                    <span className="font-mono text-xl font-bold text-logihub-neon">{baselineData.metrics.coverage_within_150km_pct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Avg Lead Time</span>
                    <span className="font-mono text-xl font-bold text-logihub-violet">{baselineData.metrics.avg_lead_time_hrs.toFixed(1)} <span className="text-xs text-gray-500">hrs</span></span>
                  </div>
                </div>
              ) : (
                <div className="h-[120px] flex items-center justify-center border border-dashed border-logihub-border rounded-xl">
                  <p className="text-sm text-gray-500 font-mono">AWAITING_TELEMETRY</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Scenario Builder (Optimizer) */}
          <div className={`glass-panel rounded-2xl overflow-hidden transition-all duration-500 ${!isDataLoaded ? "opacity-40 grayscale pointer-events-none" : "hover:border-logihub-violet/30"}`}>
            <div className="px-6 py-4 border-b border-logihub-border bg-gradient-to-r from-logihub-violet/10 to-transparent">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-white">
                <Cpu className="w-4 h-4 text-logihub-violet" /> Simulator Engine
              </div>
            </div>
            <div className="p-6 bg-black/20">
              <OptimizerWizard 
                isEnabled={isDataLoaded} 
                onOptimizationComplete={handleOptimizationComplete} 
              />
            </div>
          </div>
        </div>

        {/* Right Content Area (Dashboard or Map) */}
        <div className="flex-1 flex flex-col min-h-[800px]">
          {activeTab === "dashboard" && (
            <DashboardView baseline={baselineData} optimized={currentScenario} />
          )}
          {activeTab === "scenarios" && (
            <ScenariosView baseline={baselineData} scenarios={savedScenarios} onLoadScenario={(s) => {setCurrentScenario(s); setActiveTab("dashboard");}} />
          )}
          {activeTab === "business_case" && (
            <BusinessCaseView baseline={baselineData} recommendedScenario={currentScenario || savedScenarios[0]} />
          )}
          {activeTab === "map" && (
            <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-logihub-border">
              <div className="px-6 py-5 border-b border-logihub-border flex justify-between items-center bg-black/40">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-logihub-neon" /> DIGITAL TWIN
                  </h2>
                  <p className="text-xs text-gray-400 font-mono mt-1 ml-7">Geospatial Projection Array</p>
                </div>
                <div className="flex gap-2 bg-black/50 p-1 rounded-lg border border-logihub-border">
                  <button 
                    onClick={() => setCurrentScenario(null)}
                    className={`px-5 py-2 text-xs font-bold uppercase rounded-md transition-all duration-300 ${!currentScenario ? 'bg-logihub-border text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-white'}`}
                  >
                    Baseline
                  </button>
                  <button 
                    disabled={!currentScenario}
                    className={`px-5 py-2 text-xs font-bold uppercase rounded-md transition-all duration-300 ${currentScenario ? 'bg-logihub-violet text-white shadow-[0_0_15px_rgba(138,43,226,0.4)]' : 'text-gray-600 cursor-not-allowed'}`}
                  >
                    Optimized
                  </button>
                </div>
              </div>
              <div className="flex-1 relative bg-[#0a0a0a]">
                <MapViewer result={currentScenario || baselineData} candidateHubs={allHubsData} />
                
                {/* HUD Overlay Map Borders */}
                <div className="absolute inset-0 pointer-events-none border-[20px] border-black/40 z-[400]" />
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-logihub-neon opacity-50 z-[401] pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-logihub-neon opacity-50 z-[401] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-logihub-neon opacity-50 z-[401] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-logihub-neon opacity-50 z-[401] pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
