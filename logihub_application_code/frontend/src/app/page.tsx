"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Map as MapIcon, GitCompare, BarChart3, Presentation, AlertTriangle, Save, FolderOpen } from "lucide-react";
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
    
    // Auto-save the scenario
    setSavedScenarios(prev => {
      // Don't save if one with same name exists, update instead
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
    <div className="min-h-screen bg-maersk-gray flex flex-col font-sans text-maersk-darkgray">
      {/* Header Navigation - Maersk Style */}
      <header className="bg-maersk-navy border-b border-maersk-blue/30 px-6 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 bg-maersk-blue flex items-center justify-center text-white font-bold text-2xl" style={{clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'}}>
            <span className="mr-1">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">LogiHub Intelligence</h1>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-maersk-blue">Enterprise Decision Cockpit</span>
          </div>
        </div>
        
        <nav className="flex h-full text-white/80">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-4 ${activeTab === "dashboard" ? "border-maersk-blue text-white" : "border-transparent hover:text-white hover:bg-white/5"}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Manager Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-4 ${activeTab === "map" ? "border-maersk-blue text-white" : "border-transparent hover:text-white hover:bg-white/5"}`}
          >
            <MapIcon className="w-4 h-4" /> Network Map
          </button>
          <button 
            onClick={() => isDataLoaded && setActiveTab("scenarios")}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-4 ${!isDataLoaded ? "opacity-50 cursor-not-allowed" : activeTab === "scenarios" ? "border-maersk-blue text-white" : "border-transparent hover:text-white hover:bg-white/5"}`}
          >
            <GitCompare className="w-4 h-4" /> Scenarios 
            {savedScenarios.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-maersk-blue text-white rounded-full">{savedScenarios.length}</span>}
          </button>
          <button 
            onClick={() => isDataLoaded && savedScenarios.length > 0 && setActiveTab("business_case")}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-4 ${!isDataLoaded || savedScenarios.length === 0 ? "opacity-50 cursor-not-allowed" : activeTab === "business_case" ? "border-maersk-blue text-white" : "border-transparent hover:text-white hover:bg-white/5"}`}
          >
            <Presentation className="w-4 h-4" /> Business Case
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-w-[1800px] mx-auto w-full">
        
        {/* Left Sidebar - The Cockpit Controls */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
          
          {/* 1. Data Status */}
          <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-maersk-navy text-white font-semibold text-sm tracking-wide uppercase flex items-center gap-2">
              <FolderOpen className="w-4 h-4" /> Data Connection
            </div>
            <div className="p-5">
              <DataUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
          
          {/* 2. Network Health Summary */}
          <div className={`bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden transition-opacity ${!isDataLoaded ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="px-5 py-3 bg-maersk-navy text-white font-semibold text-sm tracking-wide uppercase flex justify-between items-center">
              <span>Network Health</span>
              {baselineData && <span className="text-maersk-blue flex items-center gap-1 text-[10px]"><AlertTriangle className="w-3 h-3"/> Active</span>}
            </div>
            <div className="p-5">
              {baselineData ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Current active hubs</span>
                    <span className="font-bold text-maersk-navy">{baselineData.opened_hubs.length} hubs</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Service Coverage (150km)</span>
                    <span className="font-bold text-amber-600">{baselineData.metrics.coverage_within_150km_pct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Lead Time</span>
                    <span className="font-bold text-rose-600">{baselineData.metrics.avg_lead_time_hrs.toFixed(1)} hrs</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Waiting for data...</p>
              )}
            </div>
          </div>

          {/* 3. Scenario Builder (Optimizer) */}
          <div className={`bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden transition-opacity ${!isDataLoaded ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="px-5 py-3 bg-maersk-navy text-white font-semibold text-sm tracking-wide uppercase">
              Scenario Simulator
            </div>
            <div className="p-5">
              <OptimizerWizard 
                isEnabled={isDataLoaded} 
                onOptimizationComplete={handleOptimizationComplete} 
              />
            </div>
          </div>
        </div>

        {/* Right Content Area (Dashboard or Map) */}
        <div className="flex-1 flex flex-col min-h-[700px]">
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
            <div className="flex-1 bg-white shadow-sm border border-gray-200 p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-maersk-navy tracking-tight uppercase">Logistics Digital Twin</h2>
                  <p className="text-xs text-gray-500 font-medium">Geospatial Visualization & Network Drill-down</p>
                </div>
                <div className="flex gap-2 bg-maersk-gray p-1">
                  <button 
                    onClick={() => setCurrentScenario(null)}
                    className={`px-4 py-1.5 text-sm font-bold uppercase transition-all ${!currentScenario ? 'bg-white text-maersk-navy border border-gray-300' : 'text-gray-500 hover:text-maersk-navy'}`}
                  >
                    Baseline
                  </button>
                  <button 
                    disabled={!currentScenario}
                    className={`px-4 py-1.5 text-sm font-bold uppercase transition-all ${currentScenario ? 'bg-maersk-navy text-white' : 'text-gray-400 cursor-not-allowed'}`}
                  >
                    Optimized
                  </button>
                </div>
              </div>
              <div className="flex-1 relative border border-gray-200 bg-gray-50">
                <MapViewer result={currentScenario || baselineData} candidateHubs={allHubsData} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
