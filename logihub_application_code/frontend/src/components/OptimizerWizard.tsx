"use client";

import { useState } from "react";
import { Zap, Settings, Play, Loader2, Info, Save } from "lucide-react";

interface OptimizerWizardProps {
  isEnabled: boolean;
  onOptimizationComplete: (result: any, scenarioName: string) => void;
}

export default function OptimizerWizard({ isEnabled, onOptimizationComplete }: OptimizerWizardProps) {
  const [method, setMethod] = useState<"p-median" | "cflp" | "uflp" | "mclp">("p-median");
  const [pCount, setPCount] = useState(5);
  const [radius, setRadius] = useState(150);
  const [storageType, setStorageType] = useState<string>("All");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const STORAGE_TYPES = [
    "All",
    "Fresh_Food",
    "FMCG_Packaged",
    "Pharmaceuticals",
    "Industrial_Materials",
    "Durables_Electronics",
    "Ecommerce_Misc",
  ];

  const handleOptimize = async () => {
    setRunning(true);
    setError(null);

    try {
      const endpoint = `/api/optimize/${method}`;
      const formData = new FormData();
      
      if (storageType !== "All") {
        formData.append("storage_type", storageType);
      }
      
      if (method === "p-median" || method === "mclp") {
        formData.append("p", pCount.toString());
      }
      if (method === "mclp") {
        formData.append("radius", radius.toString());
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Optimization failed");
      }

      const data = await response.json();
      
      let scenarioName = "";
      if (method === "p-median") scenarioName = `P-Median (${pCount} Hubs)`;
      else if (method === "cflp") scenarioName = "CFLP (Capacitated)";
      else if (method === "uflp") scenarioName = "UFLP (Uncapacitated)";
      else if (method === "mclp") scenarioName = `MCLP (${pCount} Hubs, ${radius}km)`;
      
      if (storageType !== "All") {
        scenarioName += ` [${storageType}]`;
      }
      
      onOptimizationComplete(data.data, scenarioName);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={`transition-opacity ${!isEnabled ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
      <div className="space-y-5">
        <div>
          <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">Filter by Industry / Storage</label>
          <select 
            value={storageType}
            onChange={(e) => setStorageType(e.target.value)}
            className="w-full border border-logihub-border p-2 text-sm bg-logihub-panel text-white font-medium outline-none focus:border-maersk-blue"
          >
            {STORAGE_TYPES.map(st => (
              <option key={st} value={st}>{st === "All" ? "All Industry Types (No Filter)" : st}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">Optimization Model</label>
          <div className="grid grid-cols-2 gap-0 border border-logihub-border">
            <button
              onClick={() => setMethod("p-median")}
              className={`py-2 px-2 text-xs font-bold transition-colors border-b border-r border-logihub-border ${
                method === "p-median" ? "bg-logihub-violet text-white" : "bg-logihub-panel text-gray-400 hover:bg-[#0a0a0a]"
              }`}
            >
              P-Median
            </button>
            <button
              onClick={() => setMethod("cflp")}
              className={`py-2 px-2 text-xs font-bold transition-colors border-b border-logihub-border ${
                method === "cflp" ? "bg-logihub-violet text-white" : "bg-logihub-panel text-gray-400 hover:bg-[#0a0a0a]"
              }`}
            >
              CFLP
            </button>
            <button
              onClick={() => setMethod("uflp")}
              className={`py-2 px-2 text-xs font-bold transition-colors border-r border-logihub-border ${
                method === "uflp" ? "bg-logihub-violet text-white" : "bg-logihub-panel text-gray-400 hover:bg-[#0a0a0a]"
              }`}
            >
              UFLP
            </button>
            <button
              onClick={() => setMethod("mclp")}
              className={`py-2 px-2 text-xs font-bold transition-colors ${
                method === "mclp" ? "bg-logihub-violet text-white" : "bg-logihub-panel text-gray-400 hover:bg-[#0a0a0a]"
              }`}
            >
              MCLP
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
            <Info className="w-3 h-3 text-logihub-neon" /> 
            {method === "p-median" ? "Minimizes total distance for P hubs without capacity limits." :
             method === "cflp" ? "Optimizes flows considering capacity and fixed costs." :
             method === "uflp" ? "Determines optimal hub count minimizing fixed + transport costs." :
             "Maximizes covered demand within a specific radius."}
          </p>
        </div>

        {(method === "p-median" || method === "mclp") && (
          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">Number of Hubs (P)</label>
            <input
              type="range"
              min="1"
              max="20"
              value={pCount}
              onChange={(e) => setPCount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 appearance-none cursor-pointer accent-maersk-blue"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
              <span>1</span>
              <span className="font-bold text-logihub-neon">{pCount} hubs selected</span>
              <span>20</span>
            </div>
          </div>
        )}

        {method === "mclp" && (
          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">Coverage Radius</label>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 appearance-none cursor-pointer accent-maersk-blue"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
              <span>50km</span>
              <span className="font-bold text-logihub-neon">{radius} km SLA target</span>
              <span>300km</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleOptimize}
          disabled={running || !isEnabled}
          className="w-full bg-logihub-900 text-white py-3 px-4 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 hover:bg-[#001829] transition-colors disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-logihub-neon" /> Solving Algorithm...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Run & Save Scenario
            </>
          )}
        </button>
      </div>
    </div>
  );
}
